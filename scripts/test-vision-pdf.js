const { ImageAnnotatorClient } = require('@google-cloud/vision');
const { PDFDocument, rgb } = require('pdf-lib');
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

async function createDummyPdf() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const { width, height } = page.getSize();
  page.drawText('TotalEnergies Access\nSP95\nQuantite: 42.5 L\nPrix unitaire: 1.859 EUR\nTOTAL: 79.01 EUR\nVille: Paris 75015', {
    x: 50,
    y: 300,
    size: 20,
    color: rgb(0, 0, 0),
  });
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

async function testPdfOcr() {
  console.log("Generating dummy PDF...");
  const pdfBuffer = await createDummyPdf();
  
  console.log("Sending PDF to batchAnnotateFiles...");
  try {
    const request = {
      requests: [
        {
          inputConfig: {
            content: pdfBuffer,
            mimeType: 'application/pdf',
          },
          features: [
            {
              type: 'DOCUMENT_TEXT_DETECTION',
            },
          ],
          pages: [1], // process first page
        },
      ],
    };
    
    const [response] = await client.batchAnnotateFiles(request);
    console.log("Response received successfully!");
    
    const fileResponse = response.responses?.[0];
    if (fileResponse?.error) {
      console.error("Vision API responded with error:", fileResponse.error);
      return;
    }
    
    const pages = fileResponse?.responses || [];
    console.log(`Number of page responses: ${pages.length}`);
    for (let i = 0; i < pages.length; i++) {
      const pageText = pages[i].fullTextAnnotation?.text || '';
      console.log(`--- Page ${i + 1} Text ---`);
      console.log(pageText);
      console.log(`------------------------`);
    }
  } catch (err) {
    console.error("Error during batchAnnotateFiles:", err);
  }
}

testPdfOcr();
