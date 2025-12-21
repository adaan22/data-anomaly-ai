import React from 'react';
import PixelBlast from "./components/PixelBlast";
import { useState } from "react";
import axios from "axios";
import { Input } from "@chakra-ui/react";

const App: React.FC = () => {

  const [files, setFile] = useState<FileList | null>(null);
  const [progress, setProgress] = useState({ started: false, pc: 0 });
  const [msg, setMsg] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedHeader, setSelectedHeader] = useState<string>('');
  const [showInput, setShowInput] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');

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
    setShowInput(true); // Show the input field
    
    axios.post('http://localhost:3001/analyze', { column: selectedHeader })
    .then((res) =>{
      setMsg("Analysis Complete");
      console.log("Result: ", res.data)
    })
    .catch((err) => {
      setMsg("Failed");
      console.error(err);
    });
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
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files)} />
          <button onClick={handleUpload} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
            Upload
          </button>

          {headers.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <select onChange={(e) => setSelectedHeader(e.target.value)} style={{ padding: '8px', borderRadius: '4px' }}>
                <option value="">-- Select Column --</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <button onClick={handleAnalyze} style={{ padding: '10px 20px', cursor: 'pointer' }}>Analyze</button>
              
              {showInput && (
                <Input
                  placeholder="Enter additional information..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  bg="white"
                  color="black"
                  width="300px"
                />
              )}
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