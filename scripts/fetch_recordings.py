"""Fetch public HQ previews of verified CC0 recordings; no account needed."""
import urllib.request, json, hashlib
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
SOURCES = [
 ('subway', 'corkob', 392653, 'Ambience INT day metro undergrund train (lisbon portugal).flac', 'https://cdn.freesound.org/previews/392/392653_4043130-hq.mp3'),
 ('windy-day', 'nickydunne', 463551, 'Wind in trees.WAV', 'https://cdn.freesound.org/previews/463/463551_9359506-hq.mp3'),
 ('traffic', 'seventhsamurai', 585731, 'Ext Mumbai City Traffic Ambience.wav', 'https://cdn.freesound.org/previews/585/585731_3288322-hq.mp3'),
 ('busy-kitchen', 'brunoboselli', 512511, 'Kitchen Ambience', 'https://cdn.freesound.org/previews/512/512511_300738-hq.mp3'),
 ('wind-chime', 'Adelantemos', 222893, 'Wind Chimes 02.wav', 'https://cdn.freesound.org/previews/222/222893_2386532-hq.mp3'),
 ('cafe', 'Ultra-Edward', 823831, 'Cafe/Coffee shop', 'https://cdn.freesound.org/previews/823/823831_16786392-hq.mp3'),
 ('rain-on-roof', 'GregorQuendel', 239939, 'Rain falling on a metal roof - 96 kHz / 24 Bit', 'https://cdn.freesound.org/previews/239/239939_8432823-hq.mp3'),
 ('stream', 'RyanKingArt', 726522, 'Rushing Stream River Water', 'https://cdn.freesound.org/previews/726/726522_11069322-hq.mp3'),
 ('rainy-cabin', 'Nox_Sound', 553887, 'Ambiance Atmosphere Interior Wood Rain Thunders Fire Loop Stereo', 'https://cdn.freesound.org/previews/553/553887_9250976-hq.mp3'),
 ('ocean-night', 'esh9419', 417797, 'Gentle Ocean Waves Mix (2018)', 'https://cdn.freesound.org/previews/417/417797_3285887-hq.mp3'),
 ('monsoon', 'pmstrain', 348805, 'Rain and Thunder.mp3', 'https://cdn.freesound.org/previews/348/348805_53958-hq.mp3'),
 ('forest-night', 'Defelozedd94', 522299, 'Crickets At Night - Raw sound', 'https://cdn.freesound.org/previews/522/522299_9084007-hq.mp3'),
 ('fireplace', 'Davor', 382616, 'Fire crackling in fireplace', 'https://cdn.freesound.org/previews/382/382616_7094269-hq.mp3'),
 ('city-night', 'ragamuffin', 197211, 'city-night-quiet.wav', 'https://cdn.freesound.org/previews/197/197211_167260-hq.mp3'),
]
manifest=[]
for name, author, id, title, url in SOURCES:
 path=ROOT / 'assets/audio/sources' / (name+'.mp3')
 path.parent.mkdir(parents=True, exist_ok=True)
 data=path.read_bytes() if path.exists() else urllib.request.urlopen(url, timeout=60).read()
 path.write_bytes(data)
 manifest.append(dict(mood=name,author=author,title=title,page=f'https://freesound.org/people/{author}/sounds/{id}/',download=url,license='https://creativecommons.org/publicdomain/zero/1.0/',sha256=hashlib.sha256(data).hexdigest(),downloaded='2026-10-16' if name == 'windy-day' else '2026-10-08' if name in ['rain-on-roof','stream','busy-kitchen','wind-chime','cafe','subway','jazz','traffic'] else '2026-09-29',format='Public HQ MP3 preview; not the original lossless master'))
 print(name,len(data),'bytes',flush=True)
(ROOT/'assets/audio/sources/manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
