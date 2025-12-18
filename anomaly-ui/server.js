import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import csv from 'csv-parser';
import { spawn } from 'child_process';

let latestFilePath = ''

const app = express();
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const file = req.file;
  console.log('File saved to:', file.path);
  console.log('Original filename:', file.originalname);

  const headers = [];
  let headersCaptured = false;

  fs.createReadStream(file.path)
    .pipe(csv())
    .on('headers', (csvHeaders) => {
      latestFilePath = file.path;
      console.log('CSV headers:', csvHeaders);
      headers.push(...csvHeaders);
      headersCaptured = true;
    })
    .on('data', (row) => {
      console.log('Row:', row);
    })
    .on('end', () => {
      console.log('CSV reading complete');
      res.json({ success: true, headers, filePath: file.path });
      
      // Optional: Delete file after processing
      // Uncomment the lines below if you want to delete after sending response
      // fs.unlink(file.path, (err) => {
      //   if (err) console.error('Error deleting file:', err);
      // });

    })
    .on('error', (err) => {
      console.error('Error reading CSV:', err);
      res.status(500).json({ error: 'Failed to read CSV' });
    });
});

app.post('/analyze', (req, res) => {
  const { column } = req.body;

  if (!column) { return res.status(400).json({ error: 'No column specified' });}

  const python = spawn('python3', ['dataPreprocess.py', latestFilePath, column]);

let result = '';
let error = '';

python.stdout.on('data', (data) => {
  result += data.toString();
});

python.stderr.on('data', (data) => {
  error += data.toString();
});

python.on('close', (code) => {
  if (code === 0) {
    res.json({ success: true, output: result });
  } else {
    res.status(500).json({ success: false, error });
  }
});

})

app.listen(3001, () => console.log('Server running on http://localhost:3001'));