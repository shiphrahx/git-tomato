import React, { useState, useEffect } from 'react';

const TIER_LABELS = { standard: 'Standard', stretch: 'Stretch', elite: 'Elite' };
const TIER_XP = { standard: 20, stretch: 35, elite: 50 };

function formatQuestName(q) {
  return (q.nameTemplate ?? '')
    .replace('{n}', q.targetValue ?? '')
    .replace('{time}', q.targetValue != null ? `${String(q.targetValue).padStart(2, '0')}:00` : '');
}

function formatCountdown(nowMs) {
  const d = new Date(nowMs);
  const midnight = new Date(d);
  midnight.setHours(24, 0, 0, 0);
  const diffMs = midnight.getTime() - nowMs;
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function isBinaryQuest(slug) {
  return ['deletion_day', 'beat_yesterday', 'golden_hour', 'consistency_window', 'morning_session', 'streak_extend'].includes(slug);
}

function QuestCard({ quest }) {
  const name = formatQuestName(quest);
  const isComplete = quest.status === 'complete';
  const isExpired = quest.status === 'expired';
  const isBinary = isBinaryQuest(quest.slug);

  return (
    <div className={`quest-card quest-card--${quest.status} quest-card--${quest.tier}`}>
      <div className="quest-card__header">
        <span className={`quest-card__tier quest-card__tier--${quest.tier}`}>
          {TIER_LABELS[quest.tier]}
        </span>
        <span className="quest-card__xp">+{quest.xpReward ?? TIER_XP[quest.tier]} XP</span>
      </div>
      <div className="quest-card__name">{name}</div>
      <div className="quest-card__footer">
        {isComplete && (
          <span className="quest-card__status quest-card__status--complete">✓ Complete</span>
        )}
        {isExpired && (
          <span className="quest-card__status quest-card__status--expired">Expired</span>
        )}
        {!isComplete && !isExpired && !isBinary && quest.targetValue > 0 && (
          <span className="quest-card__progress">
            {quest.progress ?? 0} / {quest.targetValue}
          </span>
        )}
        {!isComplete && !isExpired && isBinary && (
          <span className="quest-card__progress quest-card__progress--binary">—</span>
        )}
      </div>
    </div>
  );
}

function HistoryView({ onBack }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.getQuestHistory().then(slates => setHistory(slates ?? []));
  }, []);

  return (
    <div className="quests-history">
      <button className="quests-history__back" onClick={onBack}>← Back</button>
      <div className="quests__section-title">Quest history</div>
      {history.length === 0 && (
        <p className="quests__empty">No quest history yet.</p>
      )}
      {history.map(slate => (
        <div key={slate.date} className="quests-history__slate">
          <div className="quests-history__date">{slate.date}</div>
          {(slate.quests ?? []).map(q => (
            <QuestCard key={q.slug} quest={q} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function Quests() {
  const [slate, setSlate] = useState(undefined); // undefined = loading, null = no slate
  const [now, setNow] = useState(Date.now());
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!window.electronAPI) return;

    window.electronAPI.getQuestSlate().then(s => setSlate(s ?? null));

    const unsub = window.electronAPI.onQuestsUpdated(s => setSlate(s ?? null));

    // F-5: update countdown every minute
    const ticker = setInterval(() => setNow(Date.now()), 60000);

    return () => {
      unsub();
      clearInterval(ticker);
    };
  }, []);

  if (showHistory) {
    return <HistoryView onBack={() => setShowHistory(false)} />;
  }

  return (
    <div className="quests">
      <div className="quests__header">
        <span className="quests__title">Daily Quests</span>
        {slate && (
          <span className="quests__countdown">Resets in {formatCountdown(now)}</span>
        )}
      </div>

      {/* F-6: no slate yet */}
      {slate === null && (
        <div className="quests__placeholder">
          <p className="quests__placeholder-text">
            Quests will be generated after your first session of the day.
          </p>
        </div>
      )}

      {/* Loading */}
      {slate === undefined && (
        <div className="quests__placeholder">
          <p className="quests__placeholder-text">Loading...</p>
        </div>
      )}

      {/* Quest cards */}
      {slate && (slate.quests ?? []).map(q => (
        <QuestCard key={q.slug} quest={q} />
      ))}

      {/* F-7: history link */}
      <button className="quests__history-btn" onClick={() => setShowHistory(true)}>
        Quest history
      </button>
    </div>
  );
}
