import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Easing, Platform, StyleSheet, View } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { screenGravity } from './gravity';
import { particleRandom as seed, particleFlow } from './particles';

const native = Platform.OS !== 'web';

function Spark({ index, mood, width, height }: { index: number; mood: string; width: number; height: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  const ember = mood === 'fireplace';
  const fly = mood === 'forest-night';
  const city = mood === 'city-night';
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.delay(seed(index + 100) * 4200),
      Animated.timing(progress, { toValue: 1, duration: (ember ? 6500 : 4500) + seed(index) * 6000,
        easing: Easing.inOut(Easing.sin), useNativeDriver: native, isInteraction: false }),
      Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: native, isInteraction: false }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [progress, index, ember]);
  const size = city ? 4 : ember ? 3 : fly ? 4 : 2 + seed(index + 4) * 2;
  const x = city ? (index % 8) * width / 8 + 14 : seed(index + 1) * (width - 20) + 10;
  const y = city ? height - 40 - Math.floor(index / 8) * 28 : ember ? height - 12 : seed(index + 9) * height;
  const color = ember ? '#F3AF65' : fly ? '#D6EB91' : city ? (index % 3 ? '#F4D49C' : '#A8C7ED') : '#DFE6FF';
  return <Animated.View style={{ position: 'absolute', left: x, top: y, width: size, height: city ? 8 : size,
    borderRadius: city ? 1 : size, backgroundColor: color,
    shadowColor: color, shadowOpacity: 0.8, shadowRadius: fly ? 7 : 4, shadowOffset: { width: 0, height: 0 },
    opacity: progress.interpolate({ inputRange: [0, .25, .65, 1], outputRange: [0, city ? .22 : .6, city ? .3 : .45, 0] }),
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, ember ? -height * .65 : fly ? -50 : 0] }) },
      { translateX: progress.interpolate({ inputRange: [0, .5, 1], outputRange: [0, fly || ember ? 18 : 0, fly || ember ? -12 : 0] }) }],
  }} />;
}

function Waves({ width, height }: { width: number; height: number }) {
  const phase = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(phase, { toValue: 1, duration: 8500, easing: Easing.inOut(Easing.sin), useNativeDriver: native, isInteraction: false }),
      Animated.timing(phase, { toValue: 0, duration: 8500, easing: Easing.inOut(Easing.sin), useNativeDriver: native, isInteraction: false }),
    ]));
    loop.start(); return () => loop.stop();
  }, [phase]);
  return <>
    {[0, 1, 2].map(i => <Animated.View key={i} style={{ position: 'absolute', left: -width * .35, top: height * .62 + i * 48,
      width: width * 1.8, height: height * .6, borderRadius: width, borderWidth: 1,
      borderColor: '#95CBD6', backgroundColor: '#367B9320',
      opacity: phase.interpolate({ inputRange: [0, 1], outputRange: [.09, .22] }),
      transform: [{ translateX: phase.interpolate({ inputRange: [0, 1], outputRange: [-25 + i * 12, 25 - i * 12] }) },
        { translateY: phase.interpolate({ inputRange: [0, 1], outputRange: [0, -18 - i * 6] }) }],
    }} />)}
    <Animated.View style={{ position: 'absolute', left: width * .68, top: height * .12, width: 54, height: 54,
      borderRadius: 27, backgroundColor: '#CEE6EB', opacity: phase.interpolate({ inputRange: [0, 1], outputRange: [.015, .065] }),
      shadowColor: '#BCDDEB', shadowOpacity: .5, shadowRadius: 25, shadowOffset: { width: 0, height: 0 } }} />
  </>;
}

