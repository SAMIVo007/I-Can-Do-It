import Stack from 'expo-router/stack';
import { Colors } from '@/constants/theme';

export default function TodayLayout() {
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
