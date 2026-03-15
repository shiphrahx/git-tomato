import React, { useState } from 'react';

export function SessionCard({ session }) {
  const [expanded, setExpanded] = useState(false);

  const startTime = new Date(session.started_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = new Date(session.ended_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalCommits = session.repos.reduce((sum, r) => sum + r.commits.length, 0);
  const hasCommits = totalCommits > 0;

  return (
    <div className={`session-card session-card--${session.type}`}>
      <button
        className="session-card__header"
        onClick={() => hasCommits && setExpanded(e => !e)}
        style={{ cursor: hasCommits ? 'pointer' : 'default' }}
      >
        <span className="session-card__type">
          {session.type === 'focus' ? 'Focus' : 'Break'}
        </span>
        <span className="session-card__time">{startTime} – {endTime}</span>
        <span className="session-card__commits">
          {hasCommits
            ? `${totalCommits} commit${totalCommits !== 1 ? 's' : ''} ${expanded ? '▲' : '▼'}`
            : 'no commits'}
        </span>
      </button>

      {expanded && hasCommits && (
        <div className="session-card__body">
          {session.repos.map(r => (
            <div key={r.repo} className="session-card__repo">
              <div className="session-card__repo-name">{r.repo}</div>
              <ul className="session-card__commits-list">
                {r.commits.map(c => (
                  <li key={c.hash} className="session-card__commit">
                    <code className="session-card__hash">{c.hash}</code>
                    <span className="session-card__message">{c.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
