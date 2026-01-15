import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import csv from 'csv-parser';
import axios from 'axios';
import { setValuesForSession, anomalyMsg } from './aiProcess.js';

let latestFilePath = '';
let latestOriginalName = '';
let latestSessionId = 'default';

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const file = req.file;
  latestOriginalName = file.originalname;

  const headers = [];

  fs.createReadStream(file.path)
    .pipe(csv())
    .on('headers', (csvHeaders) => {
      latestFilePath = file.path;
      console.log('CSV headers:', csvHeaders);
      headers.push(...csvHeaders);
    })
    .on('data', (row) => {
      console.log('Row:', row);
    })
    .on('end', () => {
      console.log('CSV reading complete');
      res.json({ success: true, headers, filePath: file.path });
      
      // fs.unlink(file.path, (err) => {
      //   if (err) console.error('Error deleting file:', err);
      // });
    })
    .on('error', (err) => {
      console.error('Error reading CSV:', err);
      res.status(500).json({ error: 'Failed to read CSV' });
    });
});

app.post('/analyze', async (req, res) => {
  const { column, sessionId, contextText } = req.body;

  if (!column) { return res.status(400).json({ error: 'No column specified' });}
  const currentId = sessionId || Date.now().toString();
  latestSessionId = currentId;

  try {
    const token = process.env.DATABRICKS_TOKEN;
    const baseUrl = process.env.DATABRICKS_HOST;
    const jobId = process.env.JOBID;

    const csvContent = fs.readFileSync(latestFilePath, 'utf8');
    const base64Content = Buffer.from(csvContent).toString('base64');

    await axios.post(`${baseUrl}/api/2.0/dbfs/put`, {
      path: "/FileStore/data/current_analysis.csv",
      contents: base64Content,
      overwrite: true
    }, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    const runResponse = await axios.post(`${baseUrl}/api/2.1/jobs/run-now`, {
      job_id: jobId,
      job_parameters: { "fileToProcess": "/FileStore/data/current_analysis.csv", "headerToProcess": column }
    }, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    const runId = runResponse.data.run_id;
    let isComplete = false;

    while (!isComplete) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const statusResponse = await axios.get(`${baseUrl}/api/2.1/jobs/runs/get`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { run_id: runId }
      });
      const state = statusResponse.data.state.life_cycle_state;
      if (state === 'TERMINATED' || state === 'SKIPPED' || state === 'INTERNAL_ERROR') {
        isComplete = true;
      }
    }

    const csvResult = "goodVal,anomVal\n50,\n55,\n,35"; // temp

    setValuesForSession(currentId, csvResult, contextText || `File: ${latestOriginalName}, Column: ${column}`);

    res.json({ success: true, output: csvResult, sessionId: currentId});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "failed" });
  } 
});

app.post('/chat', async (req, res) => {
  const { sessionId, userMessage} = req.body;
  if (!userMessage || !sessionId) return res.status(400).json({ error: "missing"});

  try {
    const chatbotReply = await anomalyMsg(sessionId, userMessage);
    res.json({ success: true, chatbotReply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "fail" });
  }
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));