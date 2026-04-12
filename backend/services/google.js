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
    process.env.GOOGLE_CALLBACK_URL,
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
        { properties: { title: 'Batches' } }
      ]
    }
  });

  const spreadsheetId = res.data.spreadsheetId;

  // Add headers
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Students!A1:I1',
    valueInputOption: 'RAW',
    resource: {
      values: [['ID', 'Name', 'standard','Aadhar Number', 'Phone', 'BatchId', 'Fees Paid','Status','Leave Date']]
    }
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Teachers!A1:G1',
    valueInputOption: 'RAW',
    resource: {
      values: [['ID', 'Name', 'Share Percent', 'Subject','Join Date', 'Phone', 'Aadhar number']]
    }
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Batches!A1:F1',
    valueInputOption: 'RAW',
    resource: {
      values: [['ID', 'Name', 'TeacherId', 'Fees', 'Start Date', 'Batch Timing']]
    }
  });

  return spreadsheetId;
}

module.exports = { getOAuthClient, createInitialSheets };