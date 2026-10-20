import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd
src=Image.open('assets/concept/ship-pale-blue.jpg').convert('RGB');a=np.asarray(src).astype(float)
lum=a.mean(2)
m=lum>55
m=nd.binary_closing(m,iterations=6);m=nd.binary_fill_holes(m)
lab,n=nd.label(m);sizes=nd.sum(m,lab,range(1,n+1));
earth_l=None
order=np.argsort(sizes)[::-1]
ship=lab==(order[0]+1);earth=lab==(order[1]+1)
ship=nd.binary_opening(ship,iterations=2)
def cutout(mask):
    ys,xs=np.where(mask);box=(xs.min(),ys.min(),xs.max()+1,ys.max()+1)
    al=Image.fromarray((mask*255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.5))
    im=src.copy();im.putalpha(al);return im.crop(box)
shipI=cutout(ship)
ys,xs=np.where(earth);cx0=(xs.min()+xs.max())/2;r0=(xs.max()-xs.min())/2;cy0=ys.min()+r0
E=src.crop((int(cx0-r0),int(cy0-r0),int(cx0+r0),int(cy0+r0))).convert('RGBA');mk=Image.new('L',(E.size[0]*4,)*2,0);ImageDraw.Draw(mk).ellipse([4,4,mk.size[0]-4,mk.size[0]-4],fill=255);E.putalpha(mk.resize(E.size,Image.LANCZOS));earthI=E
print(shipI.size,earthI.size)
def add_pilot(shipI):
    K=4;W0,H0=shipI.size
    L=Image.new('RGBA',(W0*K,H0*K),(0,0,0,0));d=ImageDraw.Draw(L)
    P=lambda pts:[(x*K,y*K) for x,y in pts]
    E=lambda cx,cy,rx,ry,**kw:d.ellipse([(cx-rx)*K,(cy-ry)*K,(cx+rx)*K,(cy+ry)*K],**kw)
    OLc=(18,14,40,255);SK=(196,146,104,255);SKd=(160,110,74,255);HR=(40,26,18,255);ARM=(140,184,232,255);ARMd=(70,118,184,255);OR=(238,138,42,255)
    # console
    d.rounded_rectangle(P([(95,285),(200,322)]),radius=8*K,fill=(40,48,70,255),outline=OLc,width=3*K)
    for i,c in enumerate([(95,227,106),(69,214,255),(255,79,123),(255,197,61)]):E(112+i*20,300,5,4,fill=c+(255,))
    # shoulders / armor collar
    d.rounded_rectangle(P([(196,232),(352,330)]),radius=40*K,fill=OLc)
    d.rounded_rectangle(P([(200,236),(348,330)]),radius=36*K,fill=ARM)
    d.rounded_rectangle(P([(200,280),(348,330)]),radius=20*K,fill=ARMd)
    d.line(P([(212,250),(336,250)]),fill=OR,width=5*K)
    d.rounded_rectangle(P([(244,226),(300,250)]),radius=10*K,fill=(150,156,176,255),outline=OLc,width=3*K)  # undersuit collar
    # arms to controls
    for (x0,y0,x1,y1) in [(232,268,168,292),(300,270,196,300)]:
        d.line(P([(x0,y0),(x1,y1)]),fill=OLc,width=30*K);d.line(P([(x0,y0),(x1,y1)]),fill=ARM,width=24*K)
        E(x1,y1,14,12,fill=(154,160,180,255),outline=OLc,width=3*K)
    # neck
    d.rectangle(P([(252,215),(282,240)]),fill=SKd)
    # head (3/4 facing left)
    E(262,180,44,50,fill=OLc);E(262,180,41,47,fill=SK)
    E(248,198,9,5,fill=(212,128,98,255))  # cheek
    # hair spikes
    hair=[(300,205),(306,170),(298,140),(284,120),(286,108),(268,116),(262,98),(250,114),(232,104),(234,124),(214,124),(222,140),(232,146),(262,140),(286,150),(292,190)]
    d.polygon(P(hair),fill=HR,outline=OLc,width=3*K)
    # goggles on forehead
    d.rounded_rectangle(P([(216,138),(302,154)]),radius=7*K,fill=(80,86,110,255),outline=OLc,width=3*K)
    E(232,144,13,11,fill=(127,224,255,255),outline=OLc,width=3*K);E(262,143,11,10,fill=(127,224,255,255),outline=OLc,width=3*K)
    E(228,140,4,3,fill=(255,255,255,230))
    # headset earmuff + band
    d.arc([(250-42)*K,(130-44)*K,(300+12)*K,(214)*K],200,330,fill=(90,96,120,255),width=7*K)
    E(296,184,17,20,fill=OLc);E(296,184,14,17,fill=(150,156,176,255));E(296,184,7,9,fill=OR)
    # face features
    d.line(P([(226,160),(246,157)]),fill=HR,width=5*K)
    E(238,177,9,11,fill=(255,255,255,255),outline=OLc,width=2*K);E(234,178,5.5,7,fill=(40,26,18,255));E(232,175,2,2,fill=(255,255,255,255))
    E(224,177,4,8,fill=(255,255,255,255),outline=OLc,width=2*K);E(223,178,2.5,5,fill=(40,26,18,255))
    d.line(P([(226,188),(219,199),(227,201)]),fill=SKd,width=3*K)
    d.arc([(222)*K,(198)*K,(248)*K,(218)*K],20,150,fill=(122,52,40,255),width=4*K)
    L=L.resize((W0,H0),Image.LANCZOS)
    # clip to glass ellipse
    mk=Image.new('L',(W0,H0),0);ImageDraw.Draw(mk).ellipse([58,98,382,350],fill=255);mk=mk.filter(ImageFilter.GaussianBlur(2))
    from PIL import ImageChops
    L.putalpha(ImageChops.multiply(L.split()[3],mk))
    # glass tint
    tint=Image.new('RGBA',(W0,H0),(120,190,240,0));tint.putalpha(ImageChops.multiply(L.split()[3],Image.new('L',(W0,H0),40)))
    out=shipI.copy();out.alpha_composite(L);out.alpha_composite(tint)
    # reapply glass highlights from original
    a=np.asarray(shipI).astype(float);lum=a[...,:3].mean(2)
    hl=np.clip((lum-185)/50,0,1)*(np.asarray(mk)/255.)
    hlI=Image.fromarray((hl*235).astype('uint8')).filter(ImageFilter.GaussianBlur(1))
    wh=Image.new('RGBA',(W0,H0),(240,250,255,0));wh.putalpha(hlI);out.alpha_composite(wh)
    return out
