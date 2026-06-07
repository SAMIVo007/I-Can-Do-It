import * as Haptics from 'expo-haptics';
import { storage } from './storage';

/**
 * Triggers haptic feedback if the global `hapticsEnabled` setting is true.
 * Defaults to enabled if not explicitly disabled.
 */
export function triggerHaptic(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  const enabled = storage.get('hapticsEnabled', true);
  if (enabled) {
    Haptics.impactAsync(style);
  }
}
