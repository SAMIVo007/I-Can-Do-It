# Design System: Slate & Sage

A refined, editorial minimalist design system for the "I Can Do It" application, focusing on high-quality typography, flatness, and sophisticated, muted color application.

## 1. Vision & Voice

The design must be supportive, encouraging, and sophisticated. It should read like an elegant digital journal rather than a rigid corporate planner.

## 2. Color Palette

Use color only for emphasis and progress; never use color purely for decorative effect. All surfaces must be flat.

| Role                     | Color Name  | Hex Code  | Usage                                                          |
| :----------------------- | :---------- | :-------- | :------------------------------------------------------------- |
| **Neutral Background**   | Pale Stone  | `#FAF9F6` | Primary background color.                                      |
| **Secondary Background** | Light Gray  | `#F5F5F5` | Fill for flat cards/surfaces on the Pale Stone background.     |
| **Text Primary**         | Obsidian    | `#333333` | All body text and UI labels.                                   |
| **Heading Voice**        | Pitch Black | `#121212` | Major headings only.                                           |
| **Primary Accent**       | Slate Blue  | `#36454F` | Major interaction elements (buttons, active navigation).       |
| **Success / Progress**   | Sage Green  | `#9DC183` | Progress bars, completion checks, analytics success metrics.   |
| **Subtle Border**        | Platinum    | `#E0E0E0` | 1px borders for flattening surfaces without using color fills. |

## 3. Typography

A strict, high-contrast pairing creates editorial sophistication.

| Token          | Family                                    | Weight         | Case     | Usage                                                           |
| :------------- | :---------------------------------------- | :------------- | :------- | :-------------------------------------------------------------- |
| `font-voice`   | Elegant Serif (e.g., Garamond)            | Medium, Bold   | Sentence | App Name, Onboarding Goals, Daily Greeting, Analytics titles.   |
| `font-utility` | Technical Sans (e.g., Robot Mono/Akkurat) | Light, Regular | Sentence | Habit descriptions, dates, small labels, button text.           |
| `font-data`    | Technical Sans                            | Bold, Black    | Upper    | Streak numbers, Total days data, Monthly completion percentage. |

## 4. Surfaces & Elevation

This design system does not use shadows. Surfaces are flat.

- **Rule:** Use 0px shadows.
- **Card Elevation:** Define a Material Card using a flat background fill of `Light Gray` (#F5F5F5) against the `Pale Stone` (#FAF9F6) background, OR use a 1px border of `Platinum` (#E0E0E0).

## 5. Visualizations

Data visualizations must be mathematically clean and avoid gradients or 3D effects.

- **Habit Checklist:** When completed, the habit description uses `font-utility` light weight, is struck-through, and dims by 50% opacity. The checkbox fills with flat Sage Green (`#9DC183`).
- **Progress Rings/Charts:** Use thin, clean, solid-color lines (Slate Blue or Sage Green) on a Light Gray fill.
