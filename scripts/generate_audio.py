"""Master CC0 recordings and original synthesis into 90-second stereo loops.
Requires numpy, scipy, soundfile. Source downloads: fetch_recordings.py.
"""
from pathlib import Path
import json, hashlib
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfiltfilt, resample_poly
from math import gcd
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/audio'
RATE=44100
DURATION=90
OVERLAP=5
rng=np.random.default_rng(812)

def filtered(x,hz,kind):
    return sosfiltfilt(butter(2,hz,kind,fs=RATE,output='sos'),x,axis=0)

def seam(x):
    n=OVERLAP*RATE
    theta=np.linspace(0,np.pi/2,n,endpoint=False)[:,None]
    # Equal-power overlap preserves perceived ambience through the join.
    x[:n]=x[-n:]*np.cos(theta)+x[:n]*np.sin(theta)
    return x[:-n]

def master(name,x):
    x=x-x.mean(axis=0)
    x=filtered(x,28,'highpass')
    x=seam(x)
    rms=np.sqrt(np.mean(x*x))
    x*=min(0.063/max(rms,1e-9),0.70/max(np.max(np.abs(x)),1e-9))
    sf.write(OUT/(name+'.wav'),x,RATE,subtype='PCM_16')
    y,sr=sf.read(OUT/(name+'.wav'),always_2d=True)
    report=dict(name=name,sample_rate=sr,channels=y.shape[1],seconds=len(y)/sr,peak_dbfs=round(20*np.log10(np.max(np.abs(y))),2),rms_dbfs=round(20*np.log10(np.sqrt(np.mean(y*y))),2),seam_delta=float(np.max(np.abs(y[0]-y[-1]))),sha256=hashlib.sha256((OUT/(name+'.wav')).read_bytes()).hexdigest())
    print(report,flush=True)
    return report

reports=[]
for name in ['rainy-cabin','ocean-night','monsoon','forest-night','fireplace','city-night']:
    x,sr=sf.read(OUT/'sources'/(name+'.mp3'),always_2d=True)
    if sr!=RATE:
        g=gcd(sr,RATE)
        x=resample_poly(x,RATE//g,sr//g,axis=0)
    if x.shape[1]==1: x=np.repeat(x,2,axis=1)
    # Skip initial handling noise, retain a long section with natural variation.
    start=min(10*RATE,max(0,len(x)-(DURATION+OVERLAP)*RATE))
    x=x[start:start+(DURATION+OVERLAP)*RATE].copy()
    if len(x)<(DURATION+OVERLAP)*RATE:
        # Short source retains its full duration rather than inventing detail.
        if len(x)<=OVERLAP*RATE*2: raise ValueError('Source too short')
    if name=='forest-night': x=filtered(x,6500,'lowpass')
    if name=='city-night': x=filtered(x,6500,'lowpass')
    if name=='fireplace': x=filtered(x,10000,'lowpass')
    if name=='rainy-cabin': x=filtered(x,8000,'lowpass')
    reports.append(master(name,x))

n=(DURATION+OVERLAP)*RATE
t=np.arange(n)/RATE

def brown():
    f=np.fft.rfftfreq(n,1/RATE)
    spectrum=np.fft.rfft(rng.normal(size=n))
    spectrum/=np.maximum(f,30)
    spectrum[f<25]=0
    y=np.fft.irfft(spectrum,n)
    return y/np.std(y)

center=brown()
x=np.column_stack([.92*center+.08*brown(),.92*center+.08*brown()])
reports.append(master('brown-noise',x))
# Wide, gently changing filtered atmosphere with subdued harmonic layers.
x=np.column_stack([brown(),brown()])*.08
for channel in range(2):
    for freq,amp,cycle in [(55,.025,31),(82.5,.016,43),(110,.007,59)]:
        envelope=.7+.3*np.sin(2*np.pi*t/cycle+channel*.7)
        x[:,channel]+=amp*envelope*np.sin(2*np.pi*freq*t+channel*.2)
reports.append(master('deep-space',x))
(OUT/'quality-report.json').write_text(json.dumps(reports,indent=2)+'\n')

# Include the roof and stream recordings in a full regeneration.
import subprocess, sys
subprocess.run([sys.executable, str(Path(__file__).with_name('master_additions.py'))], check=True)
