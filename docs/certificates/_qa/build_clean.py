import os, sys, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

BASE = r'c:\Users\11e\Documents\ELA\PROJET'
CERT = os.path.join(BASE,'docs','certificates')
REF  = os.path.join(CERT,'ELA_CERTIFICATE_REFERENCE.png')
FDIR = os.path.join(BASE,'functions','fonts')
BUL  = u'\u2022'

DEMO = dict(
    title='CERTIFICATE OF COMPLETION',
    name='Demo Student',
    academy='Francophone Academy',
    programme='French A1 Programme',
    level='Level A1  '+BUL+'  CEFR',
    meta_labels=['ISSUE DATE','VALID UNTIL','CERTIFICATE NO.','OVERALL RESULT'],
    meta_values=['2026-01-15','2029-01-15','DEMO-ELA-TEST','85%'],
    sig_l_role='Programme Director', sig_inst='E-Learn Language Academy (ELA)',
    sig_r_role='ELA Certification Authority',
)

def footprint(text, cx, ytop, size, bold=False, spacing=0):
    m = Image.new('L',(W,H),0); d=ImageDraw.Draw(m)
    f = ImageFont.truetype(os.path.join(FDIR,'PlayfairDisplay-Bold.ttf' if bold else 'PlayfairDisplay-Regular.ttf'), size)
    adv=[d.textlength(c,font=f) for c in text]
    total=sum(adv)+spacing*max(0,len(text)-1)
    x=cx-total/2.0
    for c,a in zip(text,adv):
        d.text((x,ytop),c,font=f,fill=255,anchor='la'); x+=a+spacing
    return np.asarray(m)>0

def dilate(m,k):
    return cv2.dilate(m.astype(np.uint8), np.ones((3,3),np.uint8), iterations=k)>0

def calib(text,cx,ytop,size,bold,spacing,colmask,span=20):
    fp0=footprint(text,cx,ytop,size,bold,spacing)
    area=int(fp0.sum()) or 1
    best=(-1,0)
    for dy in range(-span,span+1):
        fp=np.roll(fp0,dy,axis=0)
        cov=int((fp&colmask).sum())
        score=cov/(area**0.5)
        if score>best[0]: best=(score,dy)
    return best[1], best[0]

ref = np.asarray(Image.open(REF).convert('RGB')).astype(np.int16)
H,W,_ = ref.shape
L = 0.299*ref[...,0]+0.587*ref[...,1]+0.114*ref[...,2]
Rr,Gg,Bb = ref[...,0],ref[...,1],ref[...,2]
warm = (Rr>105)&(Rr-Bb>40)&(Rr-Gg>6)&(L<236)
dark = (L<80)
gray = (np.abs(Rr-Bb)<30)&(np.abs(Gg-Bb)<28)&(L>55)&(L<180)&((Gg-Rr)<=10)

mask=np.zeros((H,W),bool)
def add(text,cx,ytop,size,bold,spacing,colmask,grow,label):
    global mask
    dy,sc=calib(text,cx,ytop,size,bold,spacing,colmask)
    fp=dilate(np.roll(footprint(text,cx,ytop,size,bold,spacing),dy,axis=0),grow)
    mask |= fp
    ys=np.where(fp.any(axis=1))[0]; xs=np.where(fp.any(axis=0))[0]
    box=(int(xs.min()),int(xs.max()),int(ys.min()),int(ys.max())) if len(xs) else None
    print('%-18s dy=%+3d cover=%.2f box=%s' % (label,dy,sc,box))

CX=724
add(DEMO['title'],CX,244,40,True,3,warm,4,'title')
add(DEMO['name'],CX,305,27,True,0,warm,4,'name')
add(DEMO['academy'],CX,344,26,True,0,warm,4,'academy')
add(DEMO['programme'],CX,363,26,True,0,warm,4,'programme')
add(DEMO['level'],CX,373,17,True,0,dark,4,'level')
colT=4*150+3*14; start=(W-colT)/2.0
for i in range(4):
    cx=start+i*164+75
    add(DEMO['meta_labels'][i],cx,454,13,True,0.5,dark,4,'metaL%d'%i)
    add(DEMO['meta_values'][i],cx,498,24,False,0,dark,4,'metaV%d'%i)
for cx,role in [(169,DEMO['sig_l_role']),(1290,DEMO['sig_r_role'])]:
    add(role,cx,578,10,True,0,dark,4,'sigRole%d'%cx)
    add(DEMO['sig_inst'],cx,596,7,False,0,gray,3,'sigInst%d'%cx)
    m=Image.new('L',(W,H),0); ImageDraw.Draw(m).line([(cx-95,555),(cx+95,555)],fill=255,width=6)
    mask|=dilate(np.asarray(m)>0,3)
    print('%-18s          box=SIGLINE x%d' % ('sigline',cx))
for (ytop,hh,txt) in [(982,14,'footerurl'),(998,12,'hash')]:
    m=Image.new('L',(W,H),0); ImageDraw.Draw(m).rectangle([120,ytop,1180,ytop+hh],fill=255)
    mask|=np.asarray(m)>0; print('%-18s          box=FOOTER y%d' % (txt,ytop))
m=Image.new('L',(W,H),0); ImageDraw.Draw(m).rectangle([1205,852,1400,1015],fill=255)
mask|=np.asarray(m)>0; print('%-18s          box=QR' % 'qr')

print('TOTAL mask px', int(mask.sum()), 'frac', round(float(mask.mean()),4))
Image.fromarray((mask*255).astype(np.uint8)).save(os.path.join(CERT,'_qa','erase_mask.png'))
np.save(os.path.join(CERT,'_qa','erase_mask.npy'), mask)