shipI=add_pilot(shipI)

rng=np.random.default_rng(7)
def scene(S,icon):
    # dark space bg with nebula
    y,x=np.mgrid[0:S,0:S]/S
    bg=np.zeros((S,S,3));bg[...,0]=8+30*np.exp(-((x-.2)**2+(y-.8)**2)/.08)+40*np.exp(-((x-.85)**2+(y-.25)**2)/.05)
    bg[...,1]=10+14*np.exp(-((x-.2)**2+(y-.8)**2)/.08);bg[...,2]=30+70*np.exp(-((x-.2)**2+(y-.8)**2)/.1)+60*np.exp(-((x-.85)**2+(y-.25)**2)/.05)
    im=Image.fromarray(bg.clip(0,255).astype('uint8'));d=ImageDraw.Draw(im)
    for _ in range(int(S*S/2500)):
        px,py=rng.integers(0,S,2);r=rng.choice([.6,1,1.6,2.4])*S/1024;c=int(rng.integers(150,256))
        d.ellipse([px-r,py-r,px+r,py+r],fill=(c,c,min(255,c+30)))
    return im
def record(S0,R0,ox=0,oy=0):
    K=3;S=S0*K;R=R0*K
    rec=Image.new('RGBA',(S,S),(0,0,0,0));d=ImageDraw.Draw(rec);c=S/2;cx=c+ox*K;cy=c+oy*K
    glow=Image.new('RGBA',(S,S),(0,0,0,0));gd=ImageDraw.Draw(glow);gd.ellipse([cx-R*1.15,cy-R*1.15,cx+R*1.15,cy+R*1.15],fill=(255,190,60,170));glow=glow.filter(ImageFilter.GaussianBlur(R*.18));ga=glow.split()[3];glow=Image.new('RGBA',(S,S),(255,190,60,0));glow.putalpha(ga)
    rec=Image.alpha_composite(rec,glow);d=ImageDraw.Draw(rec)
    d.ellipse([cx-R,cy-R,cx+R,cy+R],fill=(150,95,20,255))
    for i in range(60):
        rr=R*(.98-i*.0105);t=i%5
        col=(int(225+30*np.sin(i*.9)),int(170+40*np.sin(i*.9)),int(50+30*np.sin(i*1.3)),255)
        d.ellipse([cx-rr,cy-rr,cx+rr,cy+rr],outline=col,width=max(1,int(R*.009)))
    # sheen
    sh=Image.new('L',(S,S),0);sd=ImageDraw.Draw(sh);sd.pieslice([cx-R,cy-R,cx+R,cy+R],200,250,fill=120);sd.pieslice([cx-R,cy-R,cx+R,cy+R],20,70,fill=70);sh=sh.filter(ImageFilter.GaussianBlur(R*.05))
    white=Image.new('RGBA',(S,S),(255,250,220,0));white.putalpha(sh);rec=Image.alpha_composite(rec,white);d=ImageDraw.Draw(rec)
    lr=R*.3;d.ellipse([cx-lr,cy-lr,cx+lr,cy+lr],fill=(255,205,80,255),outline=(120,70,10,255),width=int(R*.012))
    d.ellipse([cx-lr*.25,cy-lr*.25,cx+lr*.25,cy+lr*.25],fill=(30,18,6,255))
    # minimal mark: small 'GR' star dots
    return rec.resize((S0,S0),Image.LANCZOS)
