import Stack from 'expo-router/stack';
import { useAppColors } from '@/hooks/use-app-colors';

export default function ProgressLayout() {
  const Colors = useAppColors();
  return (
			<Stack
				screenOptions={{
					headerShown: false,
					headerStyle: { backgroundColor: Colors.background },
					headerShadowVisible: false,
					headerTintColor: Colors.accent,
					contentStyle: { backgroundColor: Colors.background },
				}}
			>
				<Stack.Screen name="index" />
			</Stack>
		);
}

