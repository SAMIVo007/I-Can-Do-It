import { Body } from "@/components/ui/typography";
import { Spacing } from "@/constants/theme";
import { useAppColors } from "@/hooks/use-app-colors";
import type { DailyLog, Habit } from "@/types/models";
import { getShortMonthName, toDateKey } from "@/utils/date";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, View, type ViewStyle } from "react-native";

interface YearlyHeatmapProps {
	habits: Habit[];
	logs: DailyLog[];
}

type ViewMode = "rolling" | number;

export function YearlyHeatmap({ habits, logs }: YearlyHeatmapProps) {
	const Colors = useAppColors();
	const scrollViewRef = useRef<ScrollView>(null);
	const [selectedView, setSelectedView] = useState<ViewMode>("rolling");

	const activeHabits = useMemo(() => habits.filter((h) => h.isActive), [habits]);

	const availableYears = useMemo(() => {
		const currentYear = new Date().getFullYear();
		const years = new Set(logs.map(l => parseInt(l.date.split("-")[0], 10)));
		years.add(currentYear);
		return Array.from(years).sort((a, b) => b - a);
	}, [logs]);

	const columns = useMemo(() => {
		const todayDate = new Date();
		const todayKey = toDateKey(todayDate);

		let endDate = new Date(todayDate);
		let totalDays = 364;

		if (selectedView === "rolling") {
			const daysUntilSaturday = 6 - todayDate.getDay();
			endDate.setDate(todayDate.getDate() + daysUntilSaturday);
		} else {
			const year = selectedView as number;
			const jan1 = new Date(year, 0, 1);
			const dec31 = new Date(year, 11, 31);

			const startDate = new Date(jan1);
			startDate.setDate(jan1.getDate() - jan1.getDay());

			endDate = new Date(dec31);
			endDate.setDate(dec31.getDate() + (6 - dec31.getDay()));

			const diffTime = endDate.getTime() - startDate.getTime();
			totalDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
		}

		const cells: { date: string; rate: number }[] = [];

		for (let i = totalDays; i >= 0; i--) {
			const d = new Date(endDate);
			d.setDate(endDate.getDate() - i);
			const dk = toDateKey(d);

			let rate = -1;

			if (selectedView !== "rolling" && d.getFullYear() !== selectedView) {
				rate = -1; // Hide days that bleed into adjacent years
			} else if (dk > todayKey) {
				// Future days
				if (selectedView !== "rolling") {
					rate = 0; // Show future days as empty boxes in calendar year view
				} else {
					rate = -1; // Hide future days in rolling view (up to Saturday)
				}
			} else {
				// Past/Present days in the valid year
				if (activeHabits.length > 0) {
					const completed = activeHabits.filter((h) => {
						const log = logs.find((l) => l.habitId === h.id && l.date === dk);
						if (!log) return false;
						if (h.type === "boolean") return log.value === 1;
						return log.value >= (h.target ?? 1);
					}).length;
					rate = completed / activeHabits.length;
				} else {
					rate = 0;
				}
			}

			cells.push({ date: dk, rate });
		}

		const cols = [];
		for (let i = 0; i < cells.length / 7; i++) {
			cols.push(cells.slice(i * 7, (i + 1) * 7));
		}

		return cols;
	}, [activeHabits, logs, selectedView]);

	const monthLabels = useMemo(() => {
		const labels: { text: string; colIndex: number }[] = [];
		let currentMonth = -1;
		columns.forEach((col, idx) => {
			const validDay = col.find(c => c.rate !== -1) || col[0];
			const dateStr = validDay.date;
			if (!dateStr) return;
			const monthIdx = parseInt(dateStr.split("-")[1], 10) - 1;
			if (monthIdx !== currentMonth) {
				labels.push({ text: getShortMonthName(monthIdx), colIndex: idx });
				currentMonth = monthIdx;
			}
		});
		return labels;
	}, [columns]);

	useEffect(() => {
		const timer = setTimeout(() => {
			scrollViewRef.current?.scrollToEnd({ animated: false });
		}, 100);
		return () => clearTimeout(timer);
	}, [columns, selectedView]);

	const getCellColor = (rate: number) => {
		if (rate === -1) return "transparent";
		if (rate === 0) return Colors.border;
		if (rate < 0.5) return `${String(Colors.accent)}66`;
		if (rate < 1) return `${String(Colors.accent)}B3`;
		return Colors.success;
	};

	return (
		<View style={{ gap: Spacing.md }}>
			{/* Year Selector */}
			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm, paddingHorizontal: 2 }}>
				<Pressable
					onPress={() => setSelectedView("rolling")}
					style={{
						paddingHorizontal: Spacing.md,
						paddingVertical: 6,
						borderRadius: 20,
						backgroundColor: selectedView === "rolling" ? Colors.accent : "transparent",
						borderWidth: 1,
						borderColor: selectedView === "rolling" ? Colors.accent : Colors.border,
					}}
				>
					<Body size="xs" weight="medium" style={{ color: selectedView === "rolling" ? Colors.background : Colors.textPrimary }}>
						Last 365 Days
					</Body>
				</Pressable>
				{availableYears.map(year => (
					<Pressable
						key={year}
						onPress={() => setSelectedView(year)}
						style={{
							paddingHorizontal: Spacing.md,
							paddingVertical: 6,
							borderRadius: 20,
							backgroundColor: selectedView === year ? Colors.accent : "transparent",
							borderWidth: 1,
							borderColor: selectedView === year ? Colors.accent : Colors.border,
						}}
					>
						<Body size="xs" weight="medium" style={{ color: selectedView === year ? Colors.background : Colors.textPrimary }}>
							{year}
						</Body>
					</Pressable>
				))}
			</ScrollView>

			<View style={{ flexDirection: "row", alignItems: "flex-end", paddingVertical: Spacing.xs }}>
				{/* Left Axis (Days) */}
				<View style={{ paddingRight: Spacing.xs, gap: 4 }}>
					{["", "Mon", "", "Wed", "", "Fri", ""].map((day, idx) => (
						<View key={idx} style={{ height: 12, justifyContent: "center" }}>
							<Body secondary style={{ fontSize: 10, lineHeight: 12 }}>
								{day}
							</Body>
						</View>
					))}
				</View>

				{/* Grid & Top Axis (Months) */}
				<ScrollView
					ref={scrollViewRef}
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ gap: 4 }}
					style={{ flex: 1 }}
				>
					<View style={{ gap: Spacing.xs }}>
						{/* Month Labels Row */}
						<View style={{ height: 14, width: columns.length * 16 }}>
							{monthLabels.map((lbl, i) => (
								<Body
									key={i}
									secondary
									style={{
										fontSize: 10,
										lineHeight: 14,
										position: "absolute",
										left: lbl.colIndex * 16,
									}}
								>
									{lbl.text}
								</Body>
							))}
						</View>

						{/* Grid */}
						<View style={{ flexDirection: "row", gap: 4 }}>
							{columns.map((col, colIdx) => (
								<View key={colIdx} style={{ gap: 4 }}>
									{col.map((cell, rowIdx) => (
										<View
											key={rowIdx}
											style={
												{
													width: 12,
													height: 12,
													borderRadius: 3,
													backgroundColor: getCellColor(cell.rate),
												} satisfies ViewStyle
											}
										/>
									))}
								</View>
							))}
						</View>
					</View>
				</ScrollView>
			</View>
		</View>
	);
}
