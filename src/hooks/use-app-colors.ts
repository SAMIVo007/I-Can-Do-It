/**
 * useAppColors — subscribes the calling component to system theme changes.
 *
 * By calling useColorScheme() internally, any component that uses this hook
 * will automatically re-render whenever the user switches between Light / Dark
 * mode, causing PlatformColor values (Colors.*) to resolve to the correct shade.
 *
 * Usage:
 *   const Colors = useAppColors();
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export function useAppColors() {
  // Subscribing to colorScheme forces a re-render on theme change,
  // which makes PlatformColor values update across the whole component.
  useColorScheme();
  return Colors;
}
