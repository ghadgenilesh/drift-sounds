"""Master additional CC0 recordings without changing existing audio."""
from pathlib import Path
from math import gcd
import json,hashlib,sys
import numpy as np
import soundfile as sf
from scipy.signal import butter,sosfiltfilt,resample_poly
root=Path(__file__).resolve().parents[1]/'assets/audio'
reports=json.loads((root/'quality-report.json').read_text())
rate=44100
names = sys.argv[1:] or ['rain-on-roof','stream','busy-kitchen','wind-chime','cafe','subway','windy-day','traffic']
for name in names:
    x,sr=sf.read(root/'sources'/(name+'.mp3'),always_2d=True)
    if sr!=rate:
        g=gcd(sr,rate);x=resample_poly(x,rate//g,sr//g,axis=0)
    if x.shape[1]==1:x=np.repeat(x,2,axis=1)
    x=x[3*rate:min(len(x),98*rate)].copy()
    x-=x.mean(axis=0)
    x=sosfiltfilt(butter(2,28,'highpass',fs=rate,output='sos'),x,axis=0)
    if name in ['busy-kitchen','wind-chime','cafe','subway','windy-day','traffic']:
        # Soften close-up impacts before level matching, preserving the ambient bed.
        x=np.tanh(x * (.063 / max(np.sqrt(np.mean(x*x)),1e-9)) / .35) * .35
    n=5*rate
    theta=np.linspace(0,np.pi/2,n,endpoint=False)[:,None]
    x[:n]=x[-n:]*np.cos(theta)+x[:n]*np.sin(theta)
    x=x[:-n]
    rms=np.sqrt(np.mean(x*x));x*=min(.063/max(rms,1e-9),.70/max(np.abs(x).max(),1e-9))
    path=root/(name+'.wav');sf.write(path,x,rate,subtype='PCM_16')
    y,sr=sf.read(path,always_2d=True)
    entry=dict(name=name,sample_rate=sr,channels=y.shape[1],seconds=len(y)/sr,peak_dbfs=round(20*np.log10(np.abs(y).max()),2),rms_dbfs=round(20*np.log10(np.sqrt(np.mean(y*y))),2),seam_delta=float(np.max(np.abs(y[0]-y[-1]))),sha256=hashlib.sha256(path.read_bytes()).hexdigest())
    reports=[r for r in reports if r['name']!=name]+[entry]
    print(entry,flush=True)
(root/'quality-report.json').write_text(json.dumps(reports,indent=2)+'\n')
