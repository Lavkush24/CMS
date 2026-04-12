const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { getOAuthClient } = require('../services/google');
const User = require('../models/User');
const { getSheetsClient, appendValues, getValues } = require('../services/googleSheets');
const authMiddleware = require('../middleware/authmiddleware');
const requirePlan = require('../middleware/requirePlan');


router.post('/add', authMiddleware,async (req, res) => {
  try {
    const { email, name, subject, sharePercent, joinDate, phone, aadhar, batchName, fee, timing } = req.body;

    // const user = await User.findOne({ email });
    const user = req.user;
    if (!user) return res.status(404).send("User not found");

    const sheets = getSheetsClient(user.tokens);

    // 1. create teacher
    const teacherId = 'T' + Date.now();
    await appendValues(sheets, user.sheets.spreadsheetId, 'Teachers!A1', [[teacherId, name, sharePercent, subject, joinDate, phone, aadhar]]);

    // 2. Create Batch linked to teacher
    const batchId = "B" + Date.now();
    await appendValues(sheets, user.sheets.spreadsheetId, 'Batches!A1', [[batchId, batchName, teacherId, fee, joinDate, timing]]);

    res.json({
      message: "Teacher and batch created",
      teacherId,
      batchId
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding teacher + batch");
  }
});


router.get('/list', authMiddleware,async (req, res) => {
  try {
    // const { email } = req.query;

    // const user = await User.findOne({ email });
    const user = req.user;
    if (!user) return res.status(404).send("User not found");

    const sheets = getSheetsClient(user.tokens);

    const rows = await getValues(sheets, user.sheets.spreadsheetId, 'Teachers!A:G');

    if (rows.length === 0) return res.json([]);

    const data = rows.slice(1).map(row => ({
      id: row[0] || "",
      name: row[1] || "",
      rate: Number(row[2]) || 0,
      subject: row[3] || "",
      joinDate: row[4] || "",
      Phone: row[5] || "",
      aadhar: row[6] || ""
    }));

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching teachers");
  }
});


router.get('/salary', authMiddleware,requirePlan("PRO"),async (req, res) => {
  try {
    // const { email } = req.query;

    // const user = await User.findOne({ email });
    const user = req.user;
    if (!user) return res.status(404).send("User not found");

    const sheets = getSheetsClient(user.tokens);

    // 1. Fetch all data
    const [students, batches, teachers] = await Promise.all([
      getValues(sheets, user.sheets.spreadsheetId, 'Students!A:I'),
      getValues(sheets, user.sheets.spreadsheetId, 'Batches!A:G'),
      getValues(sheets, user.sheets.spreadsheetId, 'Teachers!A:H')
    ]);

    // 2. Build maps

    // batchId → teacherId
    const batchToTeacher = {};
    batches.slice(1).forEach(row => {
      const batchId = row[0];
      const teacherId = row[2];
      if (batchId && teacherId) {
        batchToTeacher[batchId] = teacherId;
      }
    });

    // teacherId → {name, sharePercent}
    const teacherInfo = {};
    teachers.slice(1).forEach(row => {
      const teacherId = row[0];
      const name = row[1];
      const share = Number(row[2]) || 0;

      if (teacherId) {
        teacherInfo[teacherId] = {
          name,
          share
        };
      }
    });

    // 3. Calculate revenue per teacher
    const teacherRevenue = {};

    students.slice(1).filter(row => (row[7] || "ACTIVE").trim() === "ACTIVE").forEach(row => {
      const batchId = row[5];
      const feePaid = Number(row[6]) || 0;

      const teacherId = batchToTeacher[batchId];

      if (!teacherId) return;

      if (!teacherRevenue[teacherId]) {
        teacherRevenue[teacherId] = 0;
      } 

      teacherRevenue[teacherId] += feePaid;
    });

    // 4. Build final response
    const result = [];

    for (const teacherId in teacherRevenue) {
      const totalRevenue = teacherRevenue[teacherId];
      const info = teacherInfo[teacherId] || {};

      const share = info.share || 0;

      const teacherEarning = totalRevenue * (1 - share / 100);
      const ownerEarning = totalRevenue * (share / 100);

      result.push({
        teacherId,
        name: info.name || "Unknown",
        totalRevenue,
        teacherEarning,
        ownerEarning
      });
    }

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error calculating salary"
    });
  }
});


module.exports = router ;