function StreamRipple({ index, width, height }: { index: number; width: number; height: number }) {
  const phase = useRef(new Animated.Value(0)).current;
  const glint = index % 3 === 0;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.delay(seed(index + 88) * 2200),
      Animated.timing(phase, { toValue: 1, duration: 7000 + seed(index + 52) * 6000, easing: Easing.linear, useNativeDriver: native, isInteraction: false }),
      Animated.timing(phase, { toValue: 0, duration: 0, useNativeDriver: native, isInteraction: false }),
    ]));
    animation.start(); return () => animation.stop();
  }, [phase, index]);
  return <Animated.View testID={`stream-ripple-${index}`} style={{ position: 'absolute',
    left: seed(index + 21) * width * .75 - width * .15, top: seed(index + 9) * height,
    width: glint ? 10 : 42 + seed(index + 31) * 64, height: glint ? 2 : 14 + seed(index + 33) * 20,
    borderRadius: 80, borderWidth: glint ? 0 : 1, borderColor: '#9BCFC5', backgroundColor: glint ? '#D7F0E7' : 'transparent',
    opacity: phase.interpolate({ inputRange: [0, .2, .7, 1], outputRange: [0, glint ? .4 : .18, glint ? .24 : .12, 0] }),
    transform: [
      { translateX: phase.interpolate({ inputRange: [0, 1], outputRange: [-width * .15, width * .45] }) },
      { translateY: phase.interpolate({ inputRange: [0, 1], outputRange: [-20, 55] }) },
      { scale: phase.interpolate({ inputRange: [0, 1], outputRange: [.65, 1.3] }) },
    ],
  }}/>;
}

function UrbanMotion({ index, width, height, mood }: { index: number; width: number; height: number; mood: string }) {
  const phase = useRef(new Animated.Value(0)).current;
  const wind = mood === 'windy-day';
  const subway = mood === 'subway';
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.delay(seed(index + 180) * 2500),
      Animated.timing(phase, { toValue: 1, duration: (wind ? 10000 : subway ? 3500 : 6500) + seed(index + 60) * 4000, easing: Easing.linear, useNativeDriver: native, isInteraction: false }),
      Animated.timing(phase, { toValue: 0, duration: 0, useNativeDriver: native, isInteraction: false }),
    ]));
    loop.start(); return () => loop.stop();
  }, [phase, index, wind, subway]);
  return <Animated.View testID={`urban-${index}`} style={{ position: 'absolute', left: -100,
    top: height * (.15 + seed(index + 7) * .7),
    opacity: phase.interpolate({ inputRange: [0, .2, .8, 1], outputRange: [0, .22, .16, 0] }),
    transform: [{ translateX: phase.interpolate({ inputRange: [0, 1], outputRange: !wind && index % 2 ? [width + 180, 0] : [0, width + 180] }) },
      { translateY: phase.interpolate({ inputRange: [0, 1], outputRange: [0, wind ? 24 : 0] }) }],
  }}>
    {wind ? <View style={{width: 26, height: 8, borderRadius: 12, borderWidth: 1, borderColor: '#B8D3C3', transform:[{rotate:'-20deg'}]}}/> :
      <View style={{ width: subway ? 70 : 34, height: subway ? 2 : 4, borderRadius: 3, backgroundColor: subway ? '#B4D1E9' : index % 2 ? '#F1C796' : '#E8A4A1' }} />}
  </Animated.View>;
}

function Steam({ index, width, height, kitchen }: { index: number; width: number; height: number; kitchen: boolean }) {
  const phase = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.delay(seed(index + 140) * 2600),
      Animated.timing(phase, { toValue: 1, duration: (kitchen ? 6500 : 9500) + seed(index + 42) * 3500, easing: Easing.linear, useNativeDriver: native, isInteraction: false }),
      Animated.timing(phase, { toValue: 0, duration: 0, useNativeDriver: native, isInteraction: false }),
    ]));
    loop.start(); return () => loop.stop();
  }, [phase, index, kitchen]);
  return <Animated.View testID={`steam-${index}`} style={{ position: 'absolute', left: width * (.12 + seed(index + 5) * .76), top: height * (.6 + seed(index + 8) * .35),
    width: 16 + seed(index + 3) * 22, height: 70 + seed(index + 7) * 60, borderWidth: 1, borderColor: kitchen ? '#E7B793' : '#D9C8AF', borderRadius: 50,
    opacity: phase.interpolate({ inputRange: [0, .25, .65, 1], outputRange: [0, .22, .12, 0] }),
    transform: [{ translateY: phase.interpolate({ inputRange: [0, 1], outputRange: [0, -height * .42] }) },
      { translateX: phase.interpolate({ inputRange: [0, .5, 1], outputRange: [-12, 14, -8] }) },
      { scale: phase.interpolate({ inputRange: [0, 1], outputRange: [.6, 1.35] }) }],
  }} />;
}

