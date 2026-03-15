import React from 'react';
import { CommitCard } from './CommitCard';

export function CommitList({ commits }) {
  if (!commits || commits.length === 0) return null;

  return (
    <div className="commit-list">
      {commits.map((item, i) => (
        <React.Fragment key={i}>
          {/* Connector dot between cards */}
          {i > 0 && <div className="commit-list__connector" />}
          <CommitCard repo={item.repo} message={item.message} />
        </React.Fragment>
      ))}
    </div>
  );
}
