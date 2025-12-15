import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import csv from 'csv-parser';

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const file = req.file;
  console.log('Reading file:', file.path);

  const headers = [];

  fs.createReadStream(file.path)
    .pipe(csv())
    .on('headers', (csvHeaders) => {
      console.log('CSV headers:', csvHeaders);
      headers.push(...csvHeaders);

      res.json({ success: true, headers });

      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    })
    .on('error', (err) => {
      console.error('Error reading CSV:', err);
      res.status(500).json({ error: 'Failed to read CSV' });
    });
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));
