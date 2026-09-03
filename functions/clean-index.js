// ============================================================
// CLEAN INDEX.JS — Réduit la taille pour éviter le timeout Firebase
// Usage : node clean-index.js
// Backup : crée index.js.backup avant modification
// ============================================================

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.js');
const backupPath = path.join(__dirname, 'index.js.backup');

console.log('========================================');
console.log('CLEANING index.js');
console.log('========================================');
console.log('');

// 1. Backup
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(filePath, backupPath);
  console.log('✓ Backup created: index.js.backup');
}

let content = fs.readFileSync(filePath, 'utf8');
const originalSize = content.length / 1024;
console.log(`Original size: ${originalSize.toFixed(2)} KB`);
console.log('');

// 2. Supprimer les commentaires multilignes /* ... */
const before = content.length;
content = content.replace(/\/\*[\s\S]*?\*\//g, '');
console.log(`Removed block comments: -${((before - content.length)/1024).toFixed(2)} KB`);

// 3. Supprimer les commentaires de documentation //
const before2 = content.length;
content = content.replace(/^\s*\/\/.*$/gm, '');
console.log(`Removed line comments: -${((before2 - content.length)/1024).toFixed(2)} KB`);

// 4. Supprimer les lignes vides multiples (plus de 2 lignes vides consécutives)
const before3 = content.length;
content = content.replace(/\n{3,}/g, '\n\n');
console.log(`Removed extra blank lines: -${((before3 - content.length)/1024).toFixed(2)} KB`);

// 5. Supprimer les espaces en fin de ligne
const before4 = content.length;
content = content.replace(/[ \t]+$/gm, '');
console.log(`Removed trailing spaces: -${((before4 - content.length)/1024).toFixed(2)} KB`);

// 6. Supprimer les console.log au top-level (pas dans les fonctions)
// C'est risqué, on le fait seulement si le fichier est encore trop gros
const currentSize = content.length / 1024;
if (currentSize > 55) {
  const before5 = content.length;
  // Supprimer les console.log qui ne sont pas indentés (top-level)
  content = content.replace(/^console\.(log|warn|error|info)\(.*\);?\s*$/gm, '');
  console.log(`Removed top-level console.log: -${((before5 - content.length)/1024).toFixed(2)} KB`);
}

// 7. Réduire les objets de configuration sur une seule ligne (si possible)
// Pas toujours sûr, on saute cette étape

// 8. Sauvegarder
fs.writeFileSync(filePath, content);
const newSize = content.length / 1024;
console.log('');
console.log('========================================');
console.log(`Final size: ${newSize.toFixed(2)} KB`);
console.log(`Reduction: ${(originalSize - newSize).toFixed(2)} KB (${((1 - newSize/originalSize)*100).toFixed(1)}%)`);
console.log('');

if (newSize < 50) {
  console.log('✓ TARGET REACHED (< 50 KB)');
  console.log('You can now deploy:');
  console.log('  firebase deploy --only functions:getDashboardData');
} else {
  console.log('⚠ Still too big. Need more aggressive cleaning.');
  console.log('Consider splitting into modules.');
}
console.log('========================================');

// 9. Vérification syntaxe
try {
  require('vm').runInNewContext(content, { require, console, process, exports, module, Buffer, setTimeout, setInterval, clearTimeout, clearInterval });
  console.log('✓ Syntax check passed');
} catch (e) {
  console.error('✗ SYNTAX ERROR:', e.message);
  console.log('Restoring backup...');
  fs.copyFileSync(backupPath, filePath);
  console.log('Backup restored.');
}
