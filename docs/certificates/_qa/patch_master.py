import re,os
CERT=r'c:\Users\11e\Documents\ELA\PROJET\docs\certificates'
master_b64=open(os.path.join(CERT,'_qa','master_b64.txt')).read().strip()
qr_b64=open(os.path.join(CERT,'_qa','qr_b64.txt')).read().strip()
QR_IMG='<image x="698.3038" y="471.4004" width="82.2210" height="82.2210" href="data:image/png;base64,%s"/>'%qr_b64
def patch(txt,fn):
    n_img=len(re.findall(r'data:image/png;base64,[A-Za-z0-9+/=]+',txt))
    assert n_img==1,'unexpected image count %d in %s'%(n_img,fn)
    txt=re.sub(r'data:image/png;base64,[A-Za-z0-9+/=]+','data:image/png;base64,'+master_b64,txt,count=1)
    before=txt
    txt=re.sub(r'<text[^>]*>\{\{QR_CODE\}\}</text>',QR_IMG,txt,count=1)
    assert txt!=before,'QR text token not replaced in %s'%fn
    return txt
for fn in ['ELA_CERTIFICATE_MASTER.svg','ELA_CERTIFICATE_MASTER.html']:
    p=os.path.join(CERT,fn)
    txt=open(p,encoding='utf-8').read()
    out=patch(txt,fn)
    open(p,'w',encoding='utf-8').write(out)
    print('patched',fn,'-> size',len(out))
print('done')
