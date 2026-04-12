const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { getOAuthClient } = require('../services/google');
const User = require('../models/User');
const { getSheetsClient, getValues } = require('../services/googleSheets');
const authMiddleware = require('../middleware/authmiddleware');


router.get('/dashboard', authMiddleware,async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).send("User not found");

    // const user = await User.findOne({ email });

    const sheets = getSheetsClient(user.tokens);

    // Fetch all data in parallel
    const [students, batches, teachers] = await Promise.all([
      getValues(sheets, user.sheets.spreadsheetId, 'Students!A:I'),
      getValues(sheets, user.sheets.spreadsheetId, 'Batches!A:G'),
      getValues(sheets, user.sheets.spreadsheetId, 'Teachers!A:H')
    ]);

    // Remove headers
    const studentRows = students.slice(1);
    const batchRows = batches.slice(1);
    const teacherRows = teachers.slice(1);

    // Summary
    const totalStudents = studentRows.length;
    const totalTeachers = teacherRows.length;
    const totalBatches = batchRows.length;

    let totalRevenue = 0;

    // batchId → {name, teacherId}
    const batchMap = {};
    batchRows.forEach(row => {
      batchMap[row[0]] = {
        name: row[1],
        teacherId: row[2]
      };
    });

    // teacherId → {name, share}
    const teacherMap = {};
    teacherRows.forEach(row => {
      teacherMap[row[0]] = {
        name: row[1],
        share: Number(row[2]) || 0
      };
    });

    // Revenue aggregation
    const teacherRevenue = {};
    const batchStatsMap = {};

    studentRows.forEach(row => {
      const batchId = row[5];
      const feePaid = Number(row[6]) || 0;

      totalRevenue += feePaid;

      // Batch stats
      if (!batchStatsMap[batchId]) {
        batchStatsMap[batchId] = {
          students: 0,
          revenue: 0
        };
      }

      batchStatsMap[batchId].students += 1;
      batchStatsMap[batchId].revenue += feePaid;

      // Teacher revenue
      const teacherId = batchMap[batchId]?.teacherId;

      if (!teacherId) return;

      if (!teacherRevenue[teacherId]) {
        teacherRevenue[teacherId] = 0;
      }

      teacherRevenue[teacherId] += feePaid;
    });

    // Top teacher
    let topTeacherId = null;
    let maxRevenue = 0;

    for (const tId in teacherRevenue) {
      if (teacherRevenue[tId] > maxRevenue) {
        maxRevenue = teacherRevenue[tId];
        topTeacherId = tId;
      }
    }

    const topTeacher = topTeacherId
      ? {
          teacherId: topTeacherId,
          name: teacherMap[topTeacherId]?.name || "Unknown",
          revenue: maxRevenue
        }
      : null;

    // Batch stats array
    const batchStats = Object.keys(batchStatsMap).map(batchId => ({
      batchId,
      batchName: batchMap[batchId]?.name || "Unknown",
      students: batchStatsMap[batchId].students,
      revenue: batchStatsMap[batchId].revenue
    }));

    // Recent students (last 5)
    const recentStudents = studentRows.slice(-5).map(row => ({
      name: row[1],
      batchId: row[5],
      feePaid: Number(row[6]) || 0
    }));

    //total revenue by each teacher
    

    // Final response
    res.json({
      summary: {
        totalStudents,
        totalTeachers,
        totalBatches,
        totalRevenue
      },
      topTeacher,
      batchStats,
      recentStudents,
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading dashboard");
  }
});


module.exports = router ;