const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { getOAuthClient } = require('../services/google');
const User = require('../models/User');
const { getSheetsClient, getValues, appendValues } = require('../services/googleSheets');
const authMiddleware = require('../middleware/authmiddleware');


router.post('/add', async (req, res) => {
  try {
    const { email, name, teacherId, fees, startDate, timing } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found");

    const sheets = getSheetsClient(user.tokens);

    // Step 1: Validate teacher exists
    const teacherRows = await getValues(sheets, user.sheets.spreadsheetId, 'Teachers!A:G');

    const teacherExists = teacherRows.slice(1).some(row => row[0] === teacherId);

    if (!teacherExists) {
      return res.status(400).send("Invalid teacherId");
    }

    // Step 2: Create batch
    const batchId = "B" + Date.now();
    await appendValues(sheets, user.sheets.spreadsheetId, 'Batches!A1', [[batchId, name, teacherId, fees, startDate, timing]]);

    res.json({
      message: "Batch created successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating batch");
  }
});


router.get('/list', authMiddleware,async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).send("User not found");

    const sheets = getSheetsClient(user.tokens);

    const rows = await getValues(sheets, user.sheets.spreadsheetId, 'Batches!A:F');

    if (rows.length === 0) return res.json([]);

    const data = rows.slice(1).map(row => ({
      id: row[0] || "",
      name: row[1] || "",
      teacherId: row[2] || "",
      fees: Number(row[3]) || 0,
      startDate: row[4] || "",
      timing: row[5] || ""
    }));

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching batches");
  }
});

module.exports = router ;