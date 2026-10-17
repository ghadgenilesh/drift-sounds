import React from 'react';
import { Image, Platform } from 'react-native';
const paths: Record<string, string> = {
  subway:'M6 3h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM4 11h16M9 3v8M15 3v8M7 15h1M16 15h1M8 19l-2 3M16 19l2 3',
  'windy-day':'M3 8h12c5 0 5-6 1-6M3 12h16c4 0 4 6 0 6M3 16h8c4 0 4 6 0 6',
  traffic:'M4 15V9l3-5h10l3 5v6M4 10h16M4 15h16M6 15v4M18 15v4M7 12h1M16 12h1',
  'busy-kitchen':'M3 12h18l-2 8H5l-2-8ZM7 9c-3-3 3-3 0-6M12 9c-3-3 3-3 0-6M17 9c-3-3 3-3 0-6',
  'wind-chime':'M4 4h16M7 4v13M12 4v16M17 4v11M5 9h4v8H5ZM10 11h4v9h-4ZM15 7h4v8h-4Z',
  cafe:'M4 9h12v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9ZM16 10h2a3 3 0 0 1 0 6h-2M7 6c-2-2 2-2 0-4M12 6c-2-2 2-2 0-4',
  'rain-on-roof':'M2 12 12 5l10 7M5 10v11h14V10M7 2v2M12 1v2M17 2v2M9 15v3M15 15v3',
  stream:'M3 5c6-5 12 5 18 0M3 12c6-5 12 5 18 0M3 19c6-5 12 5 18 0',
  'rainy-cabin':'M3 11 12 3l9 8M5 9v12h14V9M10 21v-7h4v7M17 3v3',
  'ocean-night':'M3 13c3-4 6 4 9 0s6 4 9 0M3 19c3-4 6 4 9 0s6 4 9 0M17 2a5 5 0 0 0 5 7 6 6 0 0 1-9-6 5 5 0 0 0 4-1Z',
  'deep-space':'M12 2 15 9l7 3-7 3-3 7-3-7-7-3 7-3 3-7ZM3 3h0M21 21h0',
  monsoon:'M5 12a4 4 0 0 1 0-8 6 6 0 0 1 11 0 4 4 0 0 1 3 8H5ZM6 16l-1 4M12 16l-1 5M18 16l-1 4',
  'forest-night':'M8 3 3 12h3l-4 6h12l-4-6h3L8 3ZM8 18v4M17 5l-3 6h2l-2 5h8l-3-5h2l-4-6ZM18 16v6',
  'brown-noise':'M3 12h2l2-6 3 12 4-15 3 18 2-9h2',
  fireplace:'M12 2c2 5 7 7 7 13a7 7 0 0 1-14 0c0-3 2-6 4-8 0 4 1 5 3 6 3-3 1-7 0-11ZM8 22h8',
  'city-night':'M3 21V9h6v12M9 21V3h6v18M15 21V7h6v14M5 12h1M5 16h1M11 7h1M11 11h1M11 15h1M17 11h1M17 15h1M1 21h22',
  moon:'M20 15a9 9 0 0 1-11-11 9 9 0 1 0 11 11Z',
  check:'M5 12l4 4L19 6', stop:'M6 6h12v12H6Z', clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v5l3 2',
};
const nativeIcons: Record<string, number> = {
  stop: require('../../assets/ui/stop.png'),
  clock: require('../../assets/ui/clock.png'),
  'subway': require('../../assets/ui/subway.png'),
  'windy-day': require('../../assets/ui/windy-day.png'),
  'traffic': require('../../assets/ui/traffic.png'),
  'busy-kitchen': require('../../assets/ui/busy-kitchen.png'),
  'wind-chime': require('../../assets/ui/wind-chime.png'),
  'cafe': require('../../assets/ui/cafe.png'),
  'rain-on-roof': require('../../assets/ui/rain-on-roof.png'),
  'stream': require('../../assets/ui/stream.png'),
  'rainy-cabin': require('../../assets/ui/rainy-cabin.png'),
  'ocean-night': require('../../assets/ui/ocean-night.png'),
  'deep-space': require('../../assets/ui/deep-space.png'),
  'monsoon': require('../../assets/ui/monsoon.png'),
  'forest-night': require('../../assets/ui/forest-night.png'),
  'brown-noise': require('../../assets/ui/brown-noise.png'),
  'fireplace': require('../../assets/ui/fireplace.png'),
  'city-night': require('../../assets/ui/city-night.png'),
  'moon': require('../../assets/ui/moon.png'),
  'check': require('../../assets/ui/check.png'),
};
export function Icon({name, color='#EAE7E1', size=28}: {name:string;color?:string;size?:number}) {
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name] || paths.moon}"/></svg>`;
  return <Image accessible={false} accessibilityElementsHidden source={Platform.OS === 'web' ? {uri:`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} : nativeIcons[name] || nativeIcons.moon} style={{width:size,height:size, ...(Platform.OS === 'web' ? {} : {tintColor:color})}}/>;
}
