const fs = require('fs');
const path = require('path');
const os = require('os');
const { runGit, getRemoteUrl } = require('./gitBin');

const DEFAULT_SCAN_DIRS = ['projects', 'code', 'dev', 'src', 'workspace'];

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

function getCommitsSince(isoTimestamp, repoPaths) {
  const searchPaths =
    repoPaths && repoPaths.length > 0
      ? repoPaths
      : findGitRepos(DEFAULT_SCAN_DIRS);

  const results = [];

  for (const repoPath of searchPaths) {
    if (!fs.existsSync(path.join(repoPath, '.git'))) continue;

    const output = runGit(
      ['log', `--since=${isoTimestamp}`, '--format=%H|%s|%ae', '--all'],
      repoPath
    );
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
  }

  return results;
}

function getAllCommitsForDay(dateStr, repoPaths) {
  // dateStr is 'YYYY-MM-DD' — scan from local midnight to end of day
  // Parse by parts to avoid UTC-offset day shift from ISO string parsing
  const [y, m, d] = dateStr.split('-').map(Number);
  const dayStart = new Date(y, m - 1, d, 0, 0, 0, 0);
  const dayEnd   = new Date(y, m - 1, d, 23, 59, 59, 999);

  const searchPaths =
    repoPaths && repoPaths.length > 0
      ? repoPaths
      : findGitRepos(DEFAULT_SCAN_DIRS);

  const results = [];

  for (const repoPath of searchPaths) {
    if (!fs.existsSync(path.join(repoPath, '.git'))) continue;

    const output = runGit(
      ['log', `--after=${dayStart.toISOString()}`, `--before=${dayEnd.toISOString()}`, '--format=%H|%s|%ae|%ct', '--all'],
      repoPath
    );
    if (!output) continue;

    const commits = output
      .split('\n')
      .map(line => {
        const parts = line.split('|');
        if (parts.length < 4) return null;
        const hash = parts[0].trim();
        const timestamp = parseInt(parts[parts.length - 1].trim(), 10) * 1000; // to ms
        const author = parts[parts.length - 2].trim();
        const message = parts.slice(1, parts.length - 2).join('|').trim();
        return { hash, message, author, timestamp, repo: path.basename(repoPath) };
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
  }

  return results;
}

module.exports = { getCommitsSince, findGitRepos, getAllCommitsForDay };
