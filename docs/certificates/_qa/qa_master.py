import os,numpy as np,cv2,fitz
from PIL import Image
CERT=r'c:\Users\11e\Documents\ELA\PROJET\docs\certificates'
svg=os.path.join(CERT,'ELA_CERTIFICATE_MASTER.svg')
# token check
t=open(svg,encoding='utf-8').read()
print('remaining {{QR_CODE}} token in svg:', '{{QR_CODE}}' in t)
print('data:image count in svg:', t.count('data:image/png;base64'))
# render patched SVG
doc=fitz.open(svg)
pg=doc[0]; pix=pg.get_pixmap(matrix=fitz.Matrix(1448/pg.rect.width,1086/pg.rect.height))
a=np.frombuffer(pix.samples,dtype=np.uint8).reshape(pix.height,pix.width,pix.n)[:,:,:3].copy()
cv2.imwrite(os.path.join(CERT,'_qa','svg_master_render.png'),cv2.cvtColor(a,cv2.COLOR_RGB2BGR))
d=cv2.QRCodeDetector(); ok,pts,_=d.detectAndDecode(cv2.cvtColor(a,cv2.COLOR_RGB2GRAY))
print('patched SVG render QR count:', 1 if ok else 0, 'decoded=', (ok[:40] if ok else ''))
# master baked image QR count
mi=os.path.join(CERT,'MASTER','ELA_CERTIFICATE_MASTER_STATIC.png')
g=cv2.cvtColor(np.asarray(Image.open(mi).convert('RGB')),cv2.COLOR_RGB2GRAY)
ok2,_,_=d.detectAndDecode(g)
print('MASTER baked image QR count (expect 0):', 1 if ok2 else 0)
