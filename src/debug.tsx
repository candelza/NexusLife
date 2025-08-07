import React from 'react';

const Debug = () => {
  console.log('Debug component loaded');
  return (
    <div style={{ padding: '20px', backgroundColor: 'red', color: 'white' }}>
      <h1>Debug Component Loaded</h1>
      <p>If you can see this, React is working</p>
    </div>
  );
};

export default Debug;
