import numpy as np,cv2,os
from PIL import Image
CERT=r'c:\Users\11e\Documents\ELA\PROJET\docs\certificates'
d=cv2.QRCodeDetector()
def qr_count(p):
    g=cv2.cvtColor(np.asarray(Image.open(p).convert('RGB')),cv2.COLOR_RGB2GRAY)
    ok,info,pts,straight=d.detectAndDecodeMulti(g)
    n=0
    if info is not None: n=sum(1 for x in info if x)
    return n,(info if info else [])
for name in [r'ELA_CERTIFICATE_REFERENCE.png', r'..\..\functions\ela-certificate-static.png', r'MASTER\ELA_CERTIFICATE_MASTER_STATIC.png', r'_qa\render_engine_test.png', r'MASTER\ELA_CERTIFICATE_MASTER_TEST_FINAL.png']:
    n,info=qr_count(os.path.join(CERT,name))
    print('%-42s QR=%d'%(os.path.basename(name),n))
