// ============================================================
// FIX SYNTAX — Diagnostic et reparation de free-trial.page.js
// Usage : node fix-syntax.js
// ============================================================

const fs = require('fs');

const filePath = 'src/ela/pages/free-trial.page.js';
let content = fs.readFileSync(filePath, 'utf8');

console.log('========================================');
console.log('DIAGNOSTIC SYNTAXE');
console.log('========================================');
console.log('');

// 1. Afficher les lignes 280-290
const lines = content.split('\n');
console.log('Lignes 278-290 :');
for (let i = 277; i < Math.min(292, lines.length); i++) {
  console.log(`  ${i+1}: ${lines[i]}`);
}
console.log('');

// 2. Verifier les parentheses globales
let openParens = 0;
let openBrackets = 0;
let openBraces = 0;
let inString = false;
let stringChar = '';
let lineNum = 1;

for (let i = 0; i < content.length; i++) {
  const ch = content[i];
  const prev = content[i-1];

  if (ch === '\n') lineNum++;

  // Gestion des strings
  if (!inString && (ch === '"' || ch === "'" || ch === '`')) {
    inString = true;
    stringChar = ch;
  } else if (inString && ch === stringChar && prev !== '\\') {
    inString = false;
  }

  if (inString) continue;

  if (ch === '(') openParens++;
  if (ch === ')') openParens--;
  if (ch === '[') openBrackets++;
  if (ch === ']') openBrackets--;
  if (ch === '{') openBraces++;
  if (ch === '}') openBraces--;
}

console.log('Balance globale :');
console.log(`  Parentheses () : ${openParens > 0 ? '+' : ''}${openParens}`);
console.log(`  Crochets []    : ${openBrackets > 0 ? '+' : ''}${openBrackets}`);
console.log(`  Accolades {}   : ${openBraces > 0 ? '+' : ''}${openBraces}`);
console.log('');

if (openParens === 0 && openBrackets === 0 && openBraces === 0) {
  console.log('Balance PARFAITE — le probleme est ailleurs.');
} else {
  console.log('DES EQUILIBRES SONT INCORRECTS !');
}

// 3. Verifier chaque fonction individuellement
console.log('');
console.log('Verification des fonctions :');

const funcRegex = /(?:export\s+)?function\s+(\w+)\s*\(/g;
let match;
while ((match = funcRegex.exec(content)) !== null) {
  const funcName = match[1];
  const startIdx = match.index;

  // Trouver la fin de la fonction (accolade fermante au niveau 0)
  let braceCount = 0;
  let foundOpen = false;
  let endIdx = startIdx;

  for (let i = startIdx; i < content.length; i++) {
    const ch = content[i];
    const prev = content[i-1];

    if (ch === '"' || ch === "'" || ch === '`') {
      // Skip string — simplifie, ne gere pas les escapes
      const quote = ch;
      i++;
      while (i < content.length && content[i] !== quote) i++;
      continue;
    }

    if (ch === '{') {
      braceCount++;
      foundOpen = true;
    } else if (ch === '}') {
      braceCount--;
      if (foundOpen && braceCount === 0) {
        endIdx = i;
        break;
      }
    }
  }

  const funcBody = content.substring(startIdx, endIdx + 1);

  // Compter les parentheses dans le corps de la fonction
  let fp = 0;
  for (const c of funcBody) {
    if (c === '(') fp++;
    if (c === ')') fp--;
  }

  const status = fp === 0 ? 'OK' : `ERR(${fp>0?'+':''}${fp})`;
  console.log(`  ${funcName.padEnd(20)} : ${status}`);
}

console.log('');
console.log('========================================');
console.log('FIN DU DIAGNOSTIC');
console.log('========================================');
