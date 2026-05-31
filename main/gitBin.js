// Single source of truth for locating and invoking the git binary.
// All git calls go through spawnSync with an args array — never a shell
// command string — so commit hashes, paths, and timestamps cannot be
// interpreted as shell syntax.

const { spawnSync } = require('child_process');
const fs = require('fs');

// Windows fallback paths if 'git' is not on PATH.
const WINDOWS_GIT_FALLBACKS = [
  'C:\\Program Files\\Git\\cmd\\git.exe',
  'C:\\Program Files (x86)\\Git\\cmd\\git.exe',
];

function resolveGitBin() {
  if (process.platform !== 'win32') return 'git';
  for (const p of WINDOWS_GIT_FALLBACKS) {
    if (fs.existsSync(p)) return p; // no quoting needed — spawnSync takes args array
  }
  return 'git'; // hope it's on PATH
}

const GIT_BIN = resolveGitBin();

/**
 * Run git with the given args array in cwd. Returns trimmed stdout on success,
 * or null on non-zero exit / spawn error. Never throws.
 *
 * @param {string[]} args - git arguments, each a separate array element.
 * @param {string}   cwd  - working directory (repo path).
 * @param {number}   [timeout=5000] - ms before the child is killed.
 * @returns {string|null}
 */
function runGit(args, cwd, timeout = 5000) {
  try {
    const result = spawnSync(GIT_BIN, args, { cwd, timeout, encoding: 'utf8' });
    if (result.status !== 0 || typeof result.stdout !== 'string') return null;
    return result.stdout.trim();
  } catch (_) {
    return null;
  }
}

/**
 * Normalise a git remote URL to an https web URL.
 * git@github.com:owner/repo.git → https://github.com/owner/repo
 * Returns null for empty input.
 */
function normaliseRemoteUrl(raw) {
  if (!raw) return null;
  const ssh = raw.match(/^git@([^:]+):(.+?)(?:\.git)?$/);
  if (ssh) return `https://${ssh[1]}/${ssh[2]}`;
  return raw.replace(/\.git$/, '');
}

/** Return the normalised origin remote URL for a repo, or null. */
function getRemoteUrl(repoPath) {
  return normaliseRemoteUrl(runGit(['remote', 'get-url', 'origin'], repoPath, 3000));
}

/** Return true if the git binary is callable. */
function isGitAvailable() {
  try {
    const result = spawnSync(GIT_BIN, ['--version'], { timeout: 3000 });
    return result.status === 0;
  } catch (_) {
    return false;
  }
}

module.exports = { GIT_BIN, runGit, getRemoteUrl, normaliseRemoteUrl, isGitAvailable };
