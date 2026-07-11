import Stack from 'expo-router/stack';
import { useAppColors } from '@/hooks/use-app-colors';

export default function OnboardingLayout() {
  const Colors = useAppColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="habits" />
      <Stack.Screen name="schedule" />
    </Stack>
  );
}

