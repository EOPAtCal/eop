const fs = require('fs');
const readline = require('readline');
const {
  google
} = require('googleapis');

// If modifying these scopes, delete credentials.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), removeDuplicates);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {
    client_secret,
    client_id,
    redirect_uris
  } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return callback(err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

let sheets;
/**
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function removeDuplicates(auth) {
  sheets = google.sheets({
    version: 'v4',
    auth
  });
  sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: readRange,
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      algorithm(rows)
    } else {
      console.log('No data found.');
    }
  });
}

const spreadsheetId = '1AGyyd5zBrA4LnP7d_UwCVyMH4rCwxYPzM0EWnHxC0dk'
const readRange = '17/18 APR Draft!A20:BF1986'

function algorithm(rows) {
  const results = []
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    prevRow = rows[index - 1]
    idxSID = 1;
    let SID = row[idxSID]
    if (!SID) {
      const priorSID = prevRow[idxSID]
      if (priorSID) {
        const newCombined = combineRows(prevRow, row)
        // console.log(`newCombined: ${newCombined}`)
        results.push(newCombined)
      }
    }
  }
  const numRows = results.length
  const lengthRows = results[0].length;
  writeResults(results, `Sheet5!A2:${columnToLetter(lengthRows + 3)}${numRows + 3}`)
}

function combineRows(priorRow, currRow) {
  // console.log(`prior: ${priorRow} \n curr: ${currRow}`)
  const newRow = []
  for (let index = 0; index < currRow.length; index++) {
    const currValue = currRow[index];
    const priorVal = priorRow[index]
    if (priorVal === currValue) {
      newRow[index] = priorVal
    } else if (!priorVal && currValue) {
      newRow[index] = currValue
    } else if (!currValue && priorVal) {
      newRow[index] = priorVal
    }
  }
  return newRow
}

function writeResults(rows, range) {
  sheets.spreadsheets.values.update({
    spreadsheetId,
    range: range,
    valueInputOption: 'RAW',
    resource: {
      values: rows
    },
  }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log('%d cells updated.', result.updatedCells);
    }
  });
}

// helpers
function columnToLetter(column) {
  var temp, letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}