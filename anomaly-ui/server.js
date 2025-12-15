import express from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
app.use(cors())
const upload = multer({ dest: 'uploads/'});

app.post('/upload', upload.array('file'), (req, res) => {
    console.log(req.files);
    res.json({ success: true});
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));