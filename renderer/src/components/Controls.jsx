import React from 'react';

export function Controls({ status, onStart, onPause, onReset }) {
  const isRunning = status === 'running';
  const isIdle = status === 'idle';

  return (
    <div className="controls">
      {isRunning ? (
        <button className="btn btn--primary" onClick={onPause}>Pause</button>
      ) : (
        <button className="btn btn--primary" onClick={onStart}>
          {status === 'paused' ? 'Resume' : 'Start'}
        </button>
      )}
      <button className="btn btn--secondary" onClick={onReset} disabled={isIdle}>
        Reset
      </button>
    </div>
  );
}
