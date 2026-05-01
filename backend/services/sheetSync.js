const { getSheetsClient, appendValues } = require('./googleSheets');
const User = require('../models/User');
const { updateRow, getValues } = require('./googleSheets');

// CREATE STUDENT
async function syncCreateStudent(userId, student) {
  const user = await User.findById(userId);

  if (!user?.sheets?.spreadsheetId) return;

  const sheets = getSheetsClient(user.tokens);

  const values = [[
    student._id.toString(),
    student.name,
    student.standard,
    student.aadharNumber,
    student.phone,
    student.batchId?.toString() || "",
    student.feesPaid,
    student.status,
    student.leaveDate || ""
  ]];

  await appendValues(
    sheets,
    user.sheets.spreadsheetId,
    'Students!A:I',
    values
  );
}

async function findStudentRowIndex(sheets, spreadsheetId, studentId) {
  const rows = await getValues(sheets, spreadsheetId, 'Students!A:A');

  const index = rows.findIndex(row => row[0] === studentId);

  return index === -1 ? -1 : index + 1; // 1-based index
}


async function syncUpdateStudent(userId, student) {
  const user = await User.findById(userId);
  if (!user?.sheets?.spreadsheetId) return;

  const sheets = getSheetsClient(user.tokens);

  const rowIndex = await findStudentRowIndex(
    sheets,
    user.sheets.spreadsheetId,
    student._id.toString()
  );

  if (rowIndex === -1) {
    console.log("Student not found in sheet, skipping update");
    return;
  }

  const values = [[
    student._id.toString(),
    student.name,
    student.standard,
    student.subject,
    student.aadharNumber,
    student.phone,
    student.batchId?.toString() || "",
    student.feesPaid,
    student.status,
    student.leaveDate || ""
  ]];

  await updateRow(
    sheets,
    user.sheets.spreadsheetId,
    `Students!A${rowIndex}:I${rowIndex}`,
    values
  );
}

async function syncLeaveStudent(userId, student) {
  await syncUpdateStudent(userId, student);
}

async function syncCreateTeacher(userId, teacher) {
  const user = await User.findById(userId);
  if (!user?.sheets?.spreadsheetId) return;

  const sheets = getSheetsClient(user.tokens);

  const values = [[
    teacher._id.toString(),
    teacher.name,
    teacher.sharePercent,
    teacher.subject,
    teacher.joinDate || "",
    teacher.phone,
    teacher.aadharNumber
  ]];

  await appendValues(
    sheets,
    user.sheets.spreadsheetId,
    'Teachers!A:G',
    values
  );
}

async function syncCreateBatch(userId, batch) {
  const user = await User.findById(userId);
  if (!user?.sheets?.spreadsheetId) return;

  const sheets = getSheetsClient(user.tokens);

  const values = [[
    batch._id.toString(),
    batch.name,
    batch.fees,
    batch.standard,
    batch.subject,
    batch.startDate || "",
    batch.batchTiming || ""
  ]];

  await appendValues(
    sheets,
    user.sheets.spreadsheetId,
    'Batches!A:E',
    values
  );
}

async function syncAssignTeacher(userId, relation) {
  const user = await User.findById(userId);
  if (!user?.sheets?.spreadsheetId) return;

  const sheets = getSheetsClient(user.tokens);

  const values = [[
    relation._id.toString(),
    relation.batchId.toString(),
    relation.teacherId.toString()
  ]];

  await appendValues(
    sheets,
    user.sheets.spreadsheetId,
    'BatchTeachers!A:C',
    values
  );
}


module.exports = {
  syncCreateStudent,
  syncUpdateStudent,
  syncLeaveStudent,
  syncCreateTeacher,
  syncCreateBatch,
  syncAssignTeacher
};