import React from 'react';
import FloatingLines from './components/FloatingLines';
import {useState} from "react";
import axios from "axios";

const App: React.FC = () => {

  const [files, setFile] = useState<FileList | null>(null);
  const [progress, setProgress] = useState({started: false, pc: 0});
  const [msg, setMsg] = useState<string | null>(null);

  function handleUpload() {
    if (!files) {
      setMsg("No file selected");
      return;
    }

    const fd = new FormData();
    for (let i = 0; i < files.length; i++) {
      fd.append(`file${i+1}`, files[i]);
    }

    setMsg("Uploading...");
    setProgress(prevState => {
      return {...prevState, started: true}
    })
    axios.post('https://httpbin.org/post', fd, {
      onUploadProgress: (e) => {
        if (!e.total) return;
        setProgress({
          started: true,
          pc: Math.round((e.loaded/e.total) * 100),
        });
      },
      headers: {
        "Custom-Header": "value",
      }
    }) 
    .then (res => {
      setMsg("Upload Successfull");
      console.log(res.data)
    })
    .catch (err => {
      setMsg("Upload Failed");
      console.error(err)
    });
  }

  return (
    <div style={{position: 'absolute', inset: 0}}>

      <div style={{position: 'absolute', inset: 0, zIndex: 0}}>
        <FloatingLines
          linesGradient={['#FF00FF', '#00FFFF', '#FFFF00']}
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={[6, 6, 6]}
          lineDistance={[5, 5, 5]}
          topWavePosition={{ x: 10, y: 0.5, rotate: -0.4 }}
          middleWavePosition={{ x: 5, y: 0, rotate: 0.2 }}
          bottomWavePosition={{ x: 2, y: -0.7, rotate: 0.4 }}
          animationSpeed={1}
          interactive={true}
          bendRadius={5.0}
          bendStrength={-0.5}
          parallax={true}
          parallaxStrength={0.2}
          mixBlendMode="screen"
        />
      </div>

      <div style={{position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'white'}}>

        <input onChange = { (e) => {setFile(e.target.files) } } type = "file" multiple/>

        <button onClick = { handleUpload }
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Upload
        </button>

        { progress.started && <progress max = "100" value = {progress.pc}></progress>}
        { msg && <span>{msg}</span>}

      </div>
    </div>
  );
};

export default App;
