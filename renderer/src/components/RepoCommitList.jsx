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
        <span className="rcl-repo__dot" />
        <span className="rcl-repo__name">{repo}</span>
        <span className="rcl-repo__count">{commits.length}</span>
        <svg
          className={`rcl-repo__chevron${expanded ? ' rcl-repo__chevron--open' : ''}`}
          width="12" height="12" viewBox="0 0 12 12"
          fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
        >
          <polyline points="2,4 6,8 10,4" />
        </svg>
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
                  <span className="rcl-commit__tomato" title="Committed during a session">🍅</span>
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
