import React from 'react';

const Debug = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: 'red', color: 'white' }}>
      <h1>Debug Component Loaded</h1>
      <p>If you can see this, React is working</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default Debug;
