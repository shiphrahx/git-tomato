import React, { useState, useEffect } from 'react';

export function Settings() {
  const [settings, setSettings] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    window.electronAPI.getSettings().then(setSettings);
  }, []);

  function handleChange(field, value) {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleRepoPathChange(index, value) {
    const updated = [...(settings.repoPaths ?? [])];
    updated[index] = value;
    setSettings(prev => ({ ...prev, repoPaths: updated }));
    setSaved(false);
  }

  function addRepoPath() {
    setSettings(prev => ({ ...prev, repoPaths: [...(prev.repoPaths ?? []), ''] }));
    setSaved(false);
  }

  function removeRepoPath(index) {
    const updated = (settings.repoPaths ?? []).filter((_, i) => i !== index);
    setSettings(prev => ({ ...prev, repoPaths: updated }));
    setSaved(false);
  }

  async function handleSave() {
    await window.electronAPI.setSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!settings) {
    return <div className="settings-loading">Loading…</div>;
  }

  return (
    <div className="settings">
      {/* Header bar — matches focus-card-header style */}
      <div className="settings__header">
        <span className="settings__header-title">git-tomato v0.1</span>
        <span className="settings__header-tag">Configuration</span>
      </div>

      {/* Timer section */}
      <div className="card settings__card">
        <div className="settings__section-title">Timer</div>

        <div className="settings__field">
          <label className="settings__label">Focus duration</label>
          <div className="settings__input-row">
            <input
              className="settings__input settings__input--number"
              type="number"
              min="1"
              max="120"
              value={settings.focusDuration}
              onChange={e => handleChange('focusDuration', parseInt(e.target.value) || 25)}
            />
            <span className="settings__unit">min</span>
          </div>
        </div>

        <div className="settings__field">
          <label className="settings__label">Short break</label>
          <div className="settings__input-row">
            <input
              className="settings__input settings__input--number"
              type="number"
              min="1"
              max="60"
              value={settings.shortBreak}
              onChange={e => handleChange('shortBreak', parseInt(e.target.value) || 5)}
            />
            <span className="settings__unit">min</span>
          </div>
        </div>

        <div className="settings__field">
          <label className="settings__label">Long break</label>
          <div className="settings__input-row">
            <input
              className="settings__input settings__input--number"
              type="number"
              min="1"
              max="60"
              value={settings.longBreak ?? 15}
              onChange={e => handleChange('longBreak', parseInt(e.target.value) || 15)}
            />
            <span className="settings__unit">min</span>
          </div>
        </div>
      </div>

      {/* GitHub section */}
      <div className="card settings__card">
        <div className="settings__section-title">GitHub</div>
        <div className="settings__field">
          <label className="settings__label">Personal access token</label>
          <input
            className="settings__input"
            type="password"
            placeholder="ghp_••••••••••••••••••••"
            value={settings.githubToken ?? ''}
            onChange={e => handleChange('githubToken', e.target.value)}
          />
          <p className="settings__hint">
            Used to open commit links and future GitHub integrations.
            Needs <code>repo</code> scope.
          </p>
        </div>
      </div>

      {/* Watched repositories section */}
      <div className="card settings__card">
        <div className="settings__section-title">Watched repositories</div>
        <p className="settings__hint settings__hint--top">
          Directories scanned for git commits at session end. Leave empty to
          auto-discover repos in ~/projects, ~/code, and ~/dev.
        </p>

        <div className="settings__repo-list">
          {(settings.repoPaths ?? []).map((p, i) => (
            <div key={i} className="settings__repo-row">
              <input
                className="settings__input settings__input--path"
                type="text"
                placeholder="/Users/you/projects/my-app"
                value={p}
                onChange={e => handleRepoPathChange(i, e.target.value)}
              />
              <button
                className="settings__repo-remove"
                onClick={() => removeRepoPath(i)}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button className="settings__add-repo" onClick={addRepoPath}>
          + Add path
        </button>
      </div>

      {/* Footer / save */}
      <div className="settings__footer">
        <button
          className={`btn btn--primary${saved ? ' btn--saved' : ''}`}
          onClick={handleSave}
        >
          {saved ? 'Saved ✓' : 'Save settings'}
        </button>
      </div>
    </div>
  );
}
