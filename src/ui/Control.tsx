import React from 'react';
import { Pressable, PressableProps, Platform } from 'react-native';
export const typeSize = (value: number): number => Platform.OS === 'web' ? `${value / 16}rem` as unknown as number : value;
export function Control({ style, disabled, ...props }: PressableProps) {
  return <Pressable {...props} disabled={disabled} accessibilityState={{ ...props.accessibilityState, disabled: !!disabled }} style={state => [typeof style === 'function' ? style(state) : style, state.pressed && { opacity: .72 }, disabled && { opacity: .5 }]} />;
}
