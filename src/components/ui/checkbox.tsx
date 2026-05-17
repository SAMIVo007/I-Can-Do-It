/**
 * Checkbox — circular, fills flat Sage Green on completion.
 * Animated with Reanimated v4.
 */

import React from 'react';
import { Pressable, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, FadeIn } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/constants/theme';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: number;
}

export function Checkbox({ checked, onToggle, size = 28 }: CheckboxProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(checked ? Colors.success : 'transparent', { duration: 200 }),
    borderColor: withTiming(checked ? Colors.success : Colors.border, { duration: 200 }),
  }));

  return (
    <Pressable onPress={onToggle} hitSlop={8}>
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            alignItems: 'center',
            justifyContent: 'center',
          } satisfies ViewStyle,
          animatedStyle,
        ]}
      >
        {checked && (
          <Animated.View entering={FadeIn.duration(150)}>
            <Svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 13l4 4L19 7"
                stroke={Colors.white}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
}
