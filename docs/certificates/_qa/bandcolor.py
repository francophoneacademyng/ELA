import sys, json, numpy as np
from PIL import Image
def load(p): return np.asarray(Image.open(p).convert('RGB')).astype(np.int16)
def lum(a): return 0.299*a[...,0]+0.587*a[...,1]+0.114*a[...,2]
a=load(sys.argv[1]); L=lum(a); H,W,_=a.shape
bands=json.loads(sys.argv[2])  # [[y0,y1],...]
R,G,B=a[...,0],a[...,1],a[...,2]
def cls(rgb):
    r,g,b=rgb
    if r>200 and g>180 and b>150 and (r-b)<45: return 'paper/pale'
    if r>200 and g>170 and 150<b<210: return 'goldLight'   # E8D9A8-ish
    if r>180 and 120<g<190 and b<120 and (r-b)>70: return 'gold'  # D79D39
    if r>120 and g<140 and b<90 and (r-b)>50: return 'goldName/bronze'
    if g>=r and g>b and (r+g+b)/3<120: return 'infoGreen/forest'
    if abs(r-g)<25 and abs(g-b)<25 and 90< (r+g+b)/3 <170: return 'gray'
    return 'other'
for y0,y1 in bands:
    band=a[y0:y1+1]; bL=L[y0:y1+1]
    ink=bL<175
    xs=np.where(ink.any(axis=0))[0]
    xr=(int(xs.min()),int(xs.max())) if len(xs) else None
    px=band[ink]
    mean=px.mean(axis=0).round(0) if len(px) else None
    # dominant class via histogram
    if len(px):
        classes=[cls(px[i]) for i in range(0,len(px),max(1,len(px)//400))]
        from collections import Counter
        cc=Counter(classes).most_common(3)
    else: cc=[]
    print('y%4d-%4d n=%5d x=%s meanRGB=%s top=%s'%(y0,y1,int(ink.sum()),xr,mean.tolist() if mean is not None else None,cc))
