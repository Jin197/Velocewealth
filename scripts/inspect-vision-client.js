const { ImageAnnotatorClient } = require('@google-cloud/vision');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
try {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
} catch (e) {
  console.error("Error loading env:", e);
}

const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
if (!credentialsJson) {
  console.error("Missing GOOGLE_APPLICATION_CREDENTIALS_JSON in .env.local");
  process.exit(1);
}

const credentials = JSON.parse(credentialsJson);
const client = new ImageAnnotatorClient({ credentials });

console.log("Client created successfully!");
console.log("Available client methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(client)).filter(m => !m.startsWith('_')));
