import type { WorkoutTemplate, CardioTemplate } from "@/lib/types"
import { upperBodyExercises, lowerBodyExercises } from "./exercises"

// Default cardio options
const defaultCardio: CardioTemplate = {
  type: "elliptical",
  durationMinutes: 15,
  intensity: "Moderate pace (can talk but slightly breathless)",
  rpe: "6-7/10",
  notes: "Use arms actively",
}

const inclineWalkCardio: CardioTemplate = {
  type: "incline_walk",
  durationMinutes: 15,
  intensity: "5-6 km/h, 5-10% incline",
  rpe: "5-6/10",
  notes: "No handrails, stand tall",
}

const stairClimberCardio: CardioTemplate = {
  type: "stair_climber",
  durationMinutes: 12,
  intensity: "Moderate pace",
  rpe: "7/10",
  notes: "Only after upper body days, stand upright",
}

// Weekly workout templates based on the gym trainer document
export const weeklySchedule: WorkoutTemplate[] = [
  // Monday - Upper Body 1
  {
    dayOfWeek: 1,
    dayName: "Monday",
    type: "upper",
    focus: "Chest and back, horizontal movements",
    warmup: [
      "5 min light cardio (bike or row)",
      "Arm circles, band pull-aparts",
      "1 light set of push-ups",
    ],
    exercises: [
      upperBodyExercises.find((e) => e.id === "db-bench-press")!,
      upperBodyExercises.find((e) => e.id === "lat-pulldown")!,
      upperBodyExercises.find((e) => e.id === "bicep-curls")!,
    ],
    cardio: defaultCardio,
  },

  // Tuesday - Lower Body 1
  {
    dayOfWeek: 2,
    dayName: "Tuesday",
    type: "lower",
    focus: "Squat pattern and posterior chain",
    warmup: [
      "5 min light cardio",
      "Bodyweight squats x 10",
      "Leg swings front/side",
    ],
    exercises: [
      lowerBodyExercises.find((e) => e.id === "goblet-squat")!,
      lowerBodyExercises.find((e) => e.id === "romanian-deadlift")!,
      lowerBodyExercises.find((e) => e.id === "leg-curls")!,
    ],
    cardio: defaultCardio,
  },

  // Wednesday - Rest
  {
    dayOfWeek: 3,
    dayName: "Wednesday",
    type: "rest",
    focus: "Recovery and nutrition focus",
    exercises: [],
  },

  // Thursday - Upper Body 2
  {
    dayOfWeek: 4,
    dayName: "Thursday",
    type: "upper",
    focus: "Shoulders and rowing movements",
    warmup: [
      "5 min light cardio",
      "Shoulder dislocates with band",
      "Light overhead press x 10",
    ],
    exercises: [
      upperBodyExercises.find((e) => e.id === "db-overhead-press")!,
      upperBodyExercises.find((e) => e.id === "cable-rows")!,
      upperBodyExercises.find((e) => e.id === "tricep-pushdowns")!,
    ],
    cardio: inclineWalkCardio,
  },

  // Friday - Lower Body 2
  {
    dayOfWeek: 5,
    dayName: "Friday",
    type: "lower",
    focus: "Hinge pattern and single leg work",
    warmup: [
      "5 min light cardio",
      "Hip circles",
      "Glute bridges x 10",
    ],
    exercises: [
      lowerBodyExercises.find((e) => e.id === "leg-press")!,
      lowerBodyExercises.find((e) => e.id === "lunges")!,
      lowerBodyExercises.find((e) => e.id === "leg-extensions")!,
    ],
    cardio: defaultCardio,
  },

  // Saturday - Cardio/HIIT
  {
    dayOfWeek: 6,
    dayName: "Saturday",
    type: "cardio",
    focus: "Active recovery or HIIT",
    exercises: [],
    cardio: {
      type: "hiit",
      durationMinutes: 25,
      intensity: "30 sec on / 30 sec off × 20 rounds",
      rpe: "8/10 during work, 4/10 during rest",
      notes: "Or 45-60 min easy e-bike ride",
    },
  },

  // Sunday - Full Rest
  {
    dayOfWeek: 0,
    dayName: "Sunday",
    type: "rest",
    focus: "Full rest - meal prep for the week",
    exercises: [],
  },
]

// Helper to get today's workout
export function getTodaysWorkout(): WorkoutTemplate {
  const today = new Date().getDay()
  return weeklySchedule.find((w) => w.dayOfWeek === today) || weeklySchedule[6]
}

// Helper to get workout by day of week
export function getWorkoutByDay(dayOfWeek: number): WorkoutTemplate | undefined {
  return weeklySchedule.find((w) => w.dayOfWeek === dayOfWeek)
}

// Get all training days (non-rest days)
export function getTrainingDays(): WorkoutTemplate[] {
  return weeklySchedule.filter((w) => w.type !== "rest")
}

