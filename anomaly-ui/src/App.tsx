import React from 'react';
import FloatingLines from './components/FloatingLines';

const App: React.FC = () => {
  const handleClick = () => {
    alert('Button clicked!');
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        position: 'relative', // important for absolute children
      }}
    >
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

      {/* Button on top of FloatingLines */}
      <button
        onClick={handleClick}
        style={{
          position: 'absolute',
          top: '20px',
          left: '50px',
          zIndex: 10, // make sure it's above the canvas
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        Click Me
      </button>
    </div>
  );
};

export default App;
