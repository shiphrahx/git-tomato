// Static level definitions — never stored in the database, never user-configurable.
const LEVELS = [
  { index: 0, title: 'Seedling',   totalXpRequired: 0     },
  { index: 1, title: 'Committer',  totalXpRequired: 100   },
  { index: 2, title: 'Shipper',    totalXpRequired: 300   },
  { index: 3, title: 'Maintainer', totalXpRequired: 700   },
  { index: 4, title: 'Staff',      totalXpRequired: 1500  },
  { index: 5, title: 'Principal',  totalXpRequired: 3000  },
  { index: 6, title: 'Legend',     totalXpRequired: 6000  },
];

module.exports = { LEVELS };
