const fs = require('fs');
const path = require('path');

// STRICTLY 4 COLORS ONLY:
// C1: #00A9FF
// C2: #89CFF3
// C3: #A0E9FF
// C4: #CDF5FD

const mapping = {
  // Purples -> C1 / C2 / C4
  '#6a55e6': '#00A9FF',
  '#513bc7': '#00A9FF',
  '#745fea': '#00A9FF',
  '#7c66ef': '#00A9FF',
  '#563fc6': '#89CFF3',
  '#7866df': '#00A9FF',
  '#745deb': '#00A9FF',
  '#5d47d4': '#89CFF3',
  '#6652dd': '#00A9FF',
  '#5d47d5': '#00A9FF',
  '#604bd1': '#00A9FF',
  '#6550d4': '#00A9FF',
  '#6c56df': '#00A9FF',
  '#7561dd': '#00A9FF',
  '#5d4ec0': '#00A9FF',
  '#6751dc': '#00A9FF',
  '#935fd7': '#89CFF3',
  '#f0edff': '#CDF5FD',
  '#eeeaff': '#CDF5FD',
  '#f3f0ff': '#CDF5FD',
  '#e3ddff': '#CDF5FD',
  '#f5ecff': '#CDF5FD',

  // Greens -> C1 / C2 / C3 / C4
  '#10977a': '#00A9FF',
  '#35d19e': '#00A9FF',
  '#148569': '#00A9FF',
  '#102e29': '#00A9FF',
  '#eafff8': '#CDF5FD',
  '#246857': '#89CFF3',
  '#23ae84': '#00A9FF',
  '#299377': '#00A9FF',
  '#e8f7f2': '#CDF5FD',
  '#f5faf8': '#CDF5FD',
  '#dceee8': '#CDF5FD',
  '#437263': '#89CFF3',
  '#91a69f': '#89CFF3',
  '#10b981': '#00A9FF',
  '#059669': '#00A9FF',
  '#047857': '#89CFF3',
  '#34d399': '#89CFF3',
  '#6ee7b7': '#A0E9FF',
  '#a7f3d0': '#89CFF3',
  '#bbf7d0': '#A0E9FF',
  '#ecfdf5': '#CDF5FD',
  '#f0fdf4': '#CDF5FD',
  '#f0fdf9': '#CDF5FD',
  '#166534': '#00A9FF',
  '#15803d': '#00A9FF',

  // Other blues -> C1 / C2 / C3 / C4
  '#2576dc': '#00A9FF',
  '#3071cc': '#00A9FF',
  '#edf4ff': '#CDF5FD',
  '#1598aa': '#00A9FF',
  '#e8f8fa': '#CDF5FD',
  '#0077c8': '#00A9FF',
  '#005fa3': '#89CFF3',
  '#0369a1': '#00A9FF',
  '#008be3': '#00A9FF',
  '#0066aa': '#00A9FF',
  '#0284c7': '#00A9FF',
  '#3b82f6': '#00A9FF',
  '#2563eb': '#00A9FF',
  '#1d4ed8': '#00A9FF',
  '#60a5fa': '#89CFF3',
  '#93c5fd': '#A0E9FF',
  '#bfdbfe': '#CDF5FD',
  '#dbeafe': '#CDF5FD',
  '#eff6ff': '#CDF5FD',
  '#6366f1': '#00A9FF',
  '#4f46e5': '#00A9FF',
  '#3730a3': '#00A9FF',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const [k, v] of Object.entries(mapping)) {
    const reg = new RegExp(k, 'gi');
    content = content.replace(reg, v);
  }

  // Replace shadow hexes with alpha: #604bc950, #5c48ce2b, #7561dd18, etc.
  content = content.replace(/#[0-9a-f]{8}/gi, (match) => {
    // If it's a 8-digit hex ending in alpha
    return 'rgba(0, 169, 255, 0.2)';
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Cleaned colors in:', filePath);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (['node_modules', '.git', 'release', 'dist'].includes(e.name)) continue;
    if (e.isDirectory()) walk(full);
    else if (e.name.endsWith('.css') || e.name.endsWith('.tsx')) {
      processFile(full);
    }
  }
}

['website/src', 'app/src', 'shared/src'].forEach(d => {
  const p = path.join(__dirname, '..', d);
  if (fs.existsSync(p)) walk(p);
});

console.log('Finished strictly applying the 4 palette colors.');

