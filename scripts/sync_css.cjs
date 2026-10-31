const fs = require('fs');
const path = require('path');

const sharedDir = path.join(__dirname, '..', 'shared', 'src', 'styles');
const targets = [
  path.join(__dirname, '..', 'website', 'src'),
  path.join(__dirname, '..', 'app', 'src'),
];

const cssFiles = fs.readdirSync(sharedDir).filter(f => f.endsWith('.css'));

for (const target of targets) {
  for (const file of cssFiles) {
    const srcPath = path.join(sharedDir, file);
    const destPath = path.join(target, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file} -> ${target}`);
  }
}
console.log('CSS sync complete.');

