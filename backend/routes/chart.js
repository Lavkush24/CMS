const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authmiddleware');
const requirePlan = require('../middleware/requirePlan');

const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Teacher = require('../models/Teacher');
const BatchTeacher = require('../models/BatchTeacher');
const { buildDateFilter } = require('../validators/common');
const StudentBatch = require('../models/StudentBatch');


//  1. Revenue per Batch
router.get('/revenue-per-batch', authMiddleware, async (req, res) => {
  try {
    const ownerId = req.user.id;

    const data = await StudentBatch.aggregate([
      {
        $match: {
          ownerId,
          status: "ACTIVE"
        }
      },

      {
        $group: {
          _id: "$batchId",
          totalStudents: { $sum: 1 },
          revenue: { $sum: "$feesPaid" }
        }
      },

      {
        $lookup: {
          from: "batches",
          localField: "_id",
          foreignField: "_id",
          as: "batch"
        }
      },
      { $unwind: "$batch" },

      {
        $lookup: {
          from: "batchteachers",
          localField: "_id",
          foreignField: "batchId",
          as: "relations"
        }
      },

      {
        $lookup: {
          from: "teachers",
          localField: "relations.teacherId",
          foreignField: "_id",
          as: "teachers"
        }
      },

      {
        $project: {
          batchId: "$_id",
          batchName: "$batch.name",
          totalStudents: 1,
          revenue: 1,
          teachers: "$teachers.name"
        }
      },

      { $sort: { revenue: -1 } }
    ]);

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching batch stats" });
  }
});

//  2. Monthly Revenue Trend
router.get('/monthly-revenue', authMiddleware, async (req, res) => {
  try {
    const ownerId = req.user.id;

    const data = await StudentBatch.aggregate([
      {
        $match: {
          ownerId,
          status: "ACTIVE"
        }
      },

      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalRevenue: { $sum: "$feesPaid" }
        }
      },

      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const result = data.map(d => ({
      year: d._id.year,
      month: d._id.month,
      revenue: d.totalRevenue
    }));

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generating monthly chart" });
  }
});

router.get('/teacher-performance', authMiddleware, async (req, res) => {
  try {
    const { from, to } = req.query;

    const match = {
      ownerId: req.user.id,
      status: "ACTIVE",
      ...buildDateFilter(from, to)
    };

    const data = await StudentBatch.aggregate([
      { $match: match },

      {
        $lookup: {
          from: "batchteachers",
          localField: "batchId",
          foreignField: "batchId",
          as: "relations"
        }
      },

      { $unwind: "$relations" },

      {
        $lookup: {
          from: "teachers",
          localField: "relations.teacherId",
          foreignField: "_id",
          as: "teacher"
        }
      },

      { $unwind: "$teacher" },

      {
        $group: {
          _id: "$teacher._id",
          name: { $first: "$teacher.name" },
          revenue: {
            $sum: {
              $multiply: [
                "$feesPaid",
                { $divide: ["$teacher.sharePercent", 100] }
              ]
            }
          }
        }
      },

      { $sort: { revenue: -1 } }
    ]);

    res.json(data);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error" });
  }
});

module.exports = router;