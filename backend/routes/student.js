const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { getOAuthClient } = require('../services/google');
const User = require('../models/User');
const { studentSchema } = require('../validators/student.schema');
const { getSheetsClient, getValues, appendValues, updateRow } = require('../services/googleSheets');
const { studentUpdateSchema } = require('../validators/student.update.schema');
const authMiddleware = require('../middleware/authmiddleware');

router.post('/add', authMiddleware,async (req, res) => {
  try {
    const { error , value } = studentSchema.validate(req.body); 

    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }

    const { name, standard, aadhar, phone, batchId, feePaid } = value;

    // const user = await User.findOne({ email });
    const user = req.user;
    if (!user) return res.status(404).send("User not found");

    console.log("sheetId: ",user.sheets.spreadsheetId);

    const sheets = getSheetsClient(user.tokens); 

    //  Fetch batches
    const batchRows = await getValues(sheets,user.sheets.spreadsheetId, 'Batches!A:A');

    if(batchRows.length <= 1) {
        return res.status(400).send("!No batch exists")
    }

    // Validate batch exists
    const batchExists = batchRows.slice(1).some(row => row[0] === batchId);

    if (!batchExists) {
      return res.status(400).send("Invalid batchId");
    }

    // Add student
    const studentId = "S" + Date.now();
    await appendValues(sheets, user.sheets.spreadsheetId, 'Students!A1', [[studentId, name, standard, aadhar, phone, batchId, feePaid, "ACTIVE",""]]);

    res.json({
      message: "Student added successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding student");
  }
});


router.put('/update/:id', authMiddleware,async (req, res) => {
  try {
    const studentId = req.params.id;

    const { error, value } = studentUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        errors: error.details.map(e => e.message)
      });
    }

    const updates = value;
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const sheets = await getSheetsClient(user.tokens);

    const rows = await getValues(
      sheets,
      user.sheets.spreadsheetId,
      'Students!A:G'
    );

    const data = rows.slice(1);

    const index = data.findIndex(row => row[0] === studentId);

    if (index === -1) {
      return res.status(404).json({ message: "Student not found" });
    }

    const existing = data[index];

    //  Validate batch if updating
    if (updates.batchId) {
      const batchRows = await getValues(
        sheets,
        user.sheets.spreadsheetId,
        'Batches!A:A'
      );

      const exists = batchRows.slice(1).some(r => r[0] === updates.batchId);

      if (!exists) {
        return res.status(400).json({ error: "Invalid batchId" });
      }
    }

    const updatedRow = [
      existing[0],
      updates.name ?? existing[1],
      updates.standard ?? existing[2],
      updates.aadhar ?? existing[3],
      updates.phone ?? existing[4],
      updates.batchId ?? existing[5],
      updates.feePaid !== undefined
        ? String(updates.feePaid)
        : existing[6]
    ];

    const actualRow = index + 2;

    await updateRow(
      sheets,
      user.sheets.spreadsheetId,
      `Students!A${actualRow}:G${actualRow}`,
      [updatedRow]
    );

    return res.json({
      message: "Student updated successfully",
      studentId,
      data: updatedRow
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/list', authMiddleware,async (req, res) => {
  try {
    // const { email } = req.query;
    // const user = await User.findOne({ email });
    // if (!user) return res.send("User not found");

    const user = req.user;

    const sheets = getSheetsClient(user.tokens);

    const rows = await getValues(sheets, user.sheets.spreadsheetId, 'Students!A:I');

    if (rows.length === 0) {
      return res.json([]);
    }

    const headers = rows[0];

    const data = rows
    .slice(1)
    .filter(row => ((row[7] || "ACTIVE").trim() === "ACTIVE"))
    .map(row => ({
      id: row[0] || "",
      name: row[1] || "",
      standard: row[2] || "",
      aadhar: row[3] || "",
      phone: row[4] || "",
      batch: row[5] || "",
      feePaid: Number(row[6]) || 0,
    }));

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching students");
  }
});

router.put('/leave/:id', authMiddleware, async (req, res) => {
  try {
    const studentId = req.params.id;
    const user = req.user;

    const sheets = getSheetsClient(user.tokens);

    // 1. Get all students
    const rows = await getValues(
      sheets,
      user.sheets.spreadsheetId,
      'Students!A:I'
    );

    if (!rows || rows.length <= 1) {
      return res.status(404).json({ error: "No students found" });
    }

    const data = rows.slice(1);

    // 2. Find student
    const index = data.findIndex(row => row[0] === studentId);

    if (index === -1) {
      return res.status(404).json({ error: "Student not found" });
    }

    const existing = data[index];

    // 3. Prevent double leave
    if (existing[7] === "LEFT") {
      return res.status(400).json({
        error: "Student already marked as LEFT"
      });
    }

    // 4. Create updated row
    const today = new Date().toISOString().split('T')[0];

    const updatedRow = [
      existing[0], // ID
      existing[1],
      existing[2],
      existing[3],
      existing[4],
      existing[5],
      existing[6],
      "LEFT",     // Status
      today       // LeaveDate
    ];

    const actualRow = index + 2;

    // 5. Update row
    await updateRow(
      sheets,
      user.sheets.spreadsheetId,
      `Students!A${actualRow}:I${actualRow}`,
      [updatedRow]
    );

    return res.json({
      message: "Student marked as LEFT",
      studentId,
      leaveDate: today
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router ;