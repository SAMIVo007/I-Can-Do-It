/**
 * NativeProgress — Cross-platform progress indicators.
 *
 * Android: Uses @expo/ui Jetpack Compose LinearProgressIndicator / CircularProgressIndicator
 * iOS/other: Falls back to custom SVG / View-based implementations.
 */

import React from 'react';
import { Platform, View, type ViewStyle, type ColorValue } from 'react-native';
import { useAppColors } from '@/hooks/use-app-colors';
import { Radii } from '@/constants/theme';
import { DataText } from '@/components/ui/typography';

// ─── Types ─────────────────────────────────────────────────────

interface LinearProgressProps {
  /** Progress value 0–1 */
  progress: number;
  /** Height of the bar in dp */
  height?: number;
  /** Indicator color */
  color?: ColorValue;
  /** Track (background) color */
  trackColor?: ColorValue;
  /** Optional custom container style */
  style?: ViewStyle;
}

interface CircularProgressProps {
  /** Progress value 0–1 */
  progress: number;
  /** Diameter in dp */
  size?: number;
  /** Stroke width in dp */
  strokeWidth?: number;
  /** Indicator color */
  color?: ColorValue;
  /** Track (background) color */
  trackColor?: ColorValue;
  /** Whether to show completion rate label */
  showLabel?: boolean;
  /** Size of the label text */
  labelSize?: 'sm' | 'md' | 'lg' | 'xl';
  /** Content rendered in the center */
  children?: React.ReactNode;
}

// ─── Native Android imports (lazy) ─────────────────────────────

let JetpackLinear: React.ComponentType<any> | null = null;
let JetpackCircular: React.ComponentType<any> | null = null;
let JetpackHost: React.ComponentType<any> | null = null;

if (Platform.OS === 'android') {
  try {
    const jetpack = require('@expo/ui/jetpack-compose');
    JetpackLinear = jetpack.LinearProgressIndicator;
    JetpackCircular = jetpack.CircularProgressIndicator;
    JetpackHost = jetpack.Host;
  } catch {
    // @expo/ui not available — fall through to SVG
  }
}

// ─── Linear Progress ───────────────────────────────────────────

export function NativeLinearProgress({
  progress,
  height = 6,
  color,
  trackColor,
  style,
}: LinearProgressProps) {
  const Colors = useAppColors();
  const indicatorColor = color ?? Colors.accent;
  const bgColor = trackColor ?? Colors.border;

  // Android native
  if (Platform.OS === 'android' && JetpackLinear && JetpackHost) {
    const Host = JetpackHost;
    const Linear = JetpackLinear;
    return (
      <Host matchContents={false} style={[{ height }, style]}>
        <Linear
          progress={progress}
          color={indicatorColor}
          trackColor={bgColor}
          strokeCap="round"
        />
      </Host>
    );
  }

  // iOS / fallback — View-based bar
  const clampedProgress = Math.max(0, Math.min(progress, 1));
  return (
    <View
      style={[
        {
          height,
          backgroundColor: bgColor,
          borderRadius: height / 2,
          overflow: 'hidden',
          width: '100%',
        },
        style,
      ]}
    >
      <View
        style={{
          height: '100%',
          width: `${clampedProgress * 100}%`,
          backgroundColor: indicatorColor,
          borderRadius: height / 2,
        } satisfies ViewStyle}
      />
    </View>
  );
}

// ─── Circular Progress ─────────────────────────────────────────

export function NativeCircularProgress({
  progress,
  size = 80,
  strokeWidth = 6,
  color,
  trackColor,
  showLabel = true,
  labelSize = 'md',
  children,
}: CircularProgressProps) {
  const Colors = useAppColors();
  const indicatorColor = color ?? Colors.accent;
  const bgColor = trackColor ?? Colors.border;
  const percentage = Math.floor(progress * 100);

  const labelContent = children ? (
    children
  ) : showLabel ? (
    <DataText size={labelSize} style={{ textTransform: 'none' }}>
      {percentage}%
    </DataText>
  ) : null;

  // Android native
  if (Platform.OS === 'android' && JetpackCircular && JetpackHost) {
    const Host = JetpackHost;
    const Circular = JetpackCircular;
    // Get size modifier from jetpack-compose
    const { size: composeSize } = require('@expo/ui/jetpack-compose/modifiers');
    const sizeMod = composeSize ? composeSize(size, size) : null;
    const modifiers = sizeMod ? [sizeMod] : [];

    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Host matchContents={false} style={{ position: 'absolute', width: size, height: size }}>
          <Circular
            progress={progress}
            color={indicatorColor}
            trackColor={bgColor}
            strokeWidth={strokeWidth}
            strokeCap="round"
            modifiers={modifiers}
          />
        </Host>
        {labelContent}
      </View>
    );
  }

  // iOS / fallback — use the existing ProgressRing SVG approach inline
  const Svg = require('react-native-svg').default;
  const { Circle: SvgCircle } = require('react-native-svg');
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const clampedProgress = Math.max(0, Math.min(progress, 1));
  const offset = circumference * (1 - clampedProgress);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <SvgCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <SvgCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={indicatorColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {labelContent}
    </View>
  );
}
