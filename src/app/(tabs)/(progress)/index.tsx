/**
 * Progress — Analytics screen.
 * Shows streak, total days, monthly rate, week circles, and monthly bar chart.
 */

import { BarChart } from "@/components/ui/bar-chart";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Body, Heading } from "@/components/ui/typography";
import { WeekCircles } from "@/components/ui/week-circles";
import { useAppColors } from "@/hooks/use-app-colors";
import { Spacing } from "@/constants/theme";
import { useHabitStore } from "@/stores/habit-store";
import type { DaySummary, MonthlyBar } from "@/types/models";
import {
	getCurrentWeekDates,
	getDayLabel,
	getDaysInMonth,
	getShortMonthName,
	toDateKey,
} from "@/utils/date";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, View, type ViewStyle } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

export default function ProgressScreen() {
	const Colors = useAppColors();
	const now = new Date();
	const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
	const [selectedYear] = useState(now.getFullYear());

	const habits = useHabitStore((s) => s.habits);
	const logs = useHabitStore((s) => s.logs);

	const activeHabits = useMemo(() => habits.filter((h) => h.isActive), [habits]);
	const today = toDateKey();

	const streak = useMemo(() => {
		if (activeHabits.length === 0) return 0;
		let s = 0;
		const date = new Date();
		for (let i = 0; i < 365; i++) {
			const dk = toDateKey(date);
			const allDone = activeHabits.every((h) => {
				const log = logs.find((l) => l.habitId === h.id && l.date === dk);
				if (!log) return false;
				if (h.type === "boolean") return log.value === 1;
				return log.value >= (h.target ?? 1);
			});
			if (allDone) {
				s++;
			} else if (i > 0) {
				break;
			}
			date.setDate(date.getDate() - 1);
		}
		return s;
	}, [activeHabits, logs]);

	const totalDays = useMemo(() => new Set(logs.map((l) => l.date)).size, [logs]);

	const weekSummary = useMemo((): DaySummary[] => {
		const weekDates = getCurrentWeekDates();
		return weekDates.map((d) => {
			const dk = toDateKey(d);
			const isFuture = dk > today;
			let completionRate = 0;
			if (!isFuture && activeHabits.length > 0) {
				const completed = activeHabits.filter((h) => {
					const log = logs.find((l) => l.habitId === h.id && l.date === dk);
					if (!log) return false;
					if (h.type === "boolean") return log.value === 1;
					return log.value >= (h.target ?? 1);
				}).length;
				completionRate = completed / activeHabits.length;
			}
			return {
				date: dk,
				dayLabel: getDayLabel(d),
				completionRate,
				isToday: dk === today,
				isFuture,
			};
		});
	}, [activeHabits, logs, today]);

	const monthlyData = useMemo((): MonthlyBar[] => {
		const days = getDaysInMonth(selectedMonth, selectedYear);
		const bars: MonthlyBar[] = [];
		for (let day = 1; day <= days; day++) {
			const dk = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
			const completed = activeHabits.filter((h) => {
				const log = logs.find((l) => l.habitId === h.id && l.date === dk);
				if (!log) return false;
				if (h.type === "boolean") return log.value === 1;
				return log.value >= (h.target ?? 1);
			}).length;
			bars.push({
				day,
				habitsCompleted: completed,
				totalHabits: activeHabits.length,
				isToday: dk === today,
			});
		}
		return bars;
	}, [activeHabits, logs, selectedMonth, selectedYear, today]);

	const monthlyRate = useMemo(() => {
		const daysWithHabits = monthlyData.filter((d) => d.totalHabits > 0);
		if (daysWithHabits.length === 0) return 0;
		return Math.round(
			(daysWithHabits.filter((d) => d.habitsCompleted >= d.totalHabits).length /
				daysWithHabits.length) *
				100,
		);
	}, [monthlyData]);

	const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;

	return (
		<ScrollView
			contentInsetAdjustmentBehavior="automatic"
			contentContainerStyle={{
				padding: Spacing.xl,
				paddingBottom: Spacing.xxxl * 2,
				paddingTop: Spacing.xxxl,
				gap: Spacing.xl,
			}}
			style={{ backgroundColor: Colors.background }}
		>
			<Animated.View
				entering={FadeInDown.duration(400)}
				style={{ gap: Spacing.xs }}
			>
				<Heading size="xl">Analytics</Heading>
				<Body secondary>Track your consistency and build momentum.</Body>
			</Animated.View>

			<Animated.View entering={FadeInDown.duration(400).delay(100)}>
				<View style={{ flexDirection: "row", gap: Spacing.md } satisfies ViewStyle}>
					<StatCard
						label="Current Streak"
						value={streak}
						unit="days"
						icon={
							<Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
								<Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={Colors.accent} />
							</Svg>
						}
					/>
					<StatCard
						label="Total Days"
						value={totalDays}
						unit="days"
						icon={
							<Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
								<Path
									d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18"
									stroke={Colors.accent}
									strokeWidth={2}
									strokeLinecap="round"
								/>
							</Svg>
						}
					/>
				</View>
			</Animated.View>

			<Animated.View entering={FadeInDown.duration(400).delay(200)}>
				<Card variant="filled" padding="lg">
					<View style={{ gap: Spacing.sm }}>
						<View
							style={{ flexDirection: "row", alignItems: "center", gap: Spacing.xs }}
						>
							<Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
								<Path
									d="M12 2a10 10 0 100 20 10 10 0 000-20z"
									stroke={Colors.success}
									strokeWidth={2}
								/>
								<Path
									d="M12 6v6l4 2"
									stroke={Colors.success}
									strokeWidth={2}
									strokeLinecap="round"
								/>
							</Svg>
							<Body size="sm" secondary>
								Monthly Rate
							</Body>
						</View>
						<View
							style={{ flexDirection: "row", alignItems: "baseline", gap: Spacing.xs }}
						>
							<Heading size="xl">{monthlyRate}</Heading>
							<Body size="lg" secondary>
								%
							</Body>
						</View>
					</View>
				</Card>
			</Animated.View>

			<Animated.View entering={FadeInDown.duration(400).delay(300)}>
				<Card variant="filled" padding="lg">
					<View style={{ gap: Spacing.lg }}>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<Body weight="bold" size="lg">
								This Week
							</Body>
							<Body size="sm" style={{ color: Colors.accent }}>
								Details
							</Body>
						</View>
						<WeekCircles days={weekSummary} />
					</View>
				</Card>
			</Animated.View>

			<Animated.View entering={FadeInDown.duration(400).delay(400)}>
				<Card variant="filled" padding="lg">
					<View style={{ gap: Spacing.lg }}>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<View style={{ gap: Spacing.xs }}>
								<Body weight="bold" size="lg">
									Monthly Overview
								</Body>
								<Body size="xs" secondary>
									Habits completed per day
								</Body>
							</View>
							<View style={{ flexDirection: "row", gap: Spacing.sm }}>
								<Pressable
									onPress={() => setSelectedMonth(now.getMonth())}
									style={{
										paddingVertical: 4,
										paddingHorizontal: Spacing.md,
										borderRadius: Spacing.sm,
										backgroundColor:
											selectedMonth === now.getMonth()
												? Colors.accent
												: Colors.transparent,
									}}
								>
									<Body
										size="sm"
										style={{
											color:
												selectedMonth === now.getMonth()
													? Colors.white
													: Colors.textPrimary,
										}}
									>
										{getShortMonthName(now.getMonth())}
									</Body>
								</Pressable>
								<Pressable
									onPress={() => setSelectedMonth(prevMonth)}
									style={{
										paddingVertical: 4,
										paddingHorizontal: Spacing.md,
										borderRadius: Spacing.sm,
										backgroundColor:
											selectedMonth === prevMonth ? Colors.accent : Colors.transparent,
									}}
								>
									<Body
										size="sm"
										style={{
											color:
												selectedMonth === prevMonth ? Colors.white : Colors.textPrimary,
										}}
									>
										{getShortMonthName(prevMonth)}
									</Body>
								</Pressable>
							</View>
						</View>
						<ScrollView horizontal showsHorizontalScrollIndicator={false}>
							<BarChart data={monthlyData} />
						</ScrollView>
					</View>
				</Card>
			</Animated.View>
		</ScrollView>
	);
}
