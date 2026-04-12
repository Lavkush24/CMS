const { google } = require('googleapis');
const { getAuthClient } = require('./googleAuth');

function getSheetsClient(tokens) {
  const auth = getAuthClient(tokens);

  return google.sheets({
    version: 'v4',
    auth
  });
}

async function getValues(sheets, spreadsheetId, range) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range
  });

  return res.data.values || [];
}

async function appendValues(sheets, spreadsheetId, range, values) {
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    resource: { values }
  });
}

async function findRowById(sheets, spreadsheetId, range, id) {
  const rows = await getValues(sheets, spreadsheetId, range);

  if (rows.length <= 1) return null;

  const data = rows.slice(1);

  const index = data.findIndex(r => r[0] === id);

  if (index === -1) return null;

  return {
    rowIndex: index + 2,
    rowData: data[index]
  };
}


async function updateRow(sheets, spreadsheetId, range, values) {
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: {
      values // must be 2D array
    }
  });
}

async function getAllData(sheets, spreadsheetId, range) {
  const rows = await getValues(sheets, spreadsheetId, range);

  return rows.length > 1 ? rows.slice(1) : [];
}


async function checkIdExists(sheets, spreadsheetId, range, id) {
  const data = await getAllData(sheets, spreadsheetId, range);

  return data.some(row => row[0] === id);
}


async function deleteRowByIndex(sheets, spreadsheetId, sheetId, rowIndex) {
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1,
              endIndex: rowIndex
            }
          }
        }
      ]
    }
  });
}


async function getSheetIdByName(sheets, spreadsheetId, sheetName) {
  const res = await sheets.spreadsheets.get({
    spreadsheetId
  });

  const sheet = res.data.sheets.find(
    s => s.properties.title === sheetName
  );

  if (!sheet) throw new Error("Sheet not found");

  return sheet.properties.sheetId;
}


function normalizeRow(row, totalColumns) {
  return Array.from({ length: totalColumns }, (_, i) =>
    row[i] !== undefined ? row[i] : ""
  );
}

module.exports = {
  normalizeRow,
  getSheetIdByName,
  getSheetsClient,
  getValues,
  appendValues,
  deleteRowByIndex,
  checkIdExists,
  updateRow,
  findRowById
};