import React from 'react';
import { Pressable, View, useColorScheme, Platform } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Spacing } from '@/constants/theme';
import { Heading, Body } from '@/components/ui/typography';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppColors } from '@/hooks/use-app-colors';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const Colors = useAppColors();
  const colorScheme = useColorScheme();

  const isIOS = Platform.OS === 'ios';

  // iOS uses standard iOS system blue. Android uses the dynamic Material Theme colors.
  const accentColor = isIOS
    ? (colorScheme === 'dark' ? '#0A84FF' : '#007AFF')
    : Colors.accent;

  const outerBg = isIOS
    ? (colorScheme === 'dark' ? 'rgba(10, 132, 255, 0.08)' : 'rgba(0, 122, 255, 0.06)')
    : Colors.surface;

  const outerBorder = isIOS
    ? (colorScheme === 'dark' ? 'rgba(10, 132, 255, 0.15)' : 'rgba(0, 122, 255, 0.1)')
    : Colors.border;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, padding: Spacing.xl }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.xxl }}>
        {/* Logo/Icon with double-ring premium effect */}
        <Animated.View entering={FadeInDown.duration(900).springify().damping(100)}>
          <View style={{
            padding: 12,
            borderRadius: 48,
            backgroundColor: outerBg,
            borderWidth: 1,
            borderColor: outerBorder,
          }}>
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 36,
                backgroundColor: accentColor as any, // iOS blue or Android dynamic accent
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: accentColor as any,
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.2,
                shadowRadius: 20,
                elevation: 8,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.15)',
              }}
            >
              <SymbolView
                name={{ ios: "leaf.fill", android: "eco", web: "eco" }}
                size={46}
                tintColor="#FFFFFF"
                fallback={<Body style={{ color: '#FFFFFF', fontSize: 38 }}>🌿</Body>}
              />
            </View>
          </View>
        </Animated.View>

        {/* Title & Subtitle */}
        <View style={{ alignItems: 'center', gap: Spacing.sm }}>
          <Animated.View entering={FadeInDown.duration(900).delay(150).springify().damping(100)}>
            <Body 
              size="xs" 
              weight="bold" 
              style={{ 
                color: Colors.textSecondary, 
                letterSpacing: 4, 
                textTransform: 'uppercase',
                marginBottom: Spacing.xs 
              }}
            >
              Welcome To
            </Body>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(900).delay(250).springify().damping(100)}>
            <Heading size="display" italic style={{ textAlign: 'center', color: Colors.textHeading }}>
              I Can Do It
            </Heading>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.duration(900).delay(350).springify().damping(100)}>
            <Body secondary size="lg" style={{ textAlign: 'center', maxWidth: 290, marginTop: Spacing.xs, lineHeight: 24 }}>
              A mindful approach to tracking your habits and reaching your goals.
            </Body>
          </Animated.View>
        </View>
      </View>

      {/* Footer / Premium Capsule Button */}
      <Animated.View entering={FadeIn.duration(800).delay(600)}>
        <View style={{ paddingBottom: Math.max(insets.bottom, Spacing.xl) }}>
          <Pressable
            onPress={() => router.push('./goal' as any)}
            style={({ pressed }) => ({
              width: '100%',
              backgroundColor: accentColor as any,
              paddingVertical: 18,
              borderRadius: 99,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              opacity: pressed ? 0.85 : 1,
              shadowColor: accentColor as any,
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 4,
            })}
          >
            <Body weight="bold" size="lg" style={{ color: '#FFFFFF', letterSpacing: 0.5 }}>
              Begin Journey
            </Body>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}
