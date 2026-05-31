import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { normaliseRemoteUrl } = require('../main/gitBin.js');

describe('normaliseRemoteUrl', () => {
  it('returns null for empty input', () => {
    expect(normaliseRemoteUrl('')).toBeNull();
    expect(normaliseRemoteUrl(null)).toBeNull();
    expect(normaliseRemoteUrl(undefined)).toBeNull();
  });

  it('converts SSH remote to https web URL', () => {
    expect(normaliseRemoteUrl('git@github.com:owner/repo.git')).toBe('https://github.com/owner/repo');
  });

  it('converts SSH remote without .git suffix', () => {
    expect(normaliseRemoteUrl('git@github.com:owner/repo')).toBe('https://github.com/owner/repo');
  });

  it('strips trailing .git from https URLs', () => {
    expect(normaliseRemoteUrl('https://github.com/owner/repo.git')).toBe('https://github.com/owner/repo');
  });

  it('leaves a clean https URL unchanged', () => {
    expect(normaliseRemoteUrl('https://github.com/owner/repo')).toBe('https://github.com/owner/repo');
  });

  it('handles non-github SSH hosts', () => {
    expect(normaliseRemoteUrl('git@gitlab.com:group/sub/repo.git')).toBe('https://gitlab.com/group/sub/repo');
  });
});
