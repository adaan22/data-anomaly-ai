import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config ({ path: './variables.env'});

async function anomalizeData() {

    const csvContent = `Timestamp,Device_ID,Reading,Status
2023-10-01 08:00:00,TH-01,24.2,Standby
2023-10-01 08:05:00,LI-05,21.6,Online
2023-10-01 08:10:00,SEC-09,22.6,Online
2023-10-01 08:15:00,TH-01,23.1,Online
2023-10-01 08:20:00,LI-05,21.8,Online
2023-10-01 08:25:00,SEC-09,24.8,Online
2023-10-01 08:30:00,TH-01,24.0,Online
2023-10-01 08:35:00,LI-05,21.1,Online
2023-10-01 08:40:00,SEC-09,22.9,Online
2023-10-01 08:45:00,TH-01,20.2,Online
2023-10-01 08:50:00,LI-05,9.7,Online
2023-10-01 08:55:00,SEC-09,23.9,Online
2023-10-01 09:00:00,TH-01,20.7,Online
2023-10-01 09:05:00,LI-05,23.7,Online
2023-10-01 09:10:00,SEC-09,21.3,Online
2023-10-01 09:15:00,TH-01,22.4,Online
2023-10-01 09:20:00,LI-05,24.1,Online
2023-10-01 09:25:00,SEC-09,20.9,Online
2023-10-01 09:30:00,TH-01,23.5,Online
2023-10-01 09:35:00,LI-05,22.0,Online
2023-10-01 09:40:00,SEC-09,23.4,Standby
2023-10-01 09:45:00,TH-01,21.8,Online
2023-10-01 09:50:00,LI-05,22.2,Online
2023-10-01 09:55:00,SEC-09,20.5,Online
2023-10-01 10:00:00,TH-01,24.9,Online
2023-10-01 10:05:00,LI-05,30.5,Online
2023-10-01 10:10:00,SEC-09,21.7,Online
2023-10-01 10:15:00,TH-01,23.8,Online
2023-10-01 10:20:00,LI-05,22.6,Online
2023-10-01 10:25:00,SEC-09,21.0,Online
2023-10-01 10:30:00,TH-01,20.1,Online
2023-10-01 10:35:00,LI-05,24.4,Offline
2023-10-01 10:40:00,SEC-09,23.6,Online
2023-10-01 10:45:00,TH-01,21.1,Online
2023-10-01 10:50:00,LI-05,22.7,Online
2023-10-01 10:55:00,SEC-09,24.5,Online
2023-10-01 11:00:00,TH-01,23.3,Standby
2023-10-01 11:05:00,LI-05,21.4,Online
2023-10-01 11:10:00,SEC-09,22.9,Online
2023-10-01 11:15:00,TH-01,20.6,Online
2023-10-01 11:20:00,LI-05,24.7,Online
2023-10-01 11:25:00,SEC-09,21.5,Online
2023-10-01 11:30:00,TH-01,23.9,Online
2023-10-01 11:35:00,LI-05,22.8,Online
2023-10-01 11:40:00,SEC-09,20.2,Online
2023-10-01 11:45:00,TH-01,10.2,Online
2023-10-01 11:50:00,LI-05,22.1,Online
2023-10-01 11:55:00,SEC-09,23.6,Online
2023-10-01 12:00:00,TH-01,24.0,Standby
2023-10-01 12:05:00,LI-05,21.7,Online
2023-10-01 12:10:00,SEC-09,20.5,Online
2023-10-01 12:15:00,TH-01,22.5,Online
2023-10-01 12:20:00,LI-05,20.3,Online
2023-10-01 12:25:00,SEC-09,23.1,Online
2023-10-01 12:30:00,TH-01,21.9,Online
2023-10-01 12:35:00,LI-05,24.6,Online
2023-10-01 12:40:00,SEC-09,22.0,Online
2023-10-01 12:45:00,TH-01,23.4,Online
2023-10-01 12:50:00,LI-05,21.2,Online
2023-10-01 12:55:00,SEC-09,20.8,Online
2023-10-01 13:00:00,TH-01,22.3,Standby
2023-10-01 13:05:00,LI-05,23.7,Online
2023-10-01 13:10:00,SEC-09,24.1,Online
2023-10-01 13:15:00,TH-01,20.5,Online
2023-10-01 13:20:00,LI-05,22.9,Online
2023-10-01 13:25:00,SEC-09,21.4,Online
2023-10-01 13:30:00,TH-01,23.0,Online
2023-10-01 13:35:00,LI-05,30.5,Online
2023-10-01 13:40:00,SEC-09,22.2,Online
2023-10-01 13:45:00,TH-01,24.8,Online
2023-10-01 13:50:00,LI-05,21.6,Offline
2023-10-01 13:55:00,SEC-09,23.3,Online
2023-10-01 14:00:00,TH-01,22.7,Standby
2023-10-01 14:05:00,LI-05,20.9,Online
2023-10-01 14:10:00,SEC-09,24.0,Online
2023-10-01 14:15:00,TH-01,21.5,Online
2023-10-01 14:20:00,LI-05,23.2,Online
2023-10-01 14:25:00,SEC-09,22.4,Online
2023-10-01 14:30:00,TH-01,20.7,Online
2023-10-01 14:35:00,LI-05,24.1,Online
2023-10-01 14:40:00,SEC-09,23.5,Online
2023-10-01 14:45:00,TH-01,21.0,Online
2023-10-01 14:50:00,LI-05,9.8,Online
2023-10-01 14:55:00,SEC-09,22.6,Online
2023-10-01 15:00:00,TH-01,24.3,Standby
2023-10-01 15:05:00,LI-05,23.8,Online
2023-10-01 15:10:00,SEC-09,20.4,Online
2023-10-01 15:15:00,TH-01,22.1,Online
2023-10-01 15:20:00,LI-05,21.3,Online
2023-10-01 15:25:00,SEC-09,23.9,Online
2023-10-01 15:30:00,TH-01,24.7,Online
2023-10-01 15:35:00,LI-05,22.5,Online
2023-10-01 15:40:00,SEC-09,20.8,Online
2023-10-01 15:45:00,TH-01,21.9,Online
2023-10-01 15:50:00,LI-05,30.0,Online
2023-10-01 15:55:00,SEC-09,23.4,Online
2023-10-01 16:00:00,TH-01,24.2,Standby
2023-10-01 16:05:00,LI-05,21.6,Online
2023-10-01 16:10:00,SEC-09,22.8,Online
2023-10-01 16:15:00,TH-01,20.1,Online
2023-10-01 16:20:00,LI-05,31.1,Online
2023-10-01 16:25:00,SEC-09,23.7,Online
2023-10-01 16:30:00,TH-01,21.5,Online
2023-10-01 16:35:00,LI-05,24.3,Online
2023-10-01 16:40:00,SEC-09,22.0,Online
2023-10-01 16:45:00,TH-01,20.9,Offline
2023-10-01 16:50:00,LI-05,23.1,Online
2023-10-01 16:55:00,SEC-09,21.2,Online
2023-10-01 17:00:00,TH-01,24.5,Standby
2023-10-01 17:05:00,LI-05,22.6,Online
2023-10-01 17:10:00,SEC-09,20.7,Online
2023-10-01 17:15:00,TH-01,23.4,Online
2023-10-01 17:20:00,LI-05,21.8,Online
2023-10-01 17:25:00,SEC-09,24.0,Online
2023-10-01 17:30:00,TH-01,22.3,Online
2023-10-01 17:35:00,LI-05,10.1,Online
2023-10-01 17:40:00,SEC-09,23.9,Online
2023-10-01 17:45:00,TH-01,20.6,Online
2023-10-01 17:50:00,LI-05,21.4,Online
2023-10-01 17:55:00,SEC-09,22.2,Online
2023-10-01 18:00:00,TH-01,24.8,Standby
2023-10-01 18:05:00,LI-05,23.1,Online
2023-10-01 18:10:00,SEC-09,20.5,Online
2023-10-01 18:15:00,TH-01,21.7,Online
2023-10-01 18:20:00,LI-05,24.6,Online
2023-10-01 18:25:00,SEC-09,22.9,Online
2023-10-01 18:30:00,TH-01,20.3,Online
2023-10-01 18:35:00,LI-05,23.5,Online
2023-10-01 18:40:00,SEC-09,30.2,Online
2023-10-01 18:45:00,TH-01,21.0,Online
2023-10-01 18:50:00,LI-05,22.4,Online
2023-10-01 18:55:00,SEC-09,24.2,Online
2023-10-01 19:00:00,TH-01,23.6,Standby
2023-10-01 19:05:00,LI-05,20.8,Online
2023-10-01 19:10:00,SEC-09,22.0,Online
2023-10-01 19:15:00,TH-01,24.9,Online
2023-10-01 19:20:00,LI-05,21.3,Online
2023-10-01 19:25:00,SEC-09,23.2,Online
2023-10-01 19:30:00,TH-01,20.4,Online
2023-10-01 19:35:00,LI-05,22.7,Online
2023-10-01 19:40:00,SEC-09,9.9,Standby
2023-10-01 19:45:00,TH-01,24.1,Online
2023-10-01 19:50:00,LI-05,21.5,Online
2023-10-01 19:55:00,SEC-09,23.8,Online
2023-10-01 20:00:00,TH-01,20.2,Standby
2023-10-01 20:05:00,LI-05,22.6,Online
2023-10-01 20:10:00,SEC-09,24.4,Online
2023-10-01 20:15:00,TH-01,21.9,Online
2023-10-01 20:20:00,LI-05,30.3,Online
2023-10-01 20:25:00,SEC-09,23.0,Online`;
 
    const token = process.env.DATABRICKS_TOKEN;
    const filePath = "/FileStore/data/tiny_sample.csv";
    const url = process.env.DATABRICKS_HOST;
    const jobId = process.env.JOBID;

    try {
        console.log('Uploading tiny sample csv');
        const base64Csv = Buffer.from(csvContent).toString('base64');
        await axios.post(`${url}/api/2.0/dbfs/put`, {
            path: filePath,
            contents: base64Csv,
            overwrite: true
        }, {

            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        console.log('Upload successful');

        console.log('Starting anomaly job');
        const runJob = await axios.post(
            `${url}/api/2.1/jobs/run-now`,
            {
                job_id: jobId,
                job_parameters: {
                    "fileToProcess": filePath,
                    "headerToProcess": "Reading"
                }
            },

            { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );

        console.log(`Job started with run_id: ${runJob.data.run_id}`);

        let isComplete = false;

        while (!isComplete) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            const status = await axios.get(`${url}/api/2.1/jobs/runs/get`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { run_id: runJob.data.run_id }
            });
            const state = status.data.state.life_cycle_state;
            const resultState = status.data.state.result_state;
            
            console.log(`  Status: ${state}${resultState ? ` (${resultState})` : ''}`);
            if (state === 'TERMINATED' || state === 'SKIPPED' || state === 'INTERNAL_ERROR') {
                isComplete = true;
                if (resultState !== 'SUCCESS') {
                  throw new Error(`Job failed with state: ${resultState}`);
                }
            }
        }

        console.log('Getting anomaly data');
        const dbfsCsvPath = "/FileStore/data/values_compared.csv/part-00000-*.csv";
        const getDataBricksList = await axios.get(`${url}/api/2.0/dbfs/list`, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { path: "/FileStore/data/values_compared.csv" }
        });

        const csvFile = getDataBricksList.data.files.find(f => f.path.endsWith(".csv"));

        const downloadResponse = await axios.get(`${url}/api/2.0/dbfs/read`, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { path: csvFile.path }
        });

        const csvGetData = Buffer.from(downloadResponse.data.data, 'base64').toString('utf-8');

        fs.writeFileSync(path.join(process.cwd(), "values_compared.csv"), csvGetData);
        console.log(csvGetData);

    } catch (e) {
        console.error('Error:', e.response?.data || e.message);
    }

    // link to azure ai foundry here next
}

anomalizeData();

