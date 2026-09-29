import os,base64,io,numpy as np
from PIL import Image
CERT=r'c:\Users\11e\Documents\ELA\PROJET\docs\certificates'
BASE=r'c:\Users\11e\Documents\ELA\PROJET'
MASTER=os.path.join(CERT,'MASTER'); os.makedirs(MASTER,exist_ok=True)
clean=np.asarray(Image.open(os.path.join(BASE,'functions','ela-certificate-static.png')).convert('RGB')).copy()
ref  =np.asarray(Image.open(os.path.join(CERT,'ELA_CERTIFICATE_REFERENCE.png')).convert('RGB'))
mi=clean.copy()
mi[228:288,:]=ref[228:288,:]   # restore title band (title + static underline) only
Image.fromarray(mi).save(os.path.join(MASTER,'ELA_CERTIFICATE_MASTER_STATIC.png'))
# base64
buf=io.BytesIO(); Image.fromarray(mi).save(buf,'PNG',optimize=True)
b=base64.b64encode(buf.getvalue()).decode()
open(os.path.join(CERT,'_qa','master_b64.txt'),'w').write(b)
print('master_image written; b64 len',len(b))
# QR geometry in svg pt
SCALE=595.28/1086.0; OX=(841.89-1448*SCALE)/2
qx=OX+1230*SCALE; qy=860*SCALE; qs=150*SCALE
print('QR svg pt: x=%.4f y=%.4f size=%.4f'%(qx,qy,qs))
