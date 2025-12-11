import type { Food, Meal, MealSlot, DailyMealPlan } from "@/lib/types";

// Complete meal option type (for breakfast/snacks where user picks ONE option)
export interface MealOption {
  id: string;
  name: string;
  foods: Food[];
}

// Daily Nutrition Targets (1,900-2,000 cal / 200g+ protein plan - 600g meat daily)
export const DAILY_TARGETS = {
  calories: 1950,
  protein: 200,
};

// Food Banks - organized by category for easy swapping
// NOTE: This is now managed in the database. All values are per 100g.
// Foods with pieceWeightGrams can be measured by piece count instead of grams.
export const foodBank: Record<string, Food[]> = {
  // Breakfast proteins
  breakfastProteins: [],
  // Breakfast carbs
  breakfastCarbs: [],
  // Lunch proteins
  lunchProteins: [],
  // Lunch carbs
  lunchCarbs: [],
  // Lunch vegetables
  lunchVegetables: [],
  // Dinner proteins
  dinnerProteins: [],
  // Dinner vegetables
  dinnerVegetables: [],
  // Snack proteins
  snackProteins: [],
  // Fats/oils
  fats: [],
};

// Example per-100g food entries for reference when adding new ingredients:
//
// Egg (whole, raw):
// - caloriesPer100g: 143
// - proteinPer100g: 13
// - carbsPer100g: 1
// - fatPer100g: 10
// - pieceWeightGrams: 50 (one medium egg)
// - pieceName: "egg"
//
// Chicken Breast (raw):
// - caloriesPer100g: 120
// - proteinPer100g: 23
// - carbsPer100g: 0
// - fatPer100g: 2.6
//
// Whole Grain Bread:
// - caloriesPer100g: 247
// - proteinPer100g: 13
// - carbsPer100g: 41
// - fatPer100g: 4
// - pieceWeightGrams: 30 (one slice)
// - pieceName: "slice"
//
// Oats (dry):
// - caloriesPer100g: 389
// - proteinPer100g: 17
// - carbsPer100g: 66
// - fatPer100g: 7

// Meal options for breakfast/snacks are now managed in the database via meal_options table
export const mealOptions: Record<MealSlot, MealOption[]> = {
  breakfast: [],
  snack1: [],
  lunch: [],
  snack2: [],
  dinner: [],
};

// Default meals are now managed in the database
// This serves as a fallback structure
export const defaultMeals: Meal[] = [
  {
    slot: "breakfast",
    label: "Breakfast",
    targetCalories: 400,
    targetProtein: 30,
    foods: [],
    notes: "Add ingredients via the admin settings page",
  },
  {
    slot: "snack1",
    label: "Morning Snack",
    targetCalories: 200,
    targetProtein: 30,
    foods: [],
  },
  {
    slot: "lunch",
    label: "Lunch",
    targetCalories: 700,
    targetProtein: 80,
    foods: [],
    notes: "400g protein + carbs + vegetables",
  },
  {
    slot: "snack2",
    label: "Afternoon Snack",
    targetCalories: 200,
    targetProtein: 30,
    foods: [],
  },
  {
    slot: "dinner",
    label: "Dinner",
    targetCalories: 450,
    targetProtein: 50,
    foods: [],
    notes: "200g protein + vegetables (no carbs)",
  },
];

// Helper to create a daily meal plan
export function createDailyMealPlan(meals: Meal[]): DailyMealPlan {
  const totalCalories = meals.reduce(
    (sum, meal) =>
      sum + meal.foods.reduce((foodSum, food) => foodSum + food.calories, 0),
    0
  );
  const totalProtein = meals.reduce(
    (sum, meal) =>
      sum + meal.foods.reduce((foodSum, food) => foodSum + food.protein, 0),
    0
  );

  return {
    meals,
    totalCalories,
    totalProtein,
  };
}
