const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authmiddleware');
const requirePlan = require('../middleware/requirePlan');

const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Batch = require('../models/Batch');
const BatchTeacher = require('../models/BatchTeacher');
const StudentBatch = require('../models/StudentBatch');


router.get('/overview', authMiddleware,async (req, res) => {
  try {
    const ownerId = req.user.id;

    // 1. Parallel queries
    const [
      totalStudents,
      totalTeachers,
      totalBatches,
      studentBatches,
      relations,
      teachers
    ] = await Promise.all([
      Student.countDocuments({ ownerId, status: "ACTIVE" }),
      Teacher.countDocuments({ ownerId }),
      Batch.countDocuments({ ownerId }),
      StudentBatch.find({ ownerId, status: "ACTIVE" }),
      BatchTeacher.find({ ownerId }),
      Teacher.find({ ownerId })
    ]);

    // 2. Total Revenue (from StudentBatch)
    let totalRevenue = 0;

    studentBatches.forEach(sb => {
      totalRevenue += sb.fees || 0;
    });

    // 3. batchId → teacherIds[]
    const batchToTeachers = {};

    relations.forEach(r => {
      const bId = r.batchId.toString();

      if (!batchToTeachers[bId]) {
        batchToTeachers[bId] = [];
      }

      batchToTeachers[bId].push(r.teacherId.toString());
    });

    // 4. teacherId → { name, share }
    const teacherMap = {};

    teachers.forEach(t => {
      teacherMap[t._id.toString()] = {
        name: t.name,
        share: t.sharePercent || 0
      };
    });

    // 5. Teacher revenue calculation
    const teacherRevenue = {};

    studentBatches.forEach(sb => {
      const batchId = sb.batchId.toString();
      const fee = sb.fees || 0;

      const teacherIds = batchToTeachers[batchId] || [];

      teacherIds.forEach(tid => {
        const teacher = teacherMap[tid];
        if (!teacher) return;

        if (!teacherRevenue[tid]) {
          teacherRevenue[tid] = 0;
        }

        // Only count teacher share
        teacherRevenue[tid] += fee * (teacher.share / 100);
      });
    });

    // 6. Find top teacher
    let topTeacherId = null;
    let maxRevenue = 0;

    for (const tid in teacherRevenue) {
      if (teacherRevenue[tid] > maxRevenue) {
        maxRevenue = teacherRevenue[tid];
        topTeacherId = tid;
      }
    }

    let topTeacher = null;

    if (topTeacherId) {
      topTeacher = {
        id: topTeacherId,
        name: teacherMap[topTeacherId]?.name || "Unknown",
        revenue: Math.round(maxRevenue)
      };
    }

    // 7. Response
    res.json({
      summary: {
        totalStudents,
        totalTeachers,
        totalBatches,
        totalRevenue: Math.round(totalRevenue)
      },
      topTeacher
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error fetching dashboard"
    });
  }
});


module.exports = router;