const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Student = require('../models/Student');
const Batch = require('../models/Batch');
const StudentBatch = require("../models/StudentBatch");

const authMiddleware = require('../middleware/auth');
const { studentSchema } = require('../validators/student.schema');
const { studentUpdateSchema } = require('../validators/student.update.schema');
const { pushJob } = require('../services/syncQueue');

// ADD STUDENT
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { error, value } = studentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

//     console.log("RAW BODY:", req.body);
// console.log("VALIDATED VALUE:", value);

    const { name, standard, aadhar, phone, batches } = value;

    // Validate batch from Mongo (NOT Sheets)
    // extract all batchIds
    const batchIds = batches.map(b => b.batchId);

    // fetch valid batches
    const validBatches = await Batch.find({
      _id: { $in: batchIds },
      ownerId: req.user.id
    }).select('_id');

    // compare counts
    if (validBatches.length !== batchIds.length) {
      return res.status(400).json({
        error: "One or more batchIds are invalid"
      });
    }

    //  Create student in Mongo
    const student = await Student.create({
      name,
      standard,
      aadharNumber: aadhar,
      phone,
      ownerId: req.user.id
    });

    // console.log(batches);
    // console.log("Type of batches:", typeof batches);
// console.log("Is array:", Array.isArray(batches));

    if (batches && batches.length > 0) {
      // console.log(" BEFORE INSERT");
      const enrollments = batches.map(b => ({
        studentId: student._id,
        batchId: b.batchId,
        fees: b.batchFees,
        ownerId: req.user.id
      }));

      await StudentBatch.insertMany(enrollments);
    }

    //  fallback (old system support)
    else if (req.body.batchId) {
      await StudentBatch.create({
        studentId: student._id,
        batchId: req.body.batchId,
        fees: req.body.batchFees,
        ownerId: req.user.id
      });
    }
    //  Async sync (placeholder)
    // syncQueue.push({ type: "CREATE_STUDENT", data: student });
    pushJob({
      type: "CREATE_STUDENT",
      userId: req.user.id,
      data: student
    });

    res.json({
      message: "Student added",
      student
    });

  } catch (err) {
    // console.error(err);
    res.status(500).json({ message: "Error adding student" });
  }
});

