import React from 'react';

const SIZE = 160;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function Timer({ timeLeft, totalSeconds, status }) {
  const progress = totalSeconds > 0 ? timeLeft / totalSeconds : 1;
  const offset = CIRCUMFERENCE * (1 - progress);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  const isRunning = status === 'running';

  return (
    <div className="timer-wrapper">
      {/* Glow layer behind the ring */}
      <div className={`timer-glow${isRunning ? ' timer-glow--active' : ''}`} />

      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="timer-svg"
      >
        <defs>
          <filter id="ring-glow">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
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
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={STROKE}
        />

        {/* Progress ring */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#ff4d4d"
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          filter="url(#ring-glow)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />

        {/* Time label */}
        <text
          x={SIZE / 2}
          y={SIZE / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize="38"
          fontWeight="700"
          fontFamily="-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Segoe UI', sans-serif"
          letterSpacing="-1"
        >
          {mins}:{secs}
        </text>
      </svg>
    </div>
  );
}
