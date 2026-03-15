const { Notification } = require('electron');

function sendSessionCompleteNotification(session) {
  if (!Notification.isSupported()) return;

  const totalCommits = session.repos.reduce((sum, r) => sum + r.commits.length, 0);
  const repoNames = session.repos.map(r => r.repo);

  let body;
  if (totalCommits === 0) {
    body = 'No commits this session. Time for a stretch!';
  } else if (repoNames.length === 1) {
    body = `${totalCommits} commit${totalCommits !== 1 ? 's' : ''} in ${repoNames[0]}`;
  } else {
    const lastRepo = repoNames.pop();
    body = `${totalCommits} commit${totalCommits !== 1 ? 's' : ''} across ${repoNames.join(', ')} and ${lastRepo}`;
  }

  const durationMins = session.durationMinutes;
  const title = `${durationMins} min ${session.type === 'focus' ? 'focus' : 'break'} complete`;

  new Notification({ title, body, silent: false }).show();
}

module.exports = { sendSessionCompleteNotification };
