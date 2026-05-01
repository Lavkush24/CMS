const express = require('express');
const router = express.Router();

const Batch = require('../models/Batch');
const Teacher = require('../models/Teacher');
const BatchTeacher = require('../models/BatchTeacher');
const { pushJob } = require('../services/syncQueue');
const authMiddleware = require('../middleware/authmiddleware');

router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { name, fees, standard, subject, startDate, timing, teacherIds = [] } = req.body;

    // 1. Create batch
    const batch = await Batch.create({
      name,
      fees,
      standard,
      subject,
      startDate,
      batchTiming: timing,
      ownerId: req.user.id
    });

    // 2. Assign teachers (optional)
    if (teacherIds.length > 0) {
      const teachers = await Teacher.find({
        _id: { $in: teacherIds },
        ownerId: req.user.id
      });

      const relations = teachers.map(t => ({
        batchId: batch._id,
        teacherId: t._id,
        ownerId: req.user.id
      }));

      await BatchTeacher.insertMany(relations);
    }

    //  Sync batch
    pushJob({
      type: "CREATE_BATCH",
      userId: req.user.id,
      data: batch
    });

    res.json({
      message: "Batch created",
      batch
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating batch" });
  }
});

router.get('/list', authMiddleware, async (req, res) => {
  try {
    const batches = await Batch.find({
      ownerId: req.user.id
    });

    const batchTeachers = await BatchTeacher.find({
      ownerId: req.user.id
    }).populate('teacherId');

    // map batchId → teachers
    const map = {};

    batchTeachers.forEach(bt => {
      const bId = bt.batchId.toString();

      if (!map[bId]) map[bId] = [];

      map[bId].push({
        id: bt.teacherId._id,
        name: bt.teacherId.name
      });
    });

    const result = batches.map(batch => ({
      ...batch.toObject(),
      teachers: map[batch._id] || []
    }));

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching batches" });
  }
});



router.post('/assign-teacher', authMiddleware, async (req, res) => {
  try {
    const { batchId, teacherId } = req.body;

    // validate batch
    const batch = await Batch.findOne({
      _id: batchId,
      ownerId: req.user.id
    });

    if (!batch) {
      return res.status(400).json({ error: "Invalid batchId" });
    }

    // validate teacher
    const teacher = await Teacher.findOne({
      _id: teacherId,
      ownerId: req.user.id
    });

    if (!teacher) {
      return res.status(400).json({ error: "Invalid teacherId" });
    }

    // prevent duplicate
    const exists = await BatchTeacher.findOne({
      batchId,
      teacherId,
      ownerId: req.user.id
    });

    if (exists) {
      return res.status(400).json({
        error: "Teacher already assigned"
      });
    }

    await BatchTeacher.create({
      batchId,
      teacherId,
      ownerId: req.user.id
    });

    // pushJob({
    //   type: "ASSIGN_TEACHER",
    //   userId: req.user.id,
    //   data: relation
    // });

    res.status(200).json({
      success: true,
      message: "Teacher assigned successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error assigning teacher" });
  }
});


router.delete('/remove-teacher', authMiddleware, async (req, res) => {
  try {
    const { batchId, teacherId } = req.body;

    // validate input
    if (!batchId || !teacherId) {
      return res.status(400).json({
        error: "batchId and teacherId required"
      });
    }

    // ensure batch belongs to user
    const batch = await Batch.findOne({
      _id: batchId,
      ownerId: req.user.id
    });

    if (!batch) {
      return res.status(404).json({
        error: "Batch not found"
      });
    }

    // delete relation
    const result = await BatchTeacher.findOneAndDelete({
      batchId,
      teacherId,
      ownerId: req.user.id
    });

    if (!result) {
      return res.status(404).json({
        error: "Relation not found"
      });
    }

    //  sync (optional but recommended)
    pushJob({
      type: "REMOVE_TEACHER",
      userId: req.user.id,
      data: { batchId, teacherId }
    });

    res.json({
      message: "Teacher removed from batch"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error removing teacher"
    });
  }
});


router.get('/filter', authMiddleware, async (req, res) => {
  try {
    let { standard } = req.query;

    // console.log("Standard received:", standard);
    // Normalize input
    if (standard) {
      standard = String(standard).trim();
    }

    // Build query safely
    const query = {
      ownerId: req.user.id,
      ...(standard && { standard })
    };

    const batches = await Batch.find(query)
      .sort({ name: 1 }) // consistent UI order
      .select("_id name subject standard fees"); // only needed fields

    res.json(batches);

  } catch (err) {
    console.error("Batch filter error:", err);
    res.status(500).json({ error: "Error fetching batches" });
  }
});

module.exports = router;