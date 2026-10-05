/**
 * ELA — functions/test/academy-scope.test.js   (PURE, no Firebase)
 * Tests de l'isolation par académie + rôle du roster enseignant
 * (P0-1 : Teacher Students).
 * Exécution : node functions/test/academy-scope.test.js
 */
const assert = require('assert');
const scope = require('../academy-scope.js');

let passed = 0, failed = 0;
function ok(name, fn) {
  try { fn(); passed++; console.log('  PASS  ' + name); }
  catch (e) { failed++; console.error('  FAIL  ' + name + ' -- ' + e.message); }
}

const STUDENT = (over) => Object.assign({ uid: 's1', role: 'student', academy: 'french' }, over || {});

console.log('--- academy-scope: normalizeAcademyKey ---');
ok('key "french" -> FR', () => assert.strictEqual(scope.normalizeAcademyKey('french'), 'FR'));
ok('code "FR" -> FR', () => assert.strictEqual(scope.normalizeAcademyKey('FR'), 'FR'));
ok('key "mandarin" -> ZH', () => assert.strictEqual(scope.normalizeAcademyKey('mandarin'), 'ZH'));
ok('unknown -> null', () => assert.strictEqual(scope.normalizeAcademyKey('nope'), null));
ok('empty -> null', () => assert.strictEqual(scope.normalizeAcademyKey(''), null));

console.log('--- academy-scope: isStudentRole ---');
ok('student is student', () => assert.strictEqual(scope.isStudentRole('student'), true));
ok('undefined role is student', () => assert.strictEqual(scope.isStudentRole(undefined), true));
ok('teacher is not student', () => assert.strictEqual(scope.isStudentRole('teacher'), false));
ok('admin is not student', () => assert.strictEqual(scope.isStudentRole('admin'), false));
ok('examiner is not student', () => assert.strictEqual(scope.isStudentRole('examiner'), false));

console.log('--- academy-scope: filterTeacherStudents ---');
ok('admin sees all students (all academies)', () => {
  const out = scope.filterTeacherStudents([
    { uid: 'a', role: 'student', academy: 'french' },
    { uid: 'b', role: 'student', academy: 'german' },
    { uid: 'c', role: 'teacher', academy: 'french' },
    { uid: 'd', role: 'admin' }
  ], null, true);
  assert.deepStrictEqual(out, ['a', 'b']);
});

ok('owner teacher sees only same-academy students', () => {
  const out = scope.filterTeacherStudents([
    { uid: 'a', role: 'student', academy: 'french' },
    { uid: 'b', role: 'student', academy: 'german' },
    { uid: 'c', role: 'student', academies: ['french', 'german'] }
  ], 'french', false);
  assert.deepStrictEqual(out, ['a', 'c']);
});

ok('non-owner teacher (different academy) sees no foreign students', () => {
  const out = scope.filterTeacherStudents([
    { uid: 'a', role: 'student', academy: 'french' },
    { uid: 'b', role: 'student', academy: 'german' }
  ], 'german', false);
  assert.deepStrictEqual(out, ['b']);
});

ok('academy isolation enforced across codes (teacher FR, student DE)', () => {
  const out = scope.filterTeacherStudents([{ uid: 'a', role: 'student', academy: 'german' }], 'FR', false);
  assert.deepStrictEqual(out, []);
});

ok('teacher without academy sees no students', () => {
  const out = scope.filterTeacherStudents([{ uid: 'a', role: 'student', academy: 'french' }], null, false);
  assert.deepStrictEqual(out, []);
});

ok('teacher/admins/examiners never appear as students', () => {
  const out = scope.filterTeacherStudents([
    { uid: 't', role: 'teacher', academy: 'french' },
    { uid: 'a', role: 'admin', academy: 'french' },
    { uid: 'e', role: 'examiner', academy: 'french' },
    { uid: 's', role: 'student', academy: 'french' }
  ], 'french', false);
  assert.deepStrictEqual(out, ['s']);
});

ok('empty records -> empty result', () => {
  assert.deepStrictEqual(scope.filterTeacherStudents([], 'french', false), []);
});

ok('populated teacher sees all same-academy students', () => {
  const records = [];
  for (let i = 0; i < 5; i++) records.push({ uid: 's' + i, role: 'student', academy: 'french' });
  records.push({ uid: 'x', role: 'student', academy: 'arabic' });
  const out = scope.filterTeacherStudents(records, 'french', false);
  assert.strictEqual(out.length, 5);
  assert.deepStrictEqual(out, ['s0', 's1', 's2', 's3', 's4']);
});

console.log('\nACADEMY-SCOPE-PURE: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
