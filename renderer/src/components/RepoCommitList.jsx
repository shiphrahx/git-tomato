import React, { useState } from 'react';

function isInSession(timestamp, sessionWindows) {
  return sessionWindows.some(w => timestamp >= w.started_at && timestamp <= w.ended_at);
}

function RepoSection({ repoData, sessionWindows }) {
  const [expanded, setExpanded] = useState(true);
  const { repo, remoteUrl, commits } = repoData;

  return (
    <div className="rcl-repo">
      <button className="rcl-repo__header" onClick={() => setExpanded(e => !e)}>
        <span className="rcl-repo__icon">⎇</span>
        <span className="rcl-repo__name">{repo}</span>
        <span className="rcl-repo__meta">
          {commits.length} commit{commits.length !== 1 ? 's' : ''}
        </span>
        <span className="rcl-repo__chevron">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <ul className="rcl-commits">
          {commits.map(c => {
            const duringSession = isInSession(c.timestamp, sessionWindows);
            return (
              <li key={c.hash} className="rcl-commit">
                <code
                  className={`rcl-commit__hash${remoteUrl ? ' rcl-commit__hash--link' : ''}`}
                  onClick={() => remoteUrl && window.electronAPI?.openUrl(`${remoteUrl}/commit/${c.hash}`)}
                  title={remoteUrl ? 'Open on GitHub' : undefined}
                >
                  {c.hash.slice(0, 7)}
                </code>
                <span className="rcl-commit__message">{c.message}</span>
                {duringSession && (
                  <span className="rcl-commit__badge" title="Committed while the timer was running">
                    🍅
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function RepoCommitList({ repos, sessionWindows }) {
  if (!repos || repos.length === 0) return null;

  return (
    <div className="rcl">
      {repos.map(r => (
        <RepoSection key={r.repo} repoData={r} sessionWindows={sessionWindows} />
      ))}
    </div>
  );
}