function Chimes({ width, height }: { width: number; height: number }) {
  const phase = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(phase, { toValue: 1, duration: 4200, easing: Easing.inOut(Easing.sin), useNativeDriver: native, isInteraction: false }),
      Animated.timing(phase, { toValue: 0, duration: 4200, easing: Easing.inOut(Easing.sin), useNativeDriver: native, isInteraction: false }),
    ]));
    loop.start(); return () => loop.stop();
  }, [phase]);
  return <>{Array.from({ length: 5 }, (_, i) => <Animated.View key={i} testID={`chime-${i}`} style={{ position: 'absolute', left: width * .5 + (i - 2) * 32, top: height * .08,
    opacity: .16, transform: [{ translateX: phase.interpolate({ inputRange: [0, 1], outputRange: [-7 - i, 7 + i] }) },
      { rotate: phase.interpolate({ inputRange: [0, 1], outputRange: [`${-4 - i}deg`, `${4 + i}deg`] }) }],
  }}>
    <View style={{ width: 1, height: 28 + i * 6, backgroundColor: '#D9DCF1', alignSelf: 'center' }} />
    <View style={{ width: 7, height: 58 + seed(i + 11) * 58, borderWidth: 1, borderRadius: 4, borderColor: '#D9DCF1', backgroundColor: '#BCC6E522' }} />
  </Animated.View>)}</>;
}

