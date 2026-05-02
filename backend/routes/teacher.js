const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const Batch = require('../models/Batch');
const BatchTeacher = require('../models/BatchTeacher');
const StudentBatch = require('../models/StudentBatch');
const { pushJob } = require('../services/syncQueue');
const Student = require('../models/Student');
const authMiddleware = require('../middleware/authmiddleware');
const requirePlan = require('../middleware/requirePlan');


router.post('/add', authMiddleware, async (req, res) => {
  try {
    const {
      name, subject, sharePercent,
      joinDate, phone, aadhar,
      mode, batchId, batchName, fees, timing
    } = req.body;

    // 1. Create teacher
    const teacher = await Teacher.create({
      name,
      subject,
      sharePercent,
      joinDate,
      phone,
      aadharNumber: aadhar,
      ownerId: req.user.id
    });

    let batch;

    // 2. Assign batch
    if (mode === "existing") {
      batch = await Batch.findOne({
        _id: batchId,
        ownerId: req.user.id
      });

      if (!batch) {
        return res.status(400).json({ error: "Invalid batchId" });
      }

    } else if(mode === "new"){
      // create new batch

      if (!batchName || !fees || !timing) {
        return res.status(400).json({
          error: "Missing batch data"
        });
      }

      batch = await Batch.create({
        name: batchName,
        fees: fees,
        startDate: joinDate,
        batchTiming: timing,
        ownerId: req.user.id
      });
    }

    // 3. Create relation
    if(batch) {
      await BatchTeacher.create({
        batchId: batch._id,
        teacherId: teacher._id,
        ownerId: req.user.id
      });
    }

    //  Sync (optional)
    pushJob({
      type: "CREATE_TEACHER",
      userId: req.user.id,
      data: teacher
    });

    res.json({
      message: "Teacher added and assigned",
      teacher,
      batch
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error adding teacher" });
  }
});


router.get('/list', authMiddleware, async (req, res) => {
  try {
    const teachers = await Teacher.find({
      ownerId: req.user.id
    });

    res.json(teachers);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching teachers" });
  }
});


router.get('/salary', authMiddleware, async (req, res) => {
  try {
    const ownerId = req.user.id;

    // 1. Fetch data
    const [studentBatches, batchTeachers, teachers] = await Promise.all([
      StudentBatch.find({ ownerId, status: "ACTIVE" }),
      BatchTeacher.find({ ownerId }),
      Teacher.find({ ownerId })
    ]);

    // 2. batchId → teacherIds[]
    const batchToTeachers = {};

    batchTeachers.forEach(bt => {
      const batchId = bt.batchId.toString();

      if (!batchToTeachers[batchId]) {
        batchToTeachers[batchId] = [];
      }

      batchToTeachers[batchId].push(bt.teacherId.toString());
    });

    // 3. teacherId → { name, share }
    const teacherMap = {};

    teachers.forEach(t => {
      teacherMap[t._id.toString()] = {
        name: t.name,
        share: t.sharePercent || 0
      };
    });

    // 4. Calculate revenue
    const teacherStats = {};

    studentBatches.forEach(sb => {
      const batchId = sb.batchId.toString();
      const fee = sb.feesPaid || 0;

      const teacherIds = batchToTeachers[batchId] || [];

      teacherIds.forEach(teacherId => {
        const teacher = teacherMap[teacherId];
        if (!teacher) return;

        if (!teacherStats[teacherId]) {
          teacherStats[teacherId] = {
            totalRevenue: 0,
            teacherEarning: 0,
            ownerEarning: 0
          };
        }

        const share = teacher.share;

        const teacherCut = fee * (share / 100);
        const ownerCut = fee * (1 - share / 100);

        teacherStats[teacherId].totalRevenue += fee;
        teacherStats[teacherId].teacherEarning += teacherCut;
        teacherStats[teacherId].ownerEarning += ownerCut;
      });
    });

    // 5. Format result
    const result = Object.entries(teacherStats).map(([teacherId, stats]) => ({
      teacherId,
      name: teacherMap[teacherId]?.name || "Unknown",
      totalRevenue: stats.totalRevenue,
      teacherEarning: stats.teacherEarning,
      ownerEarning: stats.ownerEarning
    }));

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error calculating salary" });
  }
});



router.put('/update/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const update = {};

    const {
      name,
      subject,
      sharePercent,
      phone,
      aadhar
    } = req.body;

    if (name) update.name = name;
    if (subject) update.subject = subject;
    if (sharePercent !== undefined) update.sharePercent = sharePercent;
    if (phone) update.phone = phone;
    if (aadhar) update.aadharNumber = aadhar;

    const teacher = await Teacher.findOneAndUpdate(
      { _id: id, ownerId: req.user.id },
      update,
      { new: true }
    );

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    res.json({
      message: "Teacher updated",
      teacher
    });

  } catch (err) {
    res.status(500).json({ error: "Error updating teacher" });
  }
});


router.delete('/delete/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // delete relations first
    await BatchTeacher.deleteMany({
      teacherId: id,
      ownerId: req.user.id
    });

    const teacher = await Teacher.findOneAndDelete({
      _id: id,
      ownerId: req.user.id
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    res.json({
      message: "Teacher deleted"
    });

  } catch (err) {
    res.status(500).json({ error: "Error deleting teacher" });
  }
});

module.exports = router;