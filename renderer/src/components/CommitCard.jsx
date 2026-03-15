import React from 'react';

// Deterministic color per repo name
const REPO_COLORS = {
  'api-server':  { bg: '#1a3d2b', icon: '#34d399' },
  'frontend':    { bg: '#2d2d2d', icon: '#9ca3af' },
  'worker':      { bg: '#1a2a4a', icon: '#60a5fa' },
  'default':     { bg: '#2a1f3d', icon: '#a78bfa' },
};

function getRepoColor(repo) {
  return REPO_COLORS[repo] ?? REPO_COLORS['default'];
}

// Single letter icon from repo name
function RepoIcon({ repo }) {
  const { bg, icon } = getRepoColor(repo);
  return (
    <div className="commit-card__icon" style={{ background: bg }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5.5" r="2.5" stroke={icon} strokeWidth="1.5" />
        <path
          d="M8 8.5v5M5 13.5h6"
          stroke={icon}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function CommitCard({ repo, message, hash, remoteUrl }) {
  function handleClick() {
    if (remoteUrl && hash) {
      window.electronAPI?.openUrl(`${remoteUrl}/commit/${hash}`);
    }
  }

  const clickable = !!(remoteUrl && hash);

  return (
    <div
      className={`commit-card${clickable ? ' commit-card--clickable' : ''}`}
      onClick={clickable ? handleClick : undefined}
      title={clickable ? 'Open on GitHub' : undefined}
    >
      <RepoIcon repo={repo} />
      <div className="commit-card__text">
        <div className="commit-card__repo">{repo} —</div>
        <div className="commit-card__message">{message}</div>
      </div>
    </div>
  );
}
