import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, View } from 'react-native';

/** A gentle playback indicator; motion is decorative, not a frequency measurement. */
export function PlaybackBars({ playing, color }: { playing: boolean; color: string }) {
  const bars = useRef(Array.from({ length: 5 }, () => new Animated.Value(.22))).current;
  useEffect(() => {
    let disposed = false;
    let animations: Animated.CompositeAnimation[] = [];
    const update = (reduced: boolean) => {
      if (disposed) return;
      animations.forEach(animation => animation.stop());
      animations = [];
      bars.forEach((bar, index) => bar.setValue(playing && reduced ? [.45, .8, .55, 1, .45][index] : .22));
      if (!playing || reduced) return;
      animations = bars.map((bar, index) => {
        const levels = [.38, .92, .46, .72, .25];
        const animation = Animated.loop(Animated.sequence(levels.map((_, step) => Animated.timing(bar, {
          toValue: levels[(step + index) % levels.length],
          duration: 260 + ((index * 73 + step * 47) % 210),
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }))));
        animation.start();
        return animation;
      });
    };
    void AccessibilityInfo.isReduceMotionEnabled().then(update);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', update);
    return () => { disposed = true; animations.forEach(animation => animation.stop()); subscription.remove(); };
  }, [playing, bars]);
  return <View testID="playback-bars" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.container}>
    {bars.map((value, index) => <Animated.View key={index} testID={`playback-bar-${index}`} style={[styles.bar, { backgroundColor: color, opacity: playing ? .95 : .4, transform: [{ scaleY: value }] }]}/>)}
  </View>;
}
const styles = StyleSheet.create({
  container: { height: 38, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 2 },
  bar: { width: 4, height: 32, borderRadius: 2 },
});
