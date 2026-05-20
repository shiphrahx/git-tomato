import { describe, it, expect } from 'vitest';

// Import only the pure functions (no store dep)
// We stub require('better-sqlite3') and require('electron') so the module can load
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Minimal stubs so main-process modules can be required without Electron
const Module = require('module');
const _orig = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  if (request === 'electron') return request;
  if (request === 'better-sqlite3') return request;
  return _orig.call(this, request, ...args);
};
require.extensions['.js'] = require.extensions['.js'] || ((m, f) => m._compile(require('fs').readFileSync(f, 'utf8'), f));

// Stub electron
require.cache['electron'] = { id: 'electron', filename: 'electron', loaded: true, exports: { app: { getPath: () => '/tmp', getVersion: () => '1.0.0' } } };

// Stub better-sqlite3 — not needed for pure functions
require.cache['better-sqlite3'] = { id: 'better-sqlite3', filename: 'better-sqlite3', loaded: true, exports: class DB { constructor() {} pragma() {} exec() {} prepare() { return { all: () => [], get: () => null, run: () => ({}) }; } transaction(fn) { return fn; } close() {} } };

const { LEVELS } = require('../main/levels.js');
const { deriveLevel, computeXpFields } = require('../main/xp.js');

describe('LEVELS', () => {
  it('starts at 0 XP for Seedling', () => {
    expect(LEVELS[0].title).toBe('Seedling');
    expect(LEVELS[0].totalXpRequired).toBe(0);
  });

  it('ends at Legend', () => {
    expect(LEVELS[LEVELS.length - 1].title).toBe('Legend');
  });

  it('is sorted ascending by totalXpRequired', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].totalXpRequired).toBeGreaterThan(LEVELS[i - 1].totalXpRequired);
    }
  });
});

describe('deriveLevel', () => {
  it('returns Seedling at 0 XP', () => {
    expect(deriveLevel(0).title).toBe('Seedling');
  });

  it('returns Seedling at 99 XP', () => {
    expect(deriveLevel(99).title).toBe('Seedling');
  });

  it('returns Committer at exactly 100 XP', () => {
    expect(deriveLevel(100).title).toBe('Committer');
  });

  it('returns Committer at 299 XP', () => {
    expect(deriveLevel(299).title).toBe('Committer');
  });

  it('returns Shipper at 300 XP', () => {
    expect(deriveLevel(300).title).toBe('Shipper');
  });

  it('returns Legend at 6000+ XP', () => {
    expect(deriveLevel(6000).title).toBe('Legend');
    expect(deriveLevel(99999).title).toBe('Legend');
  });
});

describe('computeXpFields', () => {
  it('at 0 XP: level 0, xpSince 0, xpToNext 100', () => {
    const f = computeXpFields(0);
    expect(f.levelIndex).toBe(0);
    expect(f.xpSinceLevel).toBe(0);
    expect(f.xpToNextLevel).toBe(100);
  });

  it('at 50 XP: level 0, xpSince 50, xpToNext 100', () => {
    const f = computeXpFields(50);
    expect(f.levelIndex).toBe(0);
    expect(f.xpSinceLevel).toBe(50);
    expect(f.xpToNextLevel).toBe(100);
  });

  it('at 100 XP: level 1 (Committer), xpSince 0, xpToNext 200', () => {
    const f = computeXpFields(100);
    expect(f.levelIndex).toBe(1);
    expect(f.xpSinceLevel).toBe(0);
    expect(f.xpToNextLevel).toBe(200); // 300 - 100
  });

  it('at 6000 XP (Legend): xpToNextLevel is null', () => {
    const f = computeXpFields(6000);
    expect(f.levelIndex).toBe(6);
    expect(f.xpToNextLevel).toBeNull();
  });
});
