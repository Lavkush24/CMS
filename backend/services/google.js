require("dotenv").config();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// const keys = JSON.parse(
//   fs.readFileSync(path.join(__dirname, '../credentials.json'))
// );

// const config = keys.web || keys.installed;

// console.log(keys);

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
  );
}

async function createInitialSheets(auth) {
  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.create({
    resource: {
      properties: {
        title: 'Coaching Management'
      },
      sheets: [
        { properties: { title: 'Students' } },
        { properties: { title: 'Teachers' } },
        { properties: { title: 'Batches' } },
        { properties: { title: 'BatchTeachers' } } 
      ]
    }
  });

  const spreadsheetId = res.data.spreadsheetId;

  // Students
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Students!A1:I1',
    valueInputOption: 'RAW',
    resource: {
      values: [['ID', 'Name', 'Standard', 'Aadhar Number', 'Phone', 'BatchId', 'Fees Paid', 'Status', 'Leave Date']]
    }
  });

  // Teachers
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Teachers!A1:G1',
    valueInputOption: 'RAW',
    resource: {
      values: [['ID', 'Name', 'Share Percent', 'Subject', 'Join Date', 'Phone', 'Aadhar Number']]
    }
  });

  // Batches (FIXED)
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Batches!A1:E1',
    valueInputOption: 'RAW',
    resource: {
      values: [['ID', 'Name', 'Fees', 'Start Date', 'Batch Timing']]
    }
  });

  // BatchTeachers (NEW)
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'BatchTeachers!A1:C1',
    valueInputOption: 'RAW',
    resource: {
      values: [['ID', 'BatchId', 'TeacherId']]
    }
  });

  return spreadsheetId;
}

module.exports = { getOAuthClient, createInitialSheets };