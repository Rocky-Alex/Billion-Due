const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'website', 'src', 'landing.css');
const destShared = path.join(__dirname, '..', 'shared', 'src', 'styles', 'landing.css');
const destApp = path.join(__dirname, '..', 'app', 'src', 'landing.css');

fs.copyFileSync(src, destShared);
fs.copyFileSync(src, destApp);
console.log('landing.css copied to shared and app.');

