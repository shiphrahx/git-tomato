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
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <rect x="4" y="3" width="4" height="14" rx="1" />
              <rect x="12" y="3" width="4" height="14" rx="1" />
            </svg>
          </button>
        ) : (
          <button className="ctrl-btn ctrl-btn--primary" onClick={onStart} title={status === 'paused' ? 'Resume' : 'Start'}>
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <polygon points="5,3 18,10 5,17" />
            </svg>
          </button>
        )}

        {/* Restart */}
        <button className="ctrl-btn ctrl-btn--secondary" onClick={onReset} title="Restart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8" />
            <polyline points="3,3 3,8 8,8" />
          </svg>
        </button>

        {/* Settings */}
        <button className="ctrl-btn ctrl-btn--ghost" onClick={onConfig} title="Settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
