const fs = require('fs');
const path = require('path');

// 1. Update shared/src/styles/styles.css
const stylesPath = path.join(__dirname, '..', 'shared', 'src', 'styles', 'styles.css');
let styles = fs.readFileSync(stylesPath, 'utf8');

// Replace dark setup container
styles = styles.replace(
  /\.desktop-setup-container\{min-height:100vh;background:radial-gradient\(circle at 10% 20%,#141e3c 0%,#080e22 90%\);padding:40px 20px;display:flex;flex-direction:column;align-items:center;justify-content:center\}/,
  '.desktop-setup-container{min-height:100vh;background:#f8fafc;padding:40px 20px;display:flex;flex-direction:column;align-items:center;justify-content:center}'
);

styles = styles.replace(
  /\.install-wizard\{width:100%;max-width:720px;background:#ffffff;border-radius:18px;box-shadow:0 30px 80px rgba\(0,0,0,0\.45\);border:1px solid #233054;overflow:hidden;animation:slideIn \.3s ease\}/,
  '.install-wizard{width:100%;max-width:720px;background:#ffffff;border-radius:18px;box-shadow:0 20px 60px rgba(0,169,255,0.15);border:1px solid #89CFF3;overflow:hidden;animation:slideIn .3s ease}'
);

styles = styles.replace(
  /\.wizard-header\{background:linear-gradient\(135deg,#0c1530 0%,#1a2854 100%\);color:#fff;padding:26px 32px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #243460\}/,
  '.wizard-header{background:linear-gradient(135deg,#CDF5FD 0%,#ffffff 100%);color:#0f172a;padding:26px 32px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #89CFF3}'
);

styles = styles.replace(
  /\.wizard-header h1\{font:800 22px 'Manrope';letter-spacing:-\.6px;margin:3px 0 0;color:#fff\}/,
  '.wizard-header h1{font:800 22px \'Manrope\';letter-spacing:-.6px;margin:3px 0 0;color:#0f172a}'
);

styles = styles.replace(
  /\.wizard-header p\{font-size:11px;color:#9cb0dc;margin:4px 0 0\}/,
  '.wizard-header p{font-size:11px;color:#475569;margin:4px 0 0}'
);

styles = styles.replace(/\.wizard-step-item\.active\{color:#5740d9\}/, '.wizard-step-item.active{color:#00A9FF}');
styles = styles.replace(/\.wizard-step-item\.completed\{color:#0d9472\}/, '.wizard-step-item.completed{color:#00A9FF}');
styles = styles.replace(/\.wizard-step-item\.active \.wizard-step-num\{background:#5740d9;color:#fff\}/, '.wizard-step-item.active .wizard-step-num{background:#00A9FF;color:#fff}');
styles = styles.replace(/\.wizard-step-item\.completed \.wizard-step-num\{background:#0d9472;color:#fff\}/, '.wizard-step-item.completed .wizard-step-num{background:#00A9FF;color:#fff}');

// Replace split-preview-canvas
styles = styles.replace(
  /\.split-preview-canvas \{\s*background: #0b1120;/g,
  '.split-preview-canvas {\n  background: #f1f5f9;'
);

// Replace default-badge
styles = styles.replace(
  /\.template-card-badge\.default-badge \{\s*background: linear-gradient\(135deg, #113537 0%, #1e5c5f 100%\);[\s\S]*?color: #CDF5FD;[\s\S]*?box-shadow: 0 2px 8px rgba\(17, 53, 55, 0\.35\);/g,
  '.template-card-badge.default-badge {\n  background: linear-gradient(135deg, #00A9FF 0%, #89CFF3 100%);\n  border: 1px solid rgba(255, 255, 255, 0.35);\n  color: #ffffff;\n  box-shadow: 0 2px 8px rgba(0, 169, 255, 0.25);'
);

// Replace invoice-paper-logo-fallback
styles = styles.replace(
  /\.invoice-paper-logo-fallback \{\s*width: 48px;\s*height: 48px;\s*border-radius: 8px;\s*background: #113537;/g,
  '.invoice-paper-logo-fallback {\n  width: 48px;\n  height: 48px;\n  border-radius: 8px;\n  background: #00A9FF;'
);

// Replace relogin form card
styles = styles.replace(
  /\.relogin-form-card \{\s*background: #111a34;\s*border: 1px solid #28375c;[\s\S]*?box-shadow: 0 12px 36px rgba\(0, 0, 0, 0\.35\);/g,
  '.relogin-form-card {\n  background: #ffffff;\n  border: 1px solid #89CFF3;\n  border-radius: 12px;\n  padding: 22px;\n  width: 100%;\n  text-align: left;\n  margin: 16px 0;\n  box-shadow: 0 12px 36px rgba(0, 169, 255, 0.12);'
);
styles = styles.replace(/border-bottom: 1px solid #1f2c4c;/g, 'border-bottom: 1px solid #e2e8f0;');
styles = styles.replace(/\.relogin-form-head h3 \{\s*font: 700 14px 'Manrope', sans-serif;\s*color: #fff;/g, '.relogin-form-head h3 {\n  font: 700 14px \'Manrope\', sans-serif;\n  color: #0f172a;');
styles = styles.replace(/\.relogin-form-body label \{\s*display: block;\s*font-size: 10px;\s*font-weight: 700;\s*color: #94a3b8;/g, '.relogin-form-body label {\n  display: block;\n  font-size: 10px;\n  font-weight: 700;\n  color: #475569;');
styles = styles.replace(/\.relogin-form-body input \{\s*width: 100%;\s*background: #090e1d;\s*border: 1px solid #253356;\s*border-radius: 8px;\s*color: #f8fafc;/g, '.relogin-form-body input {\n  width: 100%;\n  background: #f8fafc;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n  color: #0f172a;');

fs.writeFileSync(stylesPath, styles, 'utf8');
console.log('styles.css updated successfully.');

// 2. Update shared/src/styles/desktop.css
const desktopPath = path.join(__dirname, '..', 'shared', 'src', 'styles', 'desktop.css');
let desktop = fs.readFileSync(desktopPath, 'utf8');

// Sidebar
desktop = desktop.replace(
  /\.desktop-sidebar \{\s*width: 215px;\s*flex-shrink: 0;\s*height: 100%;\s*background: linear-gradient\(180deg, #0b1120 0%, #080e1a 100%\);\s*color: #cbd5e1;\s*padding: 10px 8px;\s*display: flex;\s*flex-direction: column;\s*border-right: 1px solid rgba\(255, 255, 255, 0\.06\);\s*box-shadow: 2px 0 16px rgba\(0, 0, 0, 0\.15\);/g,
  '.desktop-sidebar {\n  width: 215px;\n  flex-shrink: 0;\n  height: 100%;\n  background: #ffffff;\n  color: #0f172a;\n  padding: 10px 8px;\n  display: flex;\n  flex-direction: column;\n  border-right: 1px solid #e2e8f0;\n  box-shadow: 2px 0 16px rgba(0, 169, 255, 0.05);'
);

desktop = desktop.replace(
  /\.menu-icon \{\s*border: 0;\s*background: rgba\(255, 255, 255, 0\.05\);\s*color: #94a3b8;/g,
  '.menu-icon {\n  border: 1px solid #e2e8f0;\n  background: #f8fafc;\n  color: #475569;'
);
desktop = desktop.replace(
  /\.menu-icon:hover \{\s*background: rgba\(255, 255, 255, 0\.1\);\s*color: #fff;/g,
  '.menu-icon:hover {\n  background: #CDF5FD;\n  color: #00A9FF;'
);

desktop = desktop.replace(
  /\.desktop-sidebar button \{\s*border: 0;\s*background: transparent;\s*color: #94a3b8;/g,
  '.desktop-sidebar button {\n  border: 0;\n  background: transparent;\n  color: #64748b;'
);

desktop = desktop.replace(
  /\.desktop-sidebar button:hover \{\s*background: rgba\(255, 255, 255, 0\.06\);\s*color: #f8fafc;\s*transform: translateX\(3px\);/g,
  '.desktop-sidebar button:hover {\n  background: #CDF5FD;\n  color: #00A9FF;\n  transform: translateX(3px);'
);

desktop = desktop.replace(
  /\.desktop-sidebar nav button\.active \{\s*background: linear-gradient\(135deg, rgba\(0, 169, 255, 0\.2\) 0%, rgba\(0, 169, 255, 0\.08\) 100%\);\s*color: #89CFF3;\s*font-weight: 700;\s*border-left: 3px solid #00A9FF;\s*box-shadow: 0 2px 10px rgba\(0, 169, 255, 0\.15\);/g,
  '.desktop-sidebar nav button.active {\n  background: #CDF5FD;\n  color: #00A9FF;\n  font-weight: 700;\n  border-left: 3px solid #00A9FF;\n  box-shadow: 0 2px 10px rgba(0, 169, 255, 0.15);'
);

desktop = desktop.replace(/border-top: 1px solid rgba\(255, 255, 255, 0\.08\);/g, 'border-top: 1px solid #e2e8f0;');

desktop = desktop.replace(
  /\.desktop-user \{\s*display: flex;\s*gap: 9px;\s*align-items: center;\s*padding: 8px 10px;\s*border-radius: 9px;\s*background: rgba\(255, 255, 255, 0\.04\);\s*border: 1px solid rgba\(255, 255, 255, 0\.06\);/g,
  '.desktop-user {\n  display: flex;\n  gap: 9px;\n  align-items: center;\n  padding: 8px 10px;\n  border-radius: 9px;\n  background: #CDF5FD;\n  border: 1px solid #89CFF3;'
);
desktop = desktop.replace(
  /\.desktop-user:hover \{\s*background: rgba\(255, 255, 255, 0\.08\);\s*border-color: rgba\(0, 169, 255, 0\.3\);/g,
  '.desktop-user:hover {\n  background: #A0E9FF;\n  border-color: #00A9FF;'
);
desktop = desktop.replace(
  /\.desktop-user b \{\s*font-size: 12px;\s*font-weight: 700;\s*color: #f8fafc;/g,
  '.desktop-user b {\n  font-size: 12px;\n  font-weight: 700;\n  color: #0f172a;'
);
desktop = desktop.replace(
  /\.desktop-user small \{\s*font-size: 10px;\s*color: #94a3b8;/g,
  '.desktop-user small {\n  font-size: 10px;\n  color: #64748b;'
);

// Payments hero
desktop = desktop.replace(
  /\.payments-hero \{\s*display: grid;\s*grid-template-columns: auto 1fr 1fr 1fr;\s*align-items: center;\s*background: linear-gradient\(135deg, #0b1120 0%, #1e293b 100%\);\s*color: #ffffff;\s*border-radius: 14px;\s*padding: 24px 28px;\s*gap: 24px;\s*margin-bottom: 24px;\s*box-shadow: 0 10px 30px rgba\(11, 17, 32, 0\.15\);/g,
  '.payments-hero {\n  display: grid;\n  grid-template-columns: auto 1fr 1fr 1fr;\n  align-items: center;\n  background: linear-gradient(135deg, #CDF5FD 0%, #ffffff 100%);\n  color: #0f172a;\n  border: 1px solid #89CFF3;\n  border-radius: 14px;\n  padding: 24px 28px;\n  gap: 24px;\n  margin-bottom: 24px;\n  box-shadow: 0 10px 30px rgba(0, 169, 255, 0.08);'
);
desktop = desktop.replace(
  /\.payments-hero>svg \{\s*font-size: 40px;\s*color: #89CFF3;/g,
  '.payments-hero>svg {\n  font-size: 40px;\n  color: #00A9FF;'
);

// Desktop statusbar
desktop = desktop.replace(
  /\.desktop-statusbar \{\s*position: relative;\s*flex-shrink: 0;\s*height: 26px;\s*background: #080d19;\s*border-top: 1px solid rgba\(255, 255, 255, 0\.08\);\s*color: #94a3b8;/g,
  '.desktop-statusbar {\n  position: relative;\n  flex-shrink: 0;\n  height: 26px;\n  background: #ffffff;\n  border-top: 1px solid #e2e8f0;\n  color: #64748b;'
);
desktop = desktop.replace(
  /\.desktop-statusbar span:first-child \{\s*color: #89CFF3;/g,
  '.desktop-statusbar span:first-child {\n  color: #00A9FF;'
);
desktop = desktop.replace(
  /\.desktop-statusbar button \{\s*margin-left: auto;\s*border: 1px solid rgba\(255, 255, 255, 0\.12\);\s*background: rgba\(255, 255, 255, 0\.06\);\s*color: #e2e8f0;/g,
  '.desktop-statusbar button {\n  margin-left: auto;\n  border: 1px solid #89CFF3;\n  background: #CDF5FD;\n  color: #00A9FF;'
);
desktop = desktop.replace(
  /\.desktop-statusbar button:hover \{\s*background: rgba\(255, 255, 255, 0\.12\);\s*color: #fff;/g,
  '.desktop-statusbar button:hover {\n  background: #A0E9FF;\n  color: #00A9FF;'
);

fs.writeFileSync(desktopPath, desktop, 'utf8');
console.log('desktop.css updated successfully.');

