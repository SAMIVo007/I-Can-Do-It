import { Colors } from "@/constants/theme";
import Stack from "expo-router/stack";

export default function GoalsLayout() {
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
			<Stack.Screen name="index" options={{ title: "Goals" }} />
			<Stack.Screen name="[id]" options={{ title: "Goal Details" }} />
		</Stack>
	);
}