def compose(S,icon):
    im=scene(S,icon).convert('RGBA')
    e=earthI.resize((int(S*(.2 if icon else .14)),)*2,Image.LANCZOS);im.alpha_composite(e,(int(S*(.05 if icon else .76)),int(S*(.06 if icon else .12))))
    R=int(S*(.40 if icon else .22));
    off=(int(S*.07),int(-S*.06)) if icon else (0,int(-S*.04))
    im.alpha_composite(record(S,R,*off))
    sw=int(S*(.80 if icon else .5));sh=shipI.resize((sw,int(sw*shipI.size[1]/shipI.size[0])),Image.LANCZOS)
    # drop shadow glow
    sx=int(S*(.03 if icon else .25));sy=int(S*(.40 if icon else .3))
    shadow=Image.new('RGBA',im.size,(0,0,0,0));al=sh.split()[3].filter(ImageFilter.GaussianBlur(S*.012));blk=Image.new('RGBA',sh.size,(0,0,30,0));blk.putalpha(al.point(lambda v:int(v*.7)));shadow.alpha_composite(blk,(sx+int(S*.015),sy+int(S*.025)))
    im=Image.alpha_composite(im,shadow);im.alpha_composite(sh,(sx,sy))
    # vignette
    y,x=np.mgrid[0:S,0:S]/S;v=1-.5*np.clip(((x-.5)**2+(y-.5)**2)*2.2-.15,0,1)
    arr=np.asarray(im.convert('RGB')).astype(float)*v[...,None]
    return Image.fromarray(arr.clip(0,255).astype('uint8'))
ic=compose(1024,True);ic.save('assets/icon/AppIcon-1024.png')
sp=compose(2732,False);sp.save('assets/icon/splash-2732.png')
