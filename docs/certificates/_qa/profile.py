import sys, numpy as np
from PIL import Image

def load(p):
    return np.asarray(Image.open(p).convert('RGB')).astype(np.int16)
def lum(a):
    return 0.299*a[...,0]+0.587*a[...,1]+0.114*a[...,2]
def bands(rows):
    out=[]; y=None
    for i,v in enumerate(rows):
        if v and y is None: y=i
        if not v and y is not None: out.append((y,i-1)); y=None
    if y is not None: out.append((y,len(rows)-1))
    return out

p = sys.argv[1]
a = load(p); H,W,_=a.shape; L=lum(a)
# paper bbox = largest light rectangle via column/row light counts
paper = L>195
colp = paper.sum(axis=0); rowp = paper.sum(axis=1)
xc = np.where(colp > 0.4*H)[0]; yr = np.where(rowp > 0.4*W)[0]
x0,x1 = int(xc.min()),int(xc.max()); y0,y1=int(yr.min()),int(yr.max())
print('FILE',p,'size',W,H,'paper box x',x0,x1,'y',y0,y1,'median paper RGB',
      [int(np.median(a[...,i][(L>210)])) for i in range(3)])
# interior crop (inset a few px from paper bbox to drop inner frame line)
ins=6; X0,X1,Y0,Y1=x0+ins,x1-ins,y0+ins,y1-ins
sub=a[Y0:Y1,X0:X1]; sL=L[Y0:Y1,X0:X1]
# ink = clearly not paper
ink = sL<168
strong= sL<140
Wp=X1-X0; Hp=Y1-Y0
print('interior', Wp,'x',Hp, 'ink frac',round(float(ink.mean()),3),'strong frac',round(float(strong.mean()),4))
print('=== ROW HIST (interior y = abs; ink count / 6px bucket) ===')
rowi=ink.sum(axis=1)
for by in range(0,Hp,6):
    seg=int(rowi[by:by+6].max())
    bar='#'*min(80,seg*40//Wp) if Wp else ''
    print('y %4d-%4d ink=%4d %s'%(Y0+by,Y0+by+5,seg,bar))

