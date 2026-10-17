export const moods = [
  { id: 'subway', name: 'Subway', detail: 'Rolling rails. Underground rhythm.', symbol: '▤', color: '#B1C2DA', colors: ['#2F4053', '#192430'] as const, source: require('../assets/audio/subway.wav') },
  { id: 'windy-day', name: 'Windy Day', detail: 'Wind through leaves and branches.', symbol: '≈', color: '#B8D3C3', colors: ['#30473F', '#1C2B2B'] as const, source: require('../assets/audio/windy-day.wav') },
  { id: 'traffic', name: 'Traffic', detail: 'Passing cars. City rhythm.', symbol: '↔', color: '#D8B3A3', colors: ['#45383C', '#232331'] as const, source: require('../assets/audio/traffic.wav') },
  { id: 'busy-kitchen', name: 'Busy Kitchen', detail: 'Clinking dishes. Kitchen bustle.', symbol: '♨', color: '#DDAC83', colors: ['#49352B', '#25212A'] as const, source: require('../assets/audio/busy-kitchen.wav') },
  { id: 'wind-chime', name: 'Wind Chime', detail: 'Gentle tones in the breeze.', symbol: '♪', color: '#C5C9E6', colors: ['#343D53', '#1C2433'] as const, source: require('../assets/audio/wind-chime.wav') },
  { id: 'cafe', name: 'Cafe', detail: 'Soft chatter. Cups and coffee.', symbol: '☕', color: '#D2B293', colors: ['#42382F', '#24232B'] as const, source: require('../assets/audio/cafe.wav') },
  { id: 'rain-on-roof', name: 'Rain on Roof', detail: 'Raindrops on a metal roof.', symbol: '⌂', color: '#B4C7DD', colors: ['#304158', '#192536'] as const, source: require('../assets/audio/rain-on-roof.wav') },
  { id: 'stream', name: 'Stream', detail: 'Water flowing over stones.', symbol: '≋', color: '#9BCFC5', colors: ['#20463F', '#152A2C'] as const, source: require('../assets/audio/stream.wav') },
  { id: 'rainy-cabin', name: 'Rainy Cabin', detail: 'Warm shelter. Soft rain.', symbol: '⌂', color: '#CAA786', colors: ['#3C302F', '#191F2B'] as const, source: require('../assets/audio/rainy-cabin.wav') },
  { id: 'ocean-night', name: 'Ocean Night', detail: 'Let the tide take over.', symbol: '≈', color: '#93C9D3', colors: ['#193C4B', '#141E30'] as const, source: require('../assets/audio/ocean-night.wav') },
  { id: 'deep-space', name: 'Deep Space', detail: 'A little further from it all.', symbol: '✧', color: '#B6A5E5', colors: ['#322C51', '#1B1B31'] as const, source: require('../assets/audio/deep-space.wav') },
  { id: 'monsoon', name: 'Monsoon', detail: 'Rain, with nowhere to be.', symbol: '☂', color: '#9CB9D8', colors: ['#293B51', '#171E2B'] as const, source: require('../assets/audio/monsoon.wav') },
  { id: 'forest-night', name: 'Forest Night', detail: 'Breathe with the trees.', symbol: '♧', color: '#A8C7AF', colors: ['#263D35', '#172623'] as const, source: require('../assets/audio/forest-night.wav') },
  { id: 'brown-noise', name: 'Brown Noise', detail: 'Deep, steady, uncomplicated.', symbol: '≋', color: '#D6B99F', colors: ['#41342E', '#272126'] as const, source: require('../assets/audio/brown-noise.wav') },
  { id: 'fireplace', name: 'Fireplace', detail: 'Warm embers. Gentle crackle.', symbol: '♨', color: '#DFAD85', colors: ['#493027', '#241D24'] as const, source: require('../assets/audio/fireplace.wav') },
  { id: 'city-night', name: 'City Night', detail: 'Distant streets, after dark.', symbol: '▥', color: '#B2B9DB', colors: ['#30364D', '#1B2030'] as const, source: require('../assets/audio/city-night.wav') },
];
export type Mood = typeof moods[number];
