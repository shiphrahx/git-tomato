// Fallback level definitions for the renderer.
//
// The authoritative source is main/levels.js; App fetches it at startup via
// window.electronAPI.getLevels() and passes the result down as props. This copy
// is used only before that fetch resolves or if the IPC call fails, so the XP
// bar can still render. If main/levels.js changes, this fallback may briefly
// lag but the live values override it once getLevels() returns.
export const LEVELS = [
  { index: 0, title: 'Seedling',   totalXpRequired: 0    },
  { index: 1, title: 'Committer',  totalXpRequired: 100  },
  { index: 2, title: 'Shipper',    totalXpRequired: 300  },
  { index: 3, title: 'Maintainer', totalXpRequired: 700  },
  { index: 4, title: 'Staff',      totalXpRequired: 1500 },
  { index: 5, title: 'Principal',  totalXpRequired: 3000 },
  { index: 6, title: 'Legend',     totalXpRequired: 6000 },
];
