import React from 'react';
import PixelBlast from "./components/PixelBlast";
import { useState } from "react";
import axios from "axios";

const App: React.FC = () => {

  const [files, setFile] = useState<FileList | null>(null);
  const [progress, setProgress] = useState({ started: false, pc: 0 });
  const [msg, setMsg] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedHeader, setSelectedHeader] = useState<string>('');

  function handleUpload() {
    if (!files) {
      setMsg("No file selected");
      return;
    }

    const fd = new FormData();
    for (let i = 0; i < files.length; i++) {
      fd.append('file', files[i]);
    }

    setMsg("Uploading...");
    setProgress(prev => ({ ...prev, started: true }));

    axios.post('http://localhost:3001/upload', fd, {
      onUploadProgress: (e) => {
        if (!e.total) return;
        setProgress({
          started: true,
          pc: Math.round((e.loaded / e.total) * 100),
        });
      }
    })
    .then((res) => {
      setMsg("Upload Successful");
      if (res.data.headers) {
        setHeaders(res.data.headers); 
      }
    })
    .catch(() => setMsg("Upload Failed"));
  }

  const handleAnalyze = () => {
    if (!selectedHeader) {
      setMsg("Select a header first");
      return;
    }
    setMsg(`Analyzing column: ${selectedHeader}`);
    // go to databricks
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>

      <PixelBlast
        variant="square"
        pixelSize={3}
        color="#8A2BE2"
        patternScale={2.5}
        patternDensity={1.2}
        enableRipples={true}
        rippleIntensityScale={1.5}
        edgeFade={0.35}
        speed={0.6}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      />

      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #3A0CA3, #7209B7)',
          borderRadius: '22px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          color: 'white',
          boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
          border: '2px solid #3A0CA3'
        }}>
          <input type="file" multiple accept=".csv" onChange={(e) => setFile(e.target.files)} />
          <button onClick={handleUpload} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
            Upload
          </button>

          {headers.length > 0 && (
            <div>
              <select onChange={(e) => setSelectedHeader(e.target.value)}>
                <option value="">-- Select Column --</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <button onClick={handleAnalyze}>Analyze</button>
            </div>
          )}

          {progress.started && <progress max="100" value={progress.pc} />}
          {msg && <span>{msg}</span>}
        </div>
      </div>

    </div>
  );
};

export default App;
