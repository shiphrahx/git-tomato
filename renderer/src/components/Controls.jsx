import React from 'react';

export function Controls({ status, type, onStart, onPause, onReset, onSelectFocus, onSelectShortBreak, onSelectLongBreak, onConfig }) {
  const isRunning = status === 'running';

  return (
    <div className="controls">
      {/* Mode selector row */}
      <div className="controls__modes">
        <button
          className={`ctrl-btn ctrl-btn--mode${type === 'focus' ? ' ctrl-btn--mode-active' : ''}`}
          onClick={onSelectFocus}
          title="Focus"
          disabled={isRunning}
        >
          Focus
        </button>
        <button
          className={`ctrl-btn ctrl-btn--mode${type === 'shortBreak' ? ' ctrl-btn--mode-active' : ''}`}
          onClick={onSelectShortBreak}
          title="Short Break"
          disabled={isRunning}
        >
          Short
        </button>
        <button
          className={`ctrl-btn ctrl-btn--mode${type === 'longBreak' ? ' ctrl-btn--mode-active' : ''}`}
          onClick={onSelectLongBreak}
          title="Long Break"
          disabled={isRunning}
        >
          Long
        </button>
      </div>

      {/* Action row */}
      <div className="controls__actions">
        {/* Play / Pause */}
        {isRunning ? (
          <button className="ctrl-btn ctrl-btn--primary" onClick={onPause} title="Pause">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect x="4" y="3" width="4" height="14" rx="1" />
              <rect x="12" y="3" width="4" height="14" rx="1" />
            </svg>
          </button>
        ) : (
          <button className="ctrl-btn ctrl-btn--primary" onClick={onStart} title={status === 'paused' ? 'Resume' : 'Start'}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <polygon points="5,3 18,10 5,17" />
            </svg>
          </button>
        )}

        {/* Restart */}
        <button className="ctrl-btn ctrl-btn--secondary" onClick={onReset} title="Restart">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 6A7.5 7.5 0 1 1 3 10.5" />
            <polyline points="1,3 3.5,6 6,3" />
          </svg>
        </button>

        {/* Settings */}
        <button className="ctrl-btn ctrl-btn--ghost" onClick={onConfig} title="Settings">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 1.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z" />
            <path fillRule="evenodd" clipRule="evenodd" d="M8.47 1.07a1 1 0 0 1 3.06 0l.35 1.22a7.05 7.05 0 0 1 1.77 1.02l1.24-.3a1 1 0 0 1 1.1.5l.53.92a1 1 0 0 1-.18 1.2l-.91.81a7.1 7.1 0 0 1 0 2.04l.91.81a1 1 0 0 1 .18 1.2l-.53.92a1 1 0 0 1-1.1.5l-1.24-.3a7.05 7.05 0 0 1-1.77 1.02l-.35 1.22a1 1 0 0 1-3.06 0l-.35-1.22A7.05 7.05 0 0 1 6.35 12l-1.24.3a1 1 0 0 1-1.1-.5l-.53-.92a1 1 0 0 1 .18-1.2l.91-.81a7.1 7.1 0 0 1 0-2.04l-.91-.81a1 1 0 0 1-.18-1.2l.53-.92a1 1 0 0 1 1.1-.5l1.24.3A7.05 7.05 0 0 1 8.12 2.3l.35-1.22z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
