// Exercise Types
export type ExerciseCategory = "big" | "medium" | "small";
export type MuscleGroup =
  | "push"
  | "pull"
  | "squat"
  | "hinge"
  | "isolation"
  | "calves";
export type DayType = "upper" | "lower" | "cardio" | "rest";
export type CardioType =
  | "elliptical"
  | "incline_walk"
  | "stair_climber"
  | "hiit";

// Base Exercise Definition
export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: string; // e.g., "8-10"
  restSeconds: number;
  formCues: string[];
  why: string;
  startingWeight?: number; // in kg
  weightUnit?: "kg" | "bodyweight";
}

// Logged Exercise (with actual performance)
export interface ExerciseLog {
  exerciseId: string;
  name: string;
  sets: SetLog[];
  notes?: string;
}

export interface SetLog {
  reps: number;
  weight: number;
  completed: boolean;
  rpe?: number; // Rate of Perceived Exertion 1-10
}

// Cardio Definitions
export interface CardioTemplate {
  type: CardioType;
  durationMinutes: number;
  intensity: string;
  rpe: string; // e.g., "6-7/10"
  notes?: string;
}

export interface CardioLog {
  type: CardioType;
  durationMinutes: number;
  notes?: string;
  completed: boolean;
}

// Workout Templates (weekly schedule)
export interface WorkoutTemplate {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  dayName: string;
  type: DayType;
  focus?: string;
  exercises: Exercise[];
  cardio?: CardioTemplate;
  warmup?: string[];
}

// Logged Workout
export interface WorkoutLog {
  id: string;
  date: string; // ISO date string
  dayOfWeek: number;
  type: DayType;
  exercises: ExerciseLog[];
  cardio?: CardioLog;
  notes?: string;
  completed: boolean;
  duration?: number; // in minutes
  rating?: number; // 1-5
}

// Progress Tracking
export interface WeightEntry {
  date: string;
  weight: number; // in kg
}

export interface StrengthProgress {
  exerciseId: string;
  exerciseName: string;
  entries: {
    date: string;
    weight: number;
    reps: number;
  }[];
}

// User Profile
export interface UserProfile {
  name: string;
  currentWeight: number; // in kg
  targetWeight: number; // in kg
  height: number; // in cm
  startDate: string;
  weekNumber: number;
}

// App State
export interface AppState {
  profile: UserProfile;
  weightHistory: WeightEntry[];
  workoutLogs: WorkoutLog[];
  strengthProgress: StrengthProgress[];
}

// Meal Planning Types
export type MealSlot = "breakfast" | "snack1" | "lunch" | "snack2" | "dinner";
export type QuantityType = "grams" | "pieces";
export type FoodCategory =
  | "protein"
  | "carb"
  | "vegetable"
  | "fat"
  | "dairy"
  | "complete";

// Base Food - nutritional values stored per 100g
export interface Food {
  id: string;
  name: string;
  // All macros are per 100g
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  // Optional piece info for countable items (eggs, slices, etc.)
  pieceWeightGrams?: number; // Weight of one piece in grams (e.g., egg = 50g)
  pieceName?: string; // Singular name (e.g., "egg", "slice")
  category: FoodCategory;
}

// Food with quantity - used when food is added to a meal
export interface MealFood extends Food {
  quantity: number; // Amount (in grams or pieces)
  quantityType: QuantityType; // "grams" or "pieces"
  // Calculated values for display (computed from per-100g values)
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  slot: MealSlot;
  label: string;
  targetCalories: number;
  targetProtein: number;
  foods: MealFood[];
  notes?: string;
}

export interface DailyMealPlan {
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
}

export interface UserMealPreferences {
  customMeals: Record<MealSlot, MealFood[]>; // user's swapped foods per slot
}

// Workout Customization Types
export interface WorkoutCustomization {
  dayOfWeek: number;
  weekStart: string;
  swappedExercises: Array<{ originalId: string; replacementId: string }>;
  addedExercises: string[];
  cardioCustomization?: CardioType;
}
