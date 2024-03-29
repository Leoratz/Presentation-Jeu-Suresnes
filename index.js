import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (!client) {
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
      await saveCredentials(client);
    }
  }
  return client;
}

async function getSpreadsheetData(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  const spreadsheetId = '1Jfqwe0iAfZQa5d0i7Bg4d76mVV9hT7bG3H_22JozQX0';
  const range = 'T3:AF4'; // Ajustez la plage pour inclure toutes vos cellules
  
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return res.data.values;
  } catch (error) {
    console.error('The API returned an error: ' + error);
    return null;
  }
}

function refreshData() {
  authorize().then(auth => {
    getSpreadsheetData(auth)
      .then(data => {
        if (data && data.length > 0) {
          // Traitement des données pour chaque question
          const questionsData = {
            Question1: data.slice(0, 2).map(row => row[0]), // T3:T4
            Question2: data.slice(0, 2).map(row => row[3]), // W3:W4
            Question3: data.slice(0, 2).map(row => row[6]), // Z3:Z4
            Question4: data.slice(0, 2).map(row => row[9]), // AC3:AC4
            Question5: data.slice(0, 2).map(row => row[12]), // AF3:AF4
          };
          // Génération du contenu pour data.js
          const content = Object.entries(questionsData)
            .map(([key, value]) => `const ${key} = ${JSON.stringify(value.map(Number))};`)
            .join('\n');
          fs.writeFile('public/data.js', content).catch(console.error);
        } else {
          console.log('No data found or error occurred');
        }
      })
      .catch(console.error);
  }).catch(console.error);
}

// Set an interval to refresh data every 2s
setInterval(refreshData, 2000);

// Also refresh data immediately when script starts
refreshData();

export { authorize, getSpreadsheetData };