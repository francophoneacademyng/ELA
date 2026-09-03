// ============================================================
// FIND SYNTAX ERROR — Trouve la ligne exacte du desequilibre
// Usage : node find-error.js
// ============================================================

const fs = require('fs');

const content = fs.readFileSync('src/ela/pages/free-trial.page.js', 'utf8');
const lines = content.split('\n');

console.log('========================================');
console.log('RECHERCHE DE LIGNE ORPHELINE');
console.log('========================================');
console.log('');

let braceCount = 0;
let parenCount = 0;
let bracketCount = 0;
let inString = false;
let stringChar = '';

for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
  const line = lines[lineIdx];

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const prev = i > 0 ? line[i-1] : '';

    // Gestion strings (simplifiee)
    if (!inString && (ch === '"' || ch === "'" || ch === '`')) {
      inString = true;
      stringChar = ch;
      continue;
    }
    if (inString && ch === stringChar && prev !== '\\') {
      inString = false;
      continue;
    }
    if (inString) continue;

    if (ch === '(') parenCount++;
    if (ch === ')') parenCount--;
    if (ch === '[') bracketCount++;
    if (ch === ']') bracketCount--;
    if (ch === '{') braceCount++;
    if (ch === '}') braceCount--;
  }

  // Afficher les lignes ou le compte devient negatif (erreur evidente)
  if (parenCount < 0 || bracketCount < 0 || braceCount < 0) {
    console.log(`LIGNE ${lineIdx + 1} : NEGATIF !`);
    console.log(`  Texte : ${line.trim()}`);
    console.log(`  ()=${parenCount} []=${bracketCount} {}=${braceCount}`);
    console.log('');
  }
}

console.log('');
console.log('========================================');
console.log('BILAN FINAL');
console.log('========================================');
console.log(`Parentheses () : ${parenCount > 0 ? '+' : ''}${parenCount}`);
console.log(`Crochets []    : ${bracketCount > 0 ? '+' : ''}${bracketCount}`);
console.log(`Accolades {}   : ${braceCount > 0 ? '+' : ''}${braceCount}`);
console.log('');

// Chercher les lignes vides entre les fonctions qui pourraient contenir du code orphelin
console.log('Lignes suspectes (code entre fonctions) :');
let lastFuncEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].match(/^function /) || lines[i].match(/^export function /)) {
    if (lastFuncEnd !== -1 && i > lastFuncEnd + 2) {
      console.log(`  Lignes ${lastFuncEnd + 2}-${i} :`);
      for (let j = lastFuncEnd + 1; j < i && j < lines.length; j++) {
        if (lines[j].trim() && !lines[j].trim().startsWith('//')) {
          console.log(`    ${j+1}: ${lines[j].trim()}`);
        }
      }
    }
    // Trouver la fin de cette fonction
    let bCount = 0;
    let found = false;
    for (let k = i; k < lines.length; k++) {
      for (let c = 0; c < lines[k].length; c++) {
        const ch = lines[k][c];
        if (ch === '{') { bCount++; found = true; }
        if (ch === '}') { bCount--; }
        if (found && bCount === 0) {
          lastFuncEnd = k;
          break;
        }
      }
      if (found && bCount === 0) break;
    }
  }
}