function GravityParticles({ width, height, heavy = false, ember = false }: { width: number; height: number; heavy?: boolean; ember?: boolean }) {
  const direction = useRef({ x: 0, y: 1 });
  const drops = useRef(Array.from({ length: ember ? 14 : heavy ? 14 : 8 }, (_, i) => ({
    position: new Animated.ValueXY({ x: seed(i + 1) * width, y: seed(i + 9) * height }), angle: new Animated.Value(0), glow: new Animated.Value(.2), age: seed(i + 20) * 10,
    x: seed(i + 1) * width, y: seed(i + 9) * height, speed: ember ? 18 + seed(i + 3) * 24 : 30 + seed(i + 3) * (heavy ? 65 : 40),
  }))).current;
  useEffect(() => {
    let stopped = false;
    let subscription: ReturnType<typeof Accelerometer.addListener> | undefined;
    if (native) {
      void (async () => {
        try {
          const available = await Accelerometer.isAvailableAsync();
          const permission = await Accelerometer.getPermissionsAsync();
          if (!available || !permission.granted || stopped) return;
          Accelerometer.setUpdateInterval(100);
          subscription = Accelerometer.addListener(({ x, y }) => {
            direction.current = screenGravity(x, y, direction.current, Platform.OS === 'android');
          });
        } catch { /* Unsupported sensor: vertical rain remains available. */ }
      })();
    }
    const webMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (acceleration?.x == null || acceleration.y == null) return;
      const angle = (window.screen.orientation?.angle ?? (window as Window & { orientation?: number }).orientation ?? 0) * Math.PI / 180;
      const x = acceleration.x * Math.cos(angle) + acceleration.y * Math.sin(angle);
      const y = -acceleration.x * Math.sin(angle) + acceleration.y * Math.cos(angle);
      direction.current = screenGravity(x / 9.81, y / 9.81, direction.current, /Android/i.test(navigator.userAgent));
    };
    if (!native) window.addEventListener('devicemotion', webMotion);
    let previous = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      if (stopped) return;
      const seconds = Math.min((now - previous) / 1000, .1); previous = now;
      const d = particleFlow(direction.current, ember);
      for (const drop of drops) {
        drop.x += d.x * drop.speed * seconds; drop.y += d.y * drop.speed * seconds;
        if (drop.x > width + 24) drop.x = -24;
        if (drop.x < -24) drop.x = width + 24;
        if (drop.y > height + 24) drop.y = -24;
        if (drop.y < -24) drop.y = height + 24;
        drop.position.setValue({ x: drop.x, y: drop.y });
        drop.angle.setValue(-Math.atan2(d.x, d.y));
        drop.age += seconds;
        if (ember) drop.glow.setValue(.1 + .48 * Math.pow((1 + Math.sin(drop.age * .7)) / 2, 2));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { stopped = true; cancelAnimationFrame(frame); subscription?.remove(); if (!native) window.removeEventListener('devicemotion', webMotion); };
  }, [drops, width, height, ember]);
  return <>{drops.map((drop, i) => <Animated.View key={i} style={{ position: 'absolute', width: 12, height: 34,
    opacity: ember ? drop.glow : .28 + seed(i) * .22,
    transform: [...drop.position.getTranslateTransform(),
      { rotate: drop.angle.interpolate({ inputRange: [-Math.PI, Math.PI], outputRange: ['-180deg', '180deg'] }) },
      { scale: .65 + seed(i + 30) * .55 }],
  }}>
    {ember ? <View style={{ width: 4, height: 7, borderRadius: 3, backgroundColor: '#FFC177',
      shadowColor: '#FF8A35', shadowRadius: 8, shadowOpacity: .9, shadowOffset: { width: 0, height: 0 } }}>
      <View style={{ width: 2, height: 3, borderRadius: 2, backgroundColor: '#FFE8B5', margin: 1 }} />
    </View> : <>
      {/* Thin wet trail, tapered shoulder, and rounded leading bead. */}
      <View style={{ position: 'absolute', left: 5, top: 0, width: 1, height: 17, backgroundColor: '#BADBEF35' }} />
      <View style={{ position: 'absolute', left: 1, top: 12, width: 0, height: 0,
        borderLeftWidth: 5, borderRightWidth: 5, borderBottomWidth: 12,
        borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#BBD7E7' }} />
      <View style={{ position: 'absolute', left: 1, top: 20, width: 10, height: 10, borderRadius: 5, backgroundColor: '#BBD7E7' }} />
      <View style={{ position: 'absolute', left: 3, top: 20, width: 2, height: 5, borderRadius: 2, backgroundColor: '#F4FBFF' }} />
    </>}
  </Animated.View>)}</>;

}

export function MoodAtmosphere({ mood }: { mood?: string }) {
  const [reduce, setReduce] = useState(true);
  const [foreground, setForeground] = useState(AppState.currentState === 'active' || Platform.OS === 'web');
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (alive) setReduce(value); }).catch(() => {});
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    const state = AppState.addEventListener('change', value => setForeground(value === 'active'));
    return () => { alive = false; motion.remove(); state.remove(); };
  }, []);
  const enabled = mood && mood !== 'brown-noise' && !reduce && foreground && size.width > 0;
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} onLayout={event => setSize(event.nativeEvent.layout)}>
    {enabled && <View key={`${mood}-${size.width}-${size.height}`} style={StyleSheet.absoluteFill}>
      {mood === 'rainy-cabin' || mood === 'monsoon' || mood === 'rain-on-roof' ? <GravityParticles {...size} heavy={mood !== 'rainy-cabin'} /> :
        mood === 'stream' ? Array.from({ length: 18 }, (_, i) => <StreamRipple key={i} index={i} {...size}/>) :
        mood === 'wind-chime' ? <Chimes {...size} /> :
        mood === 'subway' || mood === 'windy-day' || mood === 'traffic' ? Array.from({ length: mood === 'windy-day' ? 8 : 12 }, (_, i) => <UrbanMotion key={i} index={i} mood={mood} {...size} />) :
        mood === 'busy-kitchen' || mood === 'cafe' ? Array.from({ length: mood === 'cafe' ? 7 : 10 }, (_, i) => <Steam key={i} index={i} kitchen={mood === 'busy-kitchen'} {...size} />) :
        mood === 'ocean-night' ? <Waves {...size} /> :
        mood === 'fireplace' ? <GravityParticles {...size} ember /> :
          Array.from({ length: mood === 'city-night' ? 32 : mood === 'deep-space' ? 22 : 12 }, (_, i) =>
            <Spark key={i} index={i} mood={mood} {...size} />)}
    </View>}
  </View>;
}