router.put('/update/:id', authMiddleware, async (req, res) => {
  try {
    const studentId = req.params.id;

    const { error, value } = studentUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        errors: error.details.map(e => e.message)
      });
    }

    const student = await Student.findOne({
      _id: studentId,
      ownerId: req.user.id
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    Object.assign(student, {
      name: value.name ?? student.name,
      standard: value.standard ?? student.standard,
      aadharNumber: value.aadhar ?? student.aadharNumber,
      phone: value.phone ?? student.phone
    });

    await student.save();

    //  Async sync
    // syncQueue.push({ type: "UPDATE_STUDENT", data: student });
    pushJob({
      type: "UPDATE_STUDENT",
      userId: req.user.id,
      data: student
    });

    res.json({
      message: "Student updated",
      student
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get('/list', authMiddleware, async (req, res) => {

  try {
    // console.log(typeof req.user.id);
    const ownerId = new mongoose.Types.ObjectId(req.user.id);
    const students = await Student.aggregate([
    {
      $match: {
        ownerId
      }
    },

    {
      $lookup: {
        from: "studentbatches",
        localField: "_id",
        foreignField: "studentId",
        as: "enrollments"
      }
    },

    {
      $unwind: {
        path: "$enrollments",
        preserveNullAndEmptyArrays: true
      }
    },

    {
      $lookup: {
        from: "batches",
        localField: "enrollments.batchId",
        foreignField: "_id",
        as: "batch"
      }
    },

    {
      $unwind: {
        path: "$batch",
        preserveNullAndEmptyArrays: true
      }
    },

    {
      $group: {
        _id: "$_id",

        name: { $first: "$name" },
        standard: { $first: "$standard" },
        phone: { $first: "$phone" },
        aadharNumber: { $first: "$aadharNumber" },

        batches: {
          $push: {
            batchId: "$batch._id",
            name: "$batch.name",
            fees: "$enrollments.fees",
            batchFees: "$batch.batchFees",
            status: "$enrollments.status"
          }
        }
      }
    },

    // REMOVE EMPTY BATCH OBJECTS
    {
      $project: {
        name: 1,
        standard: 1,
        phone: 1,
        aadharNumber: 1,

        batches: {
          $filter: {
            input: "$batches",
            as: "b",
            cond: {
              $ne: [
                { $ifNull: ["$$b.batchId", null] },
                null
              ]
            }
          }
        }
      }
    }
  ]);

    // console.log(students);
    res.json(students);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching students" });
  }
});


router.put('/leave/:id', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.params.id,
      ownerId: req.user.id
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (student.status === "LEFT") {
      return res.status(400).json({
        error: "Student already LEFT"
      });
    }

    student.status = "LEFT";
    student.leaveDate = new Date();

    
    const updateBatch = await StudentBatch.updateMany(
      {
        ownerId: req.user.id,
        studentId: req.params.id
      },
      {
        status: "LEFT",
        leftAt: Date.now()
      },
      { new : true }
    );
    
    await student.save();

    //  Async sync
    // syncQueue.push({ type: "LEAVE_STUDENT", data: student });
    pushJob({
      type: "LEAVE_STUDENT",
      userId: req.user.id,
      data: student
    });

    res.json({
      message: "Student marked as LEFT",
      student
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});



router.put('/leave-batch', authMiddleware, async (req, res) => {
  try {
    const { studentId, batchId } = req.body;

    if (!studentId || !batchId) {
      return res.status(400).json({ error: "Missing data" });
    }

    const updated = await StudentBatch.findOneAndUpdate(
      {
        studentId: new mongoose.Types.ObjectId(studentId),
        batchId: new mongoose.Types.ObjectId(batchId),
        ownerId: new mongoose.Types.ObjectId(req.user.id)
      },
      {
        status: "LEFT",
        leftAt: new Date()
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    res.json({ message: "Batch left successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error leaving batch" });
  }
});

router.delete('/delete-batch',authMiddleware,async (req,res) => {
  try {
    const { studentId, batchId } = req.body;

    const studentObjId = new mongoose.Types.ObjectId(studentId);
    const batchObjId = new mongoose.Types.ObjectId(batchId);
    const ownerObjId = new mongoose.Types.ObjectId(req.user.id);

    const responce = await StudentBatch.deleteOne(
      {
        studentId: studentObjId,
        batchId: batchObjId,
        ownerId: ownerObjId,
      },
      {
        status: "LEFT"
      }
    );

    res.json({ message: "Batch removed succesfully"});
  }
  catch(e) {
    res.status(404).json({ message: "Error in deleting batch"})
  }
})

router.post('/enroll', authMiddleware, async (req, res) => {
  try {
    const { studentId, batchId, fees } = req.body;

    const studentObjId = new mongoose.Types.ObjectId(studentId);
    const batchObjId = new mongoose.Types.ObjectId(batchId);
    const ownerObjId = new mongoose.Types.ObjectId(req.user.id);

    //  get batch (for default fee)
    const batch = await Batch.findOne({
      _id: batchObjId,
      ownerId: ownerObjId
    });

    if (!batch) {
      return res.status(400).json({ error: "Batch not found" });
    }

    // prevent duplicate
    const exists = await StudentBatch.findOne({
      studentId: studentObjId,
      batchId: batchObjId,
      ownerId: ownerObjId,
      // status: "ACTIVE"
    });

    if (exists) {
      return res.status(400).json({ error: "Already enrolled" });
    }

    await StudentBatch.create({
      studentId: studentObjId,
      batchId: batchObjId,
      fees: fees != null ? Number(fees) : batch.batchFees, //  KEY LINE
      ownerId: ownerObjId
    });

    res.json({ message: "Batch added" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error adding batch" });
  }
});

module.exports = router;