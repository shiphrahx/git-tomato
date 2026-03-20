const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULT_SCAN_DIRS = ['projects', 'code', 'dev', 'src', 'workspace'];

// Windows fallback paths if 'git' is not in PATH
const WINDOWS_GIT_FALLBACKS = [
  'C:\\Program Files\\Git\\cmd\\git.exe',
  'C:\\Program Files (x86)\\Git\\cmd\\git.exe',
];

function resolveGitBin() {
  if (process.platform !== 'win32') return 'git';
  for (const p of WINDOWS_GIT_FALLBACKS) {
    if (fs.existsSync(p)) return `"${p}"`;
  }
  return 'git'; // hope it's in PATH
}

const GIT_BIN = resolveGitBin();

function findGitRepos(baseDirs) {
  const repos = [];
  for (const dir of baseDirs) {
    const fullDir = path.isAbsolute(dir) ? dir : path.join(os.homedir(), dir);
    if (!fs.existsSync(fullDir)) continue;
    try {
      const entries = fs.readdirSync(fullDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const candidate = path.join(fullDir, entry.name, '.git');
        if (fs.existsSync(candidate)) {
          repos.push(path.join(fullDir, entry.name));
        }
      }
    } catch (_) {
      // permission errors — skip silently
    }
  }
  return repos;
}

function getRemoteUrl(repoPath) {
  try {
    const raw = execSync(`${GIT_BIN} remote get-url origin`, {
      cwd: repoPath,
      timeout: 3000,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    // Normalise SSH → HTTPS: git@github.com:owner/repo.git → https://github.com/owner/repo
    const ssh = raw.match(/^git@([^:]+):(.+?)(?:\.git)?$/);
    if (ssh) return `https://${ssh[1]}/${ssh[2]}`;
    // Strip trailing .git from HTTPS URLs
    return raw.replace(/\.git$/, '');
  } catch (_) {
    return null;
  }
}

function getCommitsSince(isoTimestamp, repoPaths) {
  const searchPaths =
    repoPaths && repoPaths.length > 0
      ? repoPaths
      : findGitRepos(DEFAULT_SCAN_DIRS);

  const results = [];

  for (const repoPath of searchPaths) {
    if (!fs.existsSync(path.join(repoPath, '.git'))) continue;

    try {
      const output = execSync(
        `${GIT_BIN} log --since="${isoTimestamp}" --format="%H|%s|%ae" --all`,
        {
          cwd: repoPath,
          timeout: 5000,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
        }
      ).trim();

      if (!output) continue;

      const commits = output
        .split('\n')
        .map(line => {
          const parts = line.split('|');
          if (parts.length < 3) return null;
          const hash = parts[0].trim();
          const author = parts[parts.length - 1].trim();
          // join middle parts to handle pipe chars in commit messages
          const message = parts.slice(1, parts.length - 1).join('|').trim();
          return { hash, message, author, repo: path.basename(repoPath) };
        })
        .filter(c => c && c.hash);

      if (commits.length > 0) {
        results.push({
          repo: path.basename(repoPath),
          repoPath,
          remoteUrl: getRemoteUrl(repoPath),
          commits,
        });
      }
    } catch (_) {
      // repo inaccessible, empty, or git not available — skip
    }
  }

  return results;
}

module.exports = { getCommitsSince, findGitRepos };
