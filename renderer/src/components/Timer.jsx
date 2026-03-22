import React from 'react';
import { TomatoSprite, getTomatoState } from './TomatoSprite';

const SIZE = 280;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function Timer({ timeLeft, totalSeconds, status }) {
  const progress = totalSeconds > 0 ? timeLeft / totalSeconds : 1;
  const offset = CIRCUMFERENCE * (1 - progress);
  const spriteState = getTomatoState(progress);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  const isRunning = status === 'running';

  return (
    <div className="timer-wrapper">
      {/* Glow layer behind the ring */}
      <div className={`timer-glow${isRunning ? ' timer-glow--active' : ''}`} />

      <div className="timer-ring-container" style={{ width: SIZE, height: SIZE, position: 'relative' }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="timer-svg"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <defs>
            <filter id="ring-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track ring */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={STROKE}
          />

          {/* Progress ring */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth={STROKE}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(90 ${SIZE / 2} ${SIZE / 2}) scale(1, -1) translate(0, -${SIZE})`}
            filter="url(#ring-glow)"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />

          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff8c00" />
              <stop offset="100%" stopColor="#ffcc00" />
            </linearGradient>
          </defs>
        </svg>

        {/* Inner content: tomato sprite + time label */}
        <div className="timer-inner">
          <div className={`timer-tomato${isRunning ? ' timer-tomato--bobbing' : ''}`}>
            <TomatoSprite state={spriteState} />
          </div>
          <div className="timer-time-pill">
            {mins}:{secs}
          </div>
        </div>
      </div>
    </div>
  );
}
