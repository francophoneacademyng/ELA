"""
ELA Certificate — Visual Duplication Test (OCR-based, corrected master coordinates).

Verifies:
  1. STATIC artwork has ZERO dynamic/sample content (via OCR).
  2. FINAL PDF text layer: each dynamic field exactly once; no legacy values.
  3. FINAL QR: exactly one, decoding to the verification URL.
"""
import os, sys
import numpy as np
import cv2
import fitz
from PIL import Image
from rapidocr_onnxruntime import RapidOCR

PROJ = r'C:/Users/11e/Documents/ELA/PROJET'
STATIC = os.path.join(PROJ, 'functions', 'ela-certificate-static.png')
FINAL_PDF = os.path.join(PROJ, 'docs', 'certificates', 'MASTER', 'ELA_CERTIFICATE_MASTER_TEST_FINAL.pdf')
FINAL_PNG = os.path.join(PROJ, 'docs', 'certificates', 'MASTER', 'ELA_CERTIFICATE_MASTER_TEST_FINAL.png')

FAIL = []
engine = RapidOCR()

def ocr_text(path):
    img = np.asarray(Image.open(path).convert('RGB'))
    result, _ = engine(img)
    return ' '.join((l[1] or '') for l in (result or []))

def check(name, cond, detail=''):
    print('  [%s] %s %s' % ('PASS' if cond else 'FAIL', name, detail))
    if not cond:
        FAIL.append(name)

# ---- 1. STATIC (OCR) ----
print('1. STATIC artwork (OCR) — sample data must be ZERO:')
static_text = ocr_text(STATIC)
for bad in ['DEMO-ELA-TEST', 'DEMO', '85%', 'Level A1', 'A1', '2026-01-15', '2029-01-15',
            'Amara Diallo', 'Francophone Academy', 'French B1 Programme', 'CERTIFICATE OF']:
    check('static forbids %r' % bad, bad not in static_text, 'found=%d' % static_text.count(bad))

# ---- 2. FINAL PNG (OCR) ----
print('2. FINAL PNG (OCR) — sample data must be ZERO:')
final_text = ocr_text(FINAL_PNG)
for bad in ['DEMO-ELA-TEST', 'DEMO', '85%', 'Level A1', '2026-01-15', '2029-01-15']:
    check('final forbids %r' % bad, bad not in final_text, 'found=%d' % final_text.count(bad))

# ---- 3. FINAL PDF text layer ----
print('3. FINAL PDF text layer:')
doc = fitz.open(FINAL_PDF)
pg = doc[0]
t = pg.get_text()
check('single page', doc.page_count == 1)
check('A4 landscape', abs(pg.rect.width - 841.89) < 1 and abs(pg.rect.height - 595.28) < 1)
for f in ['CERTIFICATE OF PROFICIENCY', 'Amara Diallo', 'Francophone Academy', 'French B1 Programme',
          'Level B1', 'ISSUE DATE', 'VALID UNTIL', 'CERTIFICATE NO.', 'OVERALL RESULT',
          '2026-09-29', '2029-09-28', '87%', 'Programme Director', 'ELA Certification Authority', 'integrity hash']:
    check('field x1 %s' % f, t.count(f) == 1, 'count=%d' % t.count(f))
for bad in ['DEMO-ELA-TEST', 'DEMO', '85%', 'Level A1', 'A1', '2026-01-15', '2029-01-15']:
    check('pdf forbids %r' % bad, t.count(bad) == 0, 'count=%d' % t.count(bad))
check('URL correct', 'elaacademy.ng/verify.html?id=ELA-FR-B1-JEX2WS' in t)
check('hash present', '81d83c87' in t)

# ---- 4. QR ----
print('4. QR:')
pix = pg.get_pixmap(matrix=fitz.Matrix(3, 3))
a = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)[:, :, :3].copy()
g = cv2.cvtColor(a, cv2.COLOR_RGB2GRAY)
d = cv2.QRCodeDetector()
ok, info, pts, _ = d.detectAndDecodeMulti(g)
decoded = [x for x in (info or []) if x]
check('QR = 1', len(decoded) == 1, 'count=%d' % len(decoded))
check('QR decodes URL', decoded == ['https://elaacademy.ng/verify.html?id=ELA-FR-B1-JEX2WS'], str(decoded))

print()
print('RESULT:', 'ALL PASS' if not FAIL else 'FAILURES: %s' % ', '.join(FAIL))
sys.exit(0 if not FAIL else 1)
