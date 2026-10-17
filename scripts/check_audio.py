"""Validate bundled WAV structure, headroom, and loop-boundary continuity."""
from pathlib import Path
import wave
import numpy as np
root=Path(__file__).resolve().parents[1]/'assets/audio'
for name in ['rainy-cabin','ocean-night','deep-space','monsoon','forest-night','brown-noise','fireplace','city-night','rain-on-roof','stream','busy-kitchen','wind-chime','cafe','subway','windy-day','traffic']:
    with wave.open(str(root/(name+'.wav')),'rb') as f:
        assert f.getframerate()==44100, name
        assert f.getnchannels()==2, name
        assert f.getsampwidth()==2, name
        assert f.getnframes()/f.getframerate()>=45, name
        x=np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').reshape(-1,2).astype(float)/32768
    assert np.isfinite(x).all()
    assert .005<np.sqrt(np.mean(x*x))<.15, name
    assert np.max(np.abs(x))<.8, name
    # Boundary step should not exceed the typical largest adjacent-sample step.
    assert np.max(np.abs(x[0]-x[-1])) < max(.01,np.quantile(np.abs(np.diff(x,axis=0)),.999)), name
    print(name, 'PASS', round(len(x)/44100,2),'seconds')
