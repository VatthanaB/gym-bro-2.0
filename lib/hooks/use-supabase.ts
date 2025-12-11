"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type {
  Exercise,
  ExerciseLog,
  WorkoutLog,
  WeightEntry,
  UserProfile,
  Food,
  MealFood,
  Meal,
  MealSlot,
  DayType,
  CardioType,
  CardioTemplate,
  WorkoutTemplate,
} from "@/lib/types";
import { getDefaultCardioTemplate } from "@/lib/data/workouts";
import { calculateMacros } from "@/lib/utils/nutrition";

// =============================================
// AUTH HOOK
// =============================================

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase.auth]);

  return { user, loading, signOut };
}

// =============================================
// EXERCISES HOOK
// =============================================

interface DBExercise {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  body_section: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  form_cues: string[];
  why: string;
  starting_weight: number | null;
  weight_unit: string;
}

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchExercises() {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching exercises:", error);
        setIsLoaded(true);
        return;
      }

      // Transform to match existing Exercise type
      const transformed: Exercise[] = ((data as DBExercise[]) || []).map(
        (ex) => ({
          id: ex.id,
          name: ex.name,
          category: ex.category as Exercise["category"],
          muscleGroup: ex.muscle_group as Exercise["muscleGroup"],
          sets: ex.sets,
          reps: ex.reps,
          restSeconds: ex.rest_seconds,
          formCues: ex.form_cues,
          why: ex.why,
          startingWeight: ex.starting_weight ?? undefined,
          weightUnit: ex.weight_unit as Exercise["weightUnit"],
        })
      );

      setExercises(transformed);
      setIsLoaded(true);
    }

    fetchExercises();
  }, [supabase]);

  const getExerciseById = useCallback(
    (id: string) => exercises.find((ex) => ex.id === id),
    [exercises]
  );

  const filterExercises = useCallback(
    (category?: string, muscleGroup?: string) => {
      return exercises.filter((ex) => {
        if (category && ex.category !== category) return false;
        if (muscleGroup && ex.muscleGroup !== muscleGroup) return false;
        return true;
      });
    },
    [exercises]
  );

  const getUpperBodyExercises = useCallback(() => {
    return exercises.filter((ex) => {
      const upperMuscles = ["push", "pull", "isolation"];
      return upperMuscles.includes(ex.muscleGroup);
    });
  }, [exercises]);

  const getLowerBodyExercises = useCallback(() => {
    return exercises.filter((ex) => {
      const lowerMuscles = ["squat", "hinge", "calves", "isolation"];
      // Check if it's likely a lower body exercise based on name patterns
      const lowerBodyNames = [
        "squat",
        "deadlift",
        "lunge",
        "leg",
        "calf",
        "hip",
        "step",
      ];
      const isLowerByName = lowerBodyNames.some((name) =>
        ex.name.toLowerCase().includes(name)
      );
      return (
        ex.muscleGroup === "squat" ||
        ex.muscleGroup === "hinge" ||
        ex.muscleGroup === "calves" ||
        isLowerByName
      );
    });
  }, [exercises]);

  return {
    exercises,
    isLoaded,
    getExerciseById,
    filterExercises,
    getUpperBodyExercises,
    getLowerBodyExercises,
  };
}

// =============================================
// USER EXERCISE DATA HOOK
// =============================================

export interface UserExerciseData {
  exerciseId: string;
  weight?: number;
  sets?: number;
  reps?: string;
  notes?: string;
}

interface DBUserExerciseData {
  id: string;
  user_id: string;
  exercise_id: string;
  weight: number | null;
  sets: number | null;
  reps: string | null;
  notes: string | null;
}

export function useUserExerciseData() {
  const [exerciseData, setExerciseData] = useState<
    Record<string, UserExerciseData>
  >({});
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      queueMicrotask(() => setIsLoaded(true));
      return;
    }

    async function fetchExerciseData() {
      const { data, error } = await supabase
        .from("user_exercise_data")
        .select("*")
        .eq("user_id", user!.id);

      if (error) {
        console.error("Error fetching user exercise data:", error);
        setIsLoaded(true);
        return;
      }

      const dbData = (data as DBUserExerciseData[]) || [];
      const transformed: Record<string, UserExerciseData> = {};

      dbData.forEach((d) => {
        transformed[d.exercise_id] = {
          exerciseId: d.exercise_id,
          weight: d.weight ?? undefined,
          sets: d.sets ?? undefined,
          reps: d.reps ?? undefined,
          notes: d.notes ?? undefined,
        };
      });

      setExerciseData(transformed);
      setIsLoaded(true);
    }

    fetchExerciseData();
  }, [user, supabase]);

  const updateExerciseData = useCallback(
    async (
      exerciseId: string,
      updates: Partial<Omit<UserExerciseData, "exerciseId">>
    ) => {
      if (!user) return;

      const { error } = await supabase.from("user_exercise_data").upsert(
        {
          user_id: user.id,
          exercise_id: exerciseId,
          weight: updates.weight ?? null,
          sets: updates.sets ?? null,
          reps: updates.reps ?? null,
          notes: updates.notes ?? null,
        },
        {
          onConflict: "user_id,exercise_id",
        }
      );

      if (error) {
        console.error("Error updating exercise data:", error);
        return;
      }

      setExerciseData((prev) => ({
        ...prev,
        [exerciseId]: {
          ...prev[exerciseId],
          exerciseId,
          ...updates,
        },
      }));
    },
    [user, supabase]
  );

  const getExerciseData = useCallback(
    (exerciseId: string): UserExerciseData | undefined => {
      return exerciseData[exerciseId];
    },
    [exerciseData]
  );

  const clearExerciseData = useCallback(
    async (exerciseId: string) => {
      if (!user) return;

      const { error } = await supabase
        .from("user_exercise_data")
        .delete()
        .eq("user_id", user.id)
        .eq("exercise_id", exerciseId);

      if (error) {
        console.error("Error clearing exercise data:", error);
        return;
      }

      setExerciseData((prev) => {
        const newData = { ...prev };
        delete newData[exerciseId];
        return newData;
      });
    },
    [user, supabase]
  );

  return {
    exerciseData,
    updateExerciseData,
    getExerciseData,
    clearExerciseData,
    isLoaded,
  };
}

// =============================================
// FOODS & MEALS HOOK
// =============================================

interface DBFood {
  id: string;
  name: string;
  calories: number; // per 100g
  protein: number; // per 100g
  carbs: number; // per 100g
  fat: number; // per 100g
  portion: string; // legacy field, kept for backwards compatibility
  category: string;
  food_bank_category: string;
  is_enabled?: boolean;
  piece_weight_grams?: number; // weight of one piece in grams
  piece_name?: string; // singular name for pieces (e.g., "egg")
}

interface DBCustomFood {
  id: string;
  created_by: string;
  name: string;
  calories: number; // per 100g
  protein: number; // per 100g
  carbs: number; // per 100g
  fat: number; // per 100g
  portion: string; // legacy field
  raw_weight: number | null;
  cooked_weight: number | null;
  category: string;
  food_bank_category: string;
  created_at: string;
  is_enabled?: boolean;
  piece_weight_grams?: number;
  piece_name?: string;
}

interface DBFoodCategoryAssignment {
  id: string;
  food_id: string;
  food_source: "foods" | "custom_foods";
  category: string;
}

// Extended Food type for admin management (includes metadata)
export interface ExtendedFood extends Food {
  foodBankCategory: string;
  source: "foods" | "custom_foods";
  isEnabled: boolean;
  additionalCategories: string[];
}

// Helper function to transform DB food to Food type
function transformDBFoodToFood(f: DBFood): Food {
  return {
    id: f.id,
    name: f.name,
    caloriesPer100g: f.calories,
    proteinPer100g: f.protein,
    carbsPer100g: f.carbs,
    fatPer100g: f.fat,
    pieceWeightGrams: f.piece_weight_grams,
    pieceName: f.piece_name,
    category: f.category as Food["category"],
  };
}

// Helper function to transform DB custom food to Food type
function transformDBCustomFoodToFood(f: DBCustomFood): Food {
  return {
    id: f.id,
    name: f.name,
    caloriesPer100g: f.calories,
    proteinPer100g: Number(f.protein),
    carbsPer100g: Number(f.carbs),
    fatPer100g: Number(f.fat),
    pieceWeightGrams: f.piece_weight_grams,
    pieceName: f.piece_name,
    category: f.category as Food["category"],
  };
}

export function useFoods() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [foodBank, setFoodBank] = useState<Record<string, Food[]>>({});
  const [allFoodsForAdmin, setAllFoodsForAdmin] = useState<ExtendedFood[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const supabase = createClient();

  const fetchFoods = useCallback(async () => {
    // Fetch foods, custom foods, and category assignments in parallel
    const [foodsResult, customFoodsResult, categoryAssignmentsResult] =
      await Promise.all([
        supabase.from("foods").select("*"),
        supabase.from("custom_foods").select("*"),
        supabase.from("food_category_assignments").select("*"),
      ]);

    if (foodsResult.error) {
      console.error("Error fetching foods:", foodsResult.error);
    }

    // Custom foods might not exist yet (table not created), so don't fail on error
    if (
      customFoodsResult.error &&
      !customFoodsResult.error.message.includes("does not exist")
    ) {
      console.error("Error fetching custom foods:", customFoodsResult.error);
    }

    // Category assignments might not exist yet
    if (
      categoryAssignmentsResult.error &&
      !categoryAssignmentsResult.error.message.includes("does not exist")
    ) {
      console.error(
        "Error fetching category assignments:",
        categoryAssignmentsResult.error
      );
    }

    const dbFoods = (foodsResult.data as DBFood[]) || [];
    const dbCustomFoods = (customFoodsResult.data as DBCustomFood[]) || [];
    const categoryAssignments =
      (categoryAssignmentsResult.data as DBFoodCategoryAssignment[]) || [];

    // Build a map of additional categories per food
    const additionalCategoriesMap: Record<string, string[]> = {};
    categoryAssignments.forEach((assignment) => {
      const key = `${assignment.food_source}:${assignment.food_id}`;
      if (!additionalCategoriesMap[key]) {
        additionalCategoriesMap[key] = [];
      }
      additionalCategoriesMap[key].push(assignment.category);
    });

    // Transform regular foods (only enabled ones for normal use)
    const transformedFoods: Food[] = dbFoods
      .filter((f) => f.is_enabled !== false)
      .map(transformDBFoodToFood);

    // Transform custom foods (only enabled ones for normal use)
    const transformedCustomFoods: Food[] = dbCustomFoods
      .filter((f) => f.is_enabled !== false)
      .map(transformDBCustomFoodToFood);

    // Combine all enabled foods
    const allFoods = [...transformedFoods, ...transformedCustomFoods];
    setFoods(allFoods);

    // Build extended foods list for admin (includes all foods with metadata)
    const extendedFoods: ExtendedFood[] = [
      ...dbFoods.map((f) => ({
        ...transformDBFoodToFood(f),
        foodBankCategory: f.food_bank_category,
        source: "foods" as const,
        isEnabled: f.is_enabled !== false,
        additionalCategories: additionalCategoriesMap[`foods:${f.id}`] || [],
      })),
      ...dbCustomFoods.map((f) => ({
        ...transformDBCustomFoodToFood(f),
        foodBankCategory: f.food_bank_category,
        source: "custom_foods" as const,
        isEnabled: f.is_enabled !== false,
        additionalCategories:
          additionalCategoriesMap[`custom_foods:${f.id}`] || [],
      })),
    ];
    setAllFoodsForAdmin(extendedFoods);

    // Group by food_bank_category (include both regular and custom, only enabled)
    const grouped: Record<string, Food[]> = {};

    // Helper to add food to a category group
    const addToGroup = (category: string, food: Food) => {
      if (!grouped[category]) {
        grouped[category] = [];
      }
      // Avoid duplicates
      if (!grouped[category].some((f) => f.id === food.id)) {
        grouped[category].push(food);
      }
    };

    // Add regular foods to groups (primary category + additional categories)
    dbFoods
      .filter((f) => f.is_enabled !== false)
      .forEach((f) => {
        const food = transformDBFoodToFood(f);
        // Add to primary category
        addToGroup(f.food_bank_category, food);
        // Add to additional categories
        const additionalCats = additionalCategoriesMap[`foods:${f.id}`] || [];
        additionalCats.forEach((cat) => addToGroup(cat, food));
      });

    // Add custom foods to groups (primary category + additional categories)
    dbCustomFoods
      .filter((f) => f.is_enabled !== false)
      .forEach((f) => {
        const food = transformDBCustomFoodToFood(f);
        // Add to primary category
        addToGroup(f.food_bank_category, food);
        // Add to additional categories
        const additionalCats =
          additionalCategoriesMap[`custom_foods:${f.id}`] || [];
        additionalCats.forEach((cat) => addToGroup(cat, food));
      });

    setFoodBank(grouped);
    setIsLoaded(true);
  }, [supabase]);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      await fetchFoods();
      if (ignore) return;
    };

    load();

    return () => {
      ignore = true;
    };
  }, [fetchFoods]);

  return { foods, foodBank, allFoodsForAdmin, isLoaded, refetch: fetchFoods };
}

// =============================================
// CUSTOM FOODS HOOK (Admin only)
// =============================================

export interface CustomFoodInput {
  name: string;
  // All macros per 100g
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  // Optional piece info
  pieceWeightGrams?: number;
  pieceName?: string;
  category: Food["category"];
  foodBankCategory: string;
}

// Validate that macros roughly match calories (within 15% tolerance)
// All values should be per 100g
export function validateMacros(food: CustomFoodInput): {
  valid: boolean;
  calculatedCalories: number;
  message?: string;
} {
  const calculatedCalories = Math.round(
    food.proteinPer100g * 4 + food.carbsPer100g * 4 + food.fatPer100g * 9
  );
  const tolerance = food.caloriesPer100g * 0.15; // 15% tolerance
  const diff = Math.abs(calculatedCalories - food.caloriesPer100g);

  if (diff > tolerance) {
    return {
      valid: false,
      calculatedCalories,
      message: `Macros calculate to ${calculatedCalories} kcal/100g but you entered ${
        food.caloriesPer100g
      } kcal/100g. Difference: ${diff > 0 ? "+" : ""}${
        calculatedCalories - food.caloriesPer100g
      } kcal`,
    };
  }

  return { valid: true, calculatedCalories };
}

export function useCustomFoods() {
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  const addCustomFood = useCallback(
    async (food: CustomFoodInput): Promise<Food | null> => {
      if (!user) {
        setError("You must be logged in to add foods");
        return null;
      }

      setIsAdding(true);
      setError(null);

      try {
        const { data, error: insertError } = await supabase
          .from("custom_foods")
          .insert({
            created_by: user.id,
            name: food.name,
            calories: food.caloriesPer100g,
            protein: food.proteinPer100g,
            carbs: food.carbsPer100g,
            fat: food.fatPer100g,
            portion: "", // Legacy field, no longer used
            piece_weight_grams: food.pieceWeightGrams ?? null,
            piece_name: food.pieceName ?? null,
            category: food.category,
            food_bank_category: food.foodBankCategory,
          })
          .select()
          .single();

        if (insertError) {
          // Check for admin permission error
          if (insertError.message.includes("policy")) {
            setError(
              "You don't have permission to add foods. Admin access required."
            );
          } else {
            setError(insertError.message);
          }
          return null;
        }

        const newFood: Food = {
          id: data.id,
          name: data.name,
          caloriesPer100g: data.calories,
          proteinPer100g: Number(data.protein),
          carbsPer100g: Number(data.carbs),
          fatPer100g: Number(data.fat),
          pieceWeightGrams: data.piece_weight_grams ?? undefined,
          pieceName: data.piece_name ?? undefined,
          category: data.category as Food["category"],
        };

        return newFood;
      } catch (err) {
        setError("Failed to add food");
        console.error("Error adding custom food:", err);
        return null;
      } finally {
        setIsAdding(false);
      }
    },
    [user, supabase]
  );

  const updateCustomFood = useCallback(
    async (id: string, food: Partial<CustomFoodInput>): Promise<boolean> => {
      if (!user) {
        setError("You must be logged in to update foods");
        return false;
      }

      setIsUpdating(true);
      setError(null);

      try {
        const updateData: Record<string, unknown> = {};
        if (food.name !== undefined) updateData.name = food.name;
        if (food.caloriesPer100g !== undefined)
          updateData.calories = food.caloriesPer100g;
        if (food.proteinPer100g !== undefined)
          updateData.protein = food.proteinPer100g;
        if (food.carbsPer100g !== undefined)
          updateData.carbs = food.carbsPer100g;
        if (food.fatPer100g !== undefined) updateData.fat = food.fatPer100g;
        if (food.pieceWeightGrams !== undefined)
          updateData.piece_weight_grams = food.pieceWeightGrams;
        if (food.pieceName !== undefined)
          updateData.piece_name = food.pieceName;
        if (food.category !== undefined) updateData.category = food.category;
        if (food.foodBankCategory !== undefined)
          updateData.food_bank_category = food.foodBankCategory;

        const { error: updateError } = await supabase
          .from("custom_foods")
          .update(updateData)
          .eq("id", id);

        if (updateError) {
          if (updateError.message.includes("policy")) {
            setError(
              "You don't have permission to update foods. Admin access required."
            );
          } else {
            setError(updateError.message);
          }
          return false;
        }

        return true;
      } catch (err) {
        setError("Failed to update food");
        console.error("Error updating custom food:", err);
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [user, supabase]
  );

  const deleteCustomFood = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) {
        setError("You must be logged in to delete foods");
        return false;
      }

      setIsDeleting(true);
      setError(null);

      try {
        const { error: deleteError } = await supabase
          .from("custom_foods")
          .delete()
          .eq("id", id);

        if (deleteError) {
          if (deleteError.message.includes("policy")) {
            setError(
              "You don't have permission to delete foods. Admin access required."
            );
          } else {
            setError(deleteError.message);
          }
          return false;
        }

        return true;
      } catch (err) {
        setError("Failed to delete food");
        console.error("Error deleting custom food:", err);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [user, supabase]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    addCustomFood,
    updateCustomFood,
    deleteCustomFood,
    isAdding,
    isUpdating,
    isDeleting,
    error,
    clearError,
    validateMacros,
  };
}

// =============================================
// INGREDIENT MANAGEMENT HOOK (Admin only)
// =============================================

export function useIngredientManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  // Toggle food enabled/disabled status
  const toggleFoodEnabled = useCallback(
    async (
      foodId: string,
      source: "foods" | "custom_foods",
      enabled: boolean
    ): Promise<boolean> => {
      if (!user) {
        setError("You must be logged in");
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { error: updateError } = await supabase
          .from(source)
          .update({ is_enabled: enabled })
          .eq("id", foodId);

        if (updateError) {
          if (updateError.message.includes("policy")) {
            setError("You don't have permission. Admin access required.");
          } else {
            setError(updateError.message);
          }
          return false;
        }

        return true;
      } catch (err) {
        setError("Failed to update food status");
        console.error("Error toggling food enabled:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user, supabase]
  );

  // Update a food item (works for both foods and custom_foods tables)
  const updateFood = useCallback(
    async (
      foodId: string,
      source: "foods" | "custom_foods",
      data: Partial<CustomFoodInput>
    ): Promise<boolean> => {
      if (!user) {
        setError("You must be logged in");
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const updateData: Record<string, unknown> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.caloriesPer100g !== undefined)
          updateData.calories = data.caloriesPer100g;
        if (data.proteinPer100g !== undefined)
          updateData.protein = data.proteinPer100g;
        if (data.carbsPer100g !== undefined)
          updateData.carbs = data.carbsPer100g;
        if (data.fatPer100g !== undefined) updateData.fat = data.fatPer100g;
        if (data.pieceWeightGrams !== undefined)
          updateData.piece_weight_grams = data.pieceWeightGrams;
        if (data.pieceName !== undefined)
          updateData.piece_name = data.pieceName;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.foodBankCategory !== undefined)
          updateData.food_bank_category = data.foodBankCategory;

        const { error: updateError } = await supabase
          .from(source)
          .update(updateData)
          .eq("id", foodId);

        if (updateError) {
          if (updateError.message.includes("policy")) {
            setError("You don't have permission. Admin access required.");
          } else {
            setError(updateError.message);
          }
          return false;
        }

        return true;
      } catch (err) {
        setError("Failed to update food");
        console.error("Error updating food:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user, supabase]
  );

  // Delete a food item
  const deleteFood = useCallback(
    async (
      foodId: string,
      source: "foods" | "custom_foods"
    ): Promise<boolean> => {
      if (!user) {
        setError("You must be logged in");
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // First delete any category assignments for this food
        await supabase
          .from("food_category_assignments")
          .delete()
          .eq("food_id", foodId)
          .eq("food_source", source);

        // Then delete the food itself
        const { error: deleteError } = await supabase
          .from(source)
          .delete()
          .eq("id", foodId);

        if (deleteError) {
          if (deleteError.message.includes("policy")) {
            setError("You don't have permission. Admin access required.");
          } else {
            setError(deleteError.message);
          }
          return false;
        }

        return true;
      } catch (err) {
        setError("Failed to delete food");
        console.error("Error deleting food:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user, supabase]
  );

  // Update category assignments for a food
  const updateFoodCategories = useCallback(
    async (
      foodId: string,
      source: "foods" | "custom_foods",
      additionalCategories: string[]
    ): Promise<boolean> => {
      if (!user) {
        setError("You must be logged in");
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Delete existing category assignments for this food
        const { error: deleteError } = await supabase
          .from("food_category_assignments")
          .delete()
          .eq("food_id", foodId)
          .eq("food_source", source);

        if (deleteError && !deleteError.message.includes("does not exist")) {
          console.error(
            "Error deleting old category assignments:",
            deleteError
          );
        }

        // Insert new category assignments (if any)
        if (additionalCategories.length > 0) {
          const newAssignments = additionalCategories.map((category) => ({
            food_id: foodId,
            food_source: source,
            category,
          }));

          const { error: insertError } = await supabase
            .from("food_category_assignments")
            .insert(newAssignments);

          if (insertError) {
            if (insertError.message.includes("policy")) {
              setError("You don't have permission. Admin access required.");
            } else {
              setError(insertError.message);
            }
            return false;
          }
        }

        return true;
      } catch (err) {
        setError("Failed to update food categories");
        console.error("Error updating food categories:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user, supabase]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    toggleFoodEnabled,
    updateFood,
    deleteFood,
    updateFoodCategories,
    isLoading,
    error,
    clearError,
  };
}

interface DBMealFood {
  food_id: string;
  quantity: number;
  quantity_type: "grams" | "pieces";
  foods: DBFood;
}

interface DBMeal {
  id: string;
  slot: string;
  label: string;
  target_calories: number;
  target_protein: number;
  notes: string | null;
  meal_foods: DBMealFood[];
}

export function useMeals() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchMeals() {
      // Fetch meals with their foods including quantity
      const { data: mealsData, error: mealsError } = await supabase
        .from("meals")
        .select(
          `
          *,
          meal_foods (
            food_id,
            quantity,
            quantity_type,
            foods (*)
          )
        `
        )
        .order("slot");

      if (mealsError) {
        console.error("Error fetching meals:", mealsError);
        setIsLoaded(true);
        return;
      }

      const dbMeals = (mealsData as DBMeal[]) || [];
      const transformed: Meal[] = dbMeals.map((m) => ({
        slot: m.slot as MealSlot,
        label: m.label,
        targetCalories: m.target_calories,
        targetProtein: m.target_protein,
        notes: m.notes ?? undefined,
        foods: (m.meal_foods || []).map((mf) => {
          const baseFood: Food = {
            id: mf.foods.id,
            name: mf.foods.name,
            caloriesPer100g: mf.foods.calories,
            proteinPer100g: mf.foods.protein,
            carbsPer100g: mf.foods.carbs,
            fatPer100g: mf.foods.fat,
            pieceWeightGrams: mf.foods.piece_weight_grams,
            pieceName: mf.foods.piece_name,
            category: mf.foods.category as Food["category"],
          };
          const macros = calculateMacros(
            baseFood,
            mf.quantity,
            mf.quantity_type
          );
          return {
            ...baseFood,
            quantity: mf.quantity,
            quantityType: mf.quantity_type,
            calories: macros.calories,
            protein: macros.protein,
            carbs: macros.carbs,
            fat: macros.fat,
          };
        }),
      }));

      setMeals(transformed);
      setIsLoaded(true);
    }

    fetchMeals();
  }, [supabase]);

  return { meals, isLoaded };
}

// =============================================
// WORKOUT TEMPLATES HOOK
// =============================================

interface DBWorkoutTemplate {
  id: string;
  day_of_week: number;
  day_name: string;
  type: string;
  focus: string | null;
  warmup: string[] | null;
  cardio_type: string | null;
  cardio_duration_minutes: number | null;
  cardio_intensity: string | null;
  cardio_rpe: string | null;
  cardio_notes: string | null;
  workout_template_exercises: Array<{
    exercise_id: string;
    order_index: number;
    exercises: DBExercise;
  }>;
}

export function useWorkoutTemplates() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchTemplates() {
      const { data, error } = await supabase
        .from("workout_templates")
        .select(
          `
          *,
          workout_template_exercises (
            exercise_id,
            order_index,
            exercises (*)
          )
        `
        )
        .order("day_of_week");

      if (error) {
        console.error("Error fetching workout templates:", error);
        setIsLoaded(true);
        return;
      }

      const dbTemplates = (data as DBWorkoutTemplate[]) || [];
      const transformed: WorkoutTemplate[] = dbTemplates.map((t) => {
        const cardio: CardioTemplate | undefined = t.cardio_type
          ? {
              type: t.cardio_type as CardioTemplate["type"],
              durationMinutes: t.cardio_duration_minutes!,
              intensity: t.cardio_intensity!,
              rpe: t.cardio_rpe!,
              notes: t.cardio_notes ?? undefined,
            }
          : undefined;

        const exercises = (t.workout_template_exercises || [])
          .sort((a, b) => a.order_index - b.order_index)
          .map((wte) => ({
            id: wte.exercises.id,
            name: wte.exercises.name,
            category: wte.exercises.category as Exercise["category"],
            muscleGroup: wte.exercises.muscle_group as Exercise["muscleGroup"],
            sets: wte.exercises.sets,
            reps: wte.exercises.reps,
            restSeconds: wte.exercises.rest_seconds,
            formCues: wte.exercises.form_cues,
            why: wte.exercises.why,
            startingWeight: wte.exercises.starting_weight ?? undefined,
            weightUnit: wte.exercises.weight_unit as Exercise["weightUnit"],
          }));

        return {
          dayOfWeek: t.day_of_week,
          dayName: t.day_name,
          type: t.type as DayType,
          focus: t.focus ?? undefined,
          warmup: t.warmup ?? undefined,
          exercises,
          cardio,
        };
      });

      setTemplates(transformed);
      setIsLoaded(true);
    }

    fetchTemplates();
  }, [supabase]);

  const getTodaysWorkout = useCallback(() => {
    const today = new Date().getDay();
    return templates.find((w) => w.dayOfWeek === today) || templates[6];
  }, [templates]);

  const getWorkoutByDay = useCallback(
    (dayOfWeek: number) => {
      return templates.find((w) => w.dayOfWeek === dayOfWeek);
    },
    [templates]
  );

  return { templates, isLoaded, getTodaysWorkout, getWorkoutByDay };
}

// =============================================
// USER PROFILE HOOK
// =============================================

interface DBUserProfile {
  id: string;
  user_id: string;
  name: string;
  current_weight: number;
  target_weight: number;
  height: number;
  start_date: string;
  week_number: number;
  is_admin: boolean;
}

// Extended UserProfile with admin flag
export interface UserProfileWithAdmin extends UserProfile {
  isAdmin: boolean;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfileWithAdmin | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (authLoading) {
      return;
    }

    // If no user after auth loads, set loaded but don't set profile
    if (!user) {
      queueMicrotask(() => setIsLoaded(true));
      return;
    }

    async function fetchProfile() {
      try {
        // RLS automatically filters by user_id, so we don't need to specify it
        // Use limit(1) and handle as array to avoid 406 errors with single()
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .limit(1);

        if (error) {
          // If it's a 406 or other error, log it but continue with defaults
          console.error("Error fetching profile:", error);
          setIsLoaded(true);
          return;
        }

        if (data && data.length > 0) {
          const dbProfile = data[0] as DBUserProfile;
          setProfile({
            name: dbProfile.name,
            currentWeight: Number(dbProfile.current_weight),
            targetWeight: Number(dbProfile.target_weight),
            height: Number(dbProfile.height),
            startDate: dbProfile.start_date,
            weekNumber: dbProfile.week_number,
            isAdmin: dbProfile.is_admin ?? false,
          });
        } else {
          // If no profile exists, use default values
          setProfile({
            name: "User",
            currentWeight: 80,
            targetWeight: 75,
            height: 175,
            startDate: new Date().toISOString().split("T")[0],
            weekNumber: 1,
            isAdmin: false,
          });
        }

        setIsLoaded(true);
      } catch (err) {
        console.error("Unexpected error fetching profile:", err);
        setIsLoaded(true);
      }
    }

    fetchProfile();
  }, [user, authLoading, supabase]);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user) return;

      const dbUpdates: {
        name?: string;
        current_weight?: number;
        target_weight?: number;
        height?: number;
        start_date?: string;
        week_number?: number;
      } = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.currentWeight !== undefined)
        dbUpdates.current_weight = updates.currentWeight;
      if (updates.targetWeight !== undefined)
        dbUpdates.target_weight = updates.targetWeight;
      if (updates.height !== undefined) dbUpdates.height = updates.height;
      if (updates.startDate !== undefined)
        dbUpdates.start_date = updates.startDate;
      if (updates.weekNumber !== undefined)
        dbUpdates.week_number = updates.weekNumber;

      // RLS automatically filters by user_id, but we need to specify it for update
      const { error } = await supabase
        .from("user_profiles")
        .update(dbUpdates)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        return;
      }

      setProfile((prev) => {
        if (!prev) {
          // If profile doesn't exist yet, create it with updates
          return {
            name: "User",
            currentWeight: 80,
            targetWeight: 75,
            height: 175,
            startDate: new Date().toISOString().split("T")[0],
            weekNumber: 1,
            isAdmin: false,
            ...updates,
          };
        }
        return { ...prev, ...updates };
      });
    },
    [user, supabase]
  );

  return {
    profile,
    setProfile: updateProfile,
    isLoaded,
    isAdmin: profile?.isAdmin ?? false,
  };
}

// =============================================
// WORKOUT LOGS HOOK
// =============================================

interface DBWorkoutLog {
  id: string;
  user_id: string;
  date: string;
  day_of_week: number;
  type: string;
  exercises: ExerciseLog[];
  cardio: WorkoutLog["cardio"] | null;
  notes: string | null;
  completed: boolean;
  duration: number | null;
  rating: number | null;
}

export function useWorkoutLogs() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      queueMicrotask(() => setIsLoaded(true));
      return;
    }

    async function fetchLogs() {
      const { data, error } = await supabase
        .from("workout_logs")
        .select("*")
        .eq("user_id", user!.id)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching workout logs:", error);
        setIsLoaded(true);
        return;
      }

      const dbLogs = (data as DBWorkoutLog[]) || [];
      const transformed: WorkoutLog[] = dbLogs.map((log) => ({
        id: log.id,
        date: log.date,
        dayOfWeek: log.day_of_week,
        type: log.type as DayType,
        exercises: log.exercises as ExerciseLog[],
        cardio: log.cardio as WorkoutLog["cardio"],
        notes: log.notes ?? undefined,
        completed: log.completed,
        duration: log.duration ?? undefined,
        rating: log.rating ?? undefined,
      }));

      setLogs(transformed);
      setIsLoaded(true);
    }

    fetchLogs();
  }, [user, supabase]);

  const addLog = useCallback(
    async (log: WorkoutLog) => {
      if (!user) return;

      const { error } = await supabase.from("workout_logs").insert({
        id: log.id,
        user_id: user.id,
        date: log.date,
        day_of_week: log.dayOfWeek,
        type: log.type,
        exercises: log.exercises,
        cardio: log.cardio ?? null,
        notes: log.notes ?? null,
        completed: log.completed,
        duration: log.duration ?? null,
        rating: log.rating ?? null,
      });

      if (error) {
        console.error("Error adding workout log:", error);
        return;
      }

      setLogs((prev) => [log, ...prev]);
    },
    [user, supabase]
  );

  const updateLog = useCallback(
    async (id: string, updates: Partial<WorkoutLog>) => {
      if (!user) return;

      const dbUpdates: {
        exercises?: ExerciseLog[];
        cardio?: WorkoutLog["cardio"] | null;
        notes?: string | null;
        completed?: boolean;
        duration?: number | null;
        rating?: number | null;
      } = {};
      if (updates.exercises !== undefined)
        dbUpdates.exercises = updates.exercises;
      if (updates.cardio !== undefined) dbUpdates.cardio = updates.cardio;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes ?? null;
      if (updates.completed !== undefined)
        dbUpdates.completed = updates.completed;
      if (updates.duration !== undefined)
        dbUpdates.duration = updates.duration ?? null;
      if (updates.rating !== undefined)
        dbUpdates.rating = updates.rating ?? null;

      const { error } = await supabase
        .from("workout_logs")
        .update(dbUpdates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating workout log:", error);
        return;
      }

      setLogs((prev) =>
        prev.map((log) => (log.id === id ? { ...log, ...updates } : log))
      );
    },
    [user, supabase]
  );

  const getTodayLog = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    return logs.find((log) => log.date === today);
  }, [logs]);

  const getLogsByDateRange = useCallback(
    (startDate: string, endDate: string) => {
      return logs.filter((log) => log.date >= startDate && log.date <= endDate);
    },
    [logs]
  );

  const getLogByDate = useCallback(
    (date: string) => {
      return logs.find((log) => log.date === date);
    },
    [logs]
  );

  const deleteLog = useCallback(
    async (id: string) => {
      if (!user) return;

      const { error } = await supabase
        .from("workout_logs")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting workout log:", error);
        return;
      }

      setLogs((prev) => prev.filter((log) => log.id !== id));
    },
    [user, supabase]
  );

  return {
    logs,
    setLogs,
    addLog,
    updateLog,
    deleteLog,
    getTodayLog,
    getLogByDate,
    getLogsByDateRange,
    isLoaded,
  };
}

// =============================================
// WEIGHT HISTORY HOOK
// =============================================

interface DBWeightEntry {
  id: string;
  user_id: string;
  date: string;
  weight: number;
}

export function useWeightHistory() {
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      queueMicrotask(() => setIsLoaded(true));
      return;
    }

    async function fetchWeights() {
      const { data, error } = await supabase
        .from("weight_entries")
        .select("*")
        .eq("user_id", user!.id)
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching weight entries:", error);
        setIsLoaded(true);
        return;
      }

      const dbWeights = (data as DBWeightEntry[]) || [];
      const transformed: WeightEntry[] = dbWeights.map((w) => ({
        date: w.date,
        weight: Number(w.weight),
      }));

      setWeights(transformed);
      setIsLoaded(true);
    }

    fetchWeights();
  }, [user, supabase]);

  const addWeight = useCallback(
    async (entry: WeightEntry) => {
      if (!user) return;

      // Upsert: insert or update if date exists
      const { error } = await supabase.from("weight_entries").upsert(
        {
          user_id: user.id,
          date: entry.date,
          weight: entry.weight,
        },
        {
          onConflict: "user_id,date",
        }
      );

      if (error) {
        console.error("Error adding weight entry:", error);
        return;
      }

      setWeights((prev) => {
        const filtered = prev.filter((w) => w.date !== entry.date);
        return [...filtered, entry].sort((a, b) =>
          a.date.localeCompare(b.date)
        );
      });
    },
    [user, supabase]
  );

  const getLatestWeight = useCallback(() => {
    if (weights.length === 0) return null;
    return weights[weights.length - 1];
  }, [weights]);

  return { weights, addWeight, getLatestWeight, isLoaded };
}

// =============================================
// USER MEAL PREFERENCES HOOK
// =============================================

interface DBUserMealPreference {
  id: string;
  user_id: string;
  slot: string;
  foods: MealFood[];
}

export function useUserMeals() {
  const [customMeals, setCustomMeals] = useState<Record<MealSlot, MealFood[]>>({
    breakfast: [],
    snack1: [],
    lunch: [],
    snack2: [],
    dinner: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      queueMicrotask(() => setIsLoaded(true));
      return;
    }

    async function fetchPreferences() {
      const { data, error } = await supabase
        .from("user_meal_preferences")
        .select("*")
        .eq("user_id", user!.id);

      if (error) {
        console.error("Error fetching meal preferences:", error);
        setIsLoaded(true);
        return;
      }

      const prefs: Record<MealSlot, MealFood[]> = {
        breakfast: [],
        snack1: [],
        lunch: [],
        snack2: [],
        dinner: [],
      };

      const dbPrefs = (data as DBUserMealPreference[]) || [];
      dbPrefs.forEach((p) => {
        prefs[p.slot as MealSlot] = p.foods as MealFood[];
      });

      setCustomMeals(prefs);
      setIsLoaded(true);
    }

    fetchPreferences();
  }, [user, supabase]);

  const updateMealFoods = useCallback(
    async (slot: MealSlot, foods: MealFood[]) => {
      if (!user) return;

      const { error } = await supabase.from("user_meal_preferences").upsert(
        {
          user_id: user.id,
          slot,
          foods,
        },
        {
          onConflict: "user_id,slot",
        }
      );

      if (error) {
        console.error("Error updating meal preferences:", error);
        return;
      }

      setCustomMeals((prev) => ({
        ...prev,
        [slot]: foods,
      }));
    },
    [user, supabase]
  );

  const addFoodToMeal = useCallback(
    async (slot: MealSlot, food: MealFood) => {
      const newFoods = [...customMeals[slot], food];
      await updateMealFoods(slot, newFoods);
    },
    [customMeals, updateMealFoods]
  );

  const removeFoodFromMeal = useCallback(
    async (slot: MealSlot, foodId: string) => {
      const newFoods = customMeals[slot].filter((f) => f.id !== foodId);
      await updateMealFoods(slot, newFoods);
    },
    [customMeals, updateMealFoods]
  );

  const resetMeal = useCallback(
    async (slot: MealSlot) => {
      await updateMealFoods(slot, []);
    },
    [updateMealFoods]
  );

  const resetAllMeals = useCallback(async () => {
    if (!user) return;

    const { error } = await supabase
      .from("user_meal_preferences")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Error resetting meal preferences:", error);
      return;
    }

    setCustomMeals({
      breakfast: [],
      snack1: [],
      lunch: [],
      snack2: [],
      dinner: [],
    });
  }, [user, supabase]);

  return {
    customMeals,
    updateMealFoods,
    addFoodToMeal,
    removeFoodFromMeal,
    resetMeal,
    resetAllMeals,
    isLoaded,
  };
}

// =============================================
// USER WORKOUT CUSTOMIZATIONS HOOK
// =============================================

export interface SwappedExercise {
  originalId: string;
  replacementId: string;
}

export interface WorkoutCustomization {
  dayOfWeek: number;
  weekStart: string;
  swappedExercises: SwappedExercise[];
  addedExercises: string[];
  cardioCustomization?: CardioType;
}

interface DBWorkoutCustomization {
  id: string;
  user_id: string;
  day_of_week: number;
  week_start: string;
  swapped_exercises: SwappedExercise[];
  added_exercises: string[];
  cardio_customization?: string;
}

// Helper to get the start of a week (Sunday) for a given date
export function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d.toISOString().split("T")[0];
}

export function useUserWorkoutCustomizations(selectedWeekStart?: string) {
  const [customizations, setCustomizations] = useState<
    Record<number, WorkoutCustomization>
  >({});
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  // Default to current week if not specified
  const weekStart = selectedWeekStart || getWeekStart(new Date());

  useEffect(() => {
    if (!user) {
      queueMicrotask(() => setIsLoaded(true));
      return;
    }

    async function fetchCustomizations() {
      const { data, error } = await supabase
        .from("user_workout_customizations")
        .select("*")
        .eq("user_id", user!.id)
        .eq("week_start", weekStart);

      if (error) {
        console.error("Error fetching workout customizations:", error);
        setIsLoaded(true);
        return;
      }

      const dbCustomizations = (data as DBWorkoutCustomization[]) || [];
      const transformed: Record<number, WorkoutCustomization> = {};

      dbCustomizations.forEach((c) => {
        transformed[c.day_of_week] = {
          dayOfWeek: c.day_of_week,
          weekStart: c.week_start,
          swappedExercises: c.swapped_exercises || [],
          addedExercises: c.added_exercises || [],
          cardioCustomization: c.cardio_customization as CardioType | undefined,
        };
      });

      setCustomizations(transformed);
      setIsLoaded(true);
    }

    fetchCustomizations();
  }, [user, supabase, weekStart]);

  const swapExercise = useCallback(
    async (dayOfWeek: number, originalId: string, replacementId: string) => {
      if (!user) return;

      const existing = customizations[dayOfWeek];
      const currentSwaps = existing?.swappedExercises || [];

      // Remove any existing swap for this original exercise, then add new one
      const filteredSwaps = currentSwaps.filter(
        (s) => s.originalId !== originalId
      );
      const newSwaps = [...filteredSwaps, { originalId, replacementId }];

      const { error } = await supabase
        .from("user_workout_customizations")
        .upsert(
          {
            user_id: user.id,
            day_of_week: dayOfWeek,
            week_start: weekStart,
            swapped_exercises: newSwaps,
            added_exercises: existing?.addedExercises || [],
            cardio_customization: existing?.cardioCustomization || null,
          },
          {
            onConflict: "user_id,day_of_week,week_start",
          }
        );

      if (error) {
        console.error("Error swapping exercise:", error);
        return;
      }

      setCustomizations((prev) => ({
        ...prev,
        [dayOfWeek]: {
          dayOfWeek,
          weekStart,
          swappedExercises: newSwaps,
          addedExercises: existing?.addedExercises || [],
          cardioCustomization: existing?.cardioCustomization,
        },
      }));
    },
    [user, supabase, weekStart, customizations]
  );

  const addExercise = useCallback(
    async (dayOfWeek: number, exerciseId: string) => {
      if (!user) return;

      const existing = customizations[dayOfWeek];
      const currentAdded = existing?.addedExercises || [];

      // Don't add duplicates
      if (currentAdded.includes(exerciseId)) return;

      const newAdded = [...currentAdded, exerciseId];

      const { error } = await supabase
        .from("user_workout_customizations")
        .upsert(
          {
            user_id: user.id,
            day_of_week: dayOfWeek,
            week_start: weekStart,
            swapped_exercises: existing?.swappedExercises || [],
            added_exercises: newAdded,
            cardio_customization: existing?.cardioCustomization || null,
          },
          {
            onConflict: "user_id,day_of_week,week_start",
          }
        );

      if (error) {
        console.error("Error adding exercise:", error);
        return;
      }

      setCustomizations((prev) => ({
        ...prev,
        [dayOfWeek]: {
          dayOfWeek,
          weekStart,
          swappedExercises: existing?.swappedExercises || [],
          addedExercises: newAdded,
          cardioCustomization: existing?.cardioCustomization,
        },
      }));
    },
    [user, supabase, weekStart, customizations]
  );

  const removeAddedExercise = useCallback(
    async (dayOfWeek: number, exerciseId: string) => {
      if (!user) return;

      const existing = customizations[dayOfWeek];
      if (!existing) return;

      const newAdded = existing.addedExercises.filter(
        (id) => id !== exerciseId
      );

      const { error } = await supabase
        .from("user_workout_customizations")
        .upsert(
          {
            user_id: user.id,
            day_of_week: dayOfWeek,
            week_start: weekStart,
            swapped_exercises: existing.swappedExercises,
            added_exercises: newAdded,
            cardio_customization: existing.cardioCustomization || null,
          },
          {
            onConflict: "user_id,day_of_week,week_start",
          }
        );

      if (error) {
        console.error("Error removing added exercise:", error);
        return;
      }

      setCustomizations((prev) => ({
        ...prev,
        [dayOfWeek]: {
          ...existing,
          addedExercises: newAdded,
        },
      }));
    },
    [user, supabase, weekStart, customizations]
  );

  const setCardioCustomization = useCallback(
    async (dayOfWeek: number, cardioType: CardioType) => {
      if (!user) return;

      const existing = customizations[dayOfWeek];

      const { error } = await supabase
        .from("user_workout_customizations")
        .upsert(
          {
            user_id: user.id,
            day_of_week: dayOfWeek,
            week_start: weekStart,
            swapped_exercises: existing?.swappedExercises || [],
            added_exercises: existing?.addedExercises || [],
            cardio_customization: cardioType,
          },
          {
            onConflict: "user_id,day_of_week,week_start",
          }
        );

      if (error) {
        console.error("Error setting cardio customization:", error);
        return;
      }

      setCustomizations((prev) => ({
        ...prev,
        [dayOfWeek]: {
          dayOfWeek,
          weekStart,
          swappedExercises: existing?.swappedExercises || [],
          addedExercises: existing?.addedExercises || [],
          cardioCustomization: cardioType,
        },
      }));
    },
    [user, supabase, weekStart, customizations]
  );

  const resetDayCustomizations = useCallback(
    async (dayOfWeek: number) => {
      if (!user) return;

      const { error } = await supabase
        .from("user_workout_customizations")
        .delete()
        .eq("user_id", user.id)
        .eq("day_of_week", dayOfWeek)
        .eq("week_start", weekStart);

      if (error) {
        console.error("Error resetting day customizations:", error);
        return;
      }

      setCustomizations((prev) => {
        const newCustomizations = { ...prev };
        delete newCustomizations[dayOfWeek];
        return newCustomizations;
      });
    },
    [user, supabase, weekStart]
  );

  const getCustomizedWorkout = useCallback(
    (template: WorkoutTemplate, allExercises: Exercise[]): WorkoutTemplate => {
      const customization = customizations[template.dayOfWeek];
      if (!customization) return template;

      // Apply swaps
      let exercises = template.exercises.map((ex) => {
        const swap = customization.swappedExercises.find(
          (s) => s.originalId === ex.id
        );
        if (swap) {
          const replacement = allExercises.find(
            (e) => e.id === swap.replacementId
          );
          if (replacement) {
            return { ...replacement, _swappedFrom: ex.id };
          }
        }
        return ex;
      });

      // Apply additions
      const addedExercises = customization.addedExercises
        .map((id) => allExercises.find((e) => e.id === id))
        .filter((e): e is Exercise => e !== undefined)
        .map((e) => ({ ...e, _isAdded: true }));

      exercises = [...exercises, ...addedExercises];

      // Apply cardio customization if present
      let cardio = template.cardio;
      if (customization.cardioCustomization && template.cardio) {
        cardio = getDefaultCardioTemplate(customization.cardioCustomization);
      }

      return { ...template, exercises, cardio };
    },
    [customizations]
  );

  const getDayCustomization = useCallback(
    (dayOfWeek: number): WorkoutCustomization | undefined => {
      return customizations[dayOfWeek];
    },
    [customizations]
  );

  const hasCustomizations = useCallback(
    (dayOfWeek: number): boolean => {
      const c = customizations[dayOfWeek];
      return !!(
        c &&
        (c.swappedExercises.length > 0 ||
          c.addedExercises.length > 0 ||
          c.cardioCustomization !== undefined)
      );
    },
    [customizations]
  );

  return {
    customizations,
    swapExercise,
    addExercise,
    removeAddedExercise,
    setCardioCustomization,
    resetDayCustomizations,
    getCustomizedWorkout,
    getDayCustomization,
    hasCustomizations,
    weekStart,
    isLoaded,
  };
}

// =============================================
// MEAL OPTIONS HOOK (Admin editable meal presets)
// =============================================

export interface MealOption {
  id: string;
  slot: "breakfast" | "snack";
  name: string;
  foods: MealFood[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DBMealOption {
  id: string;
  slot: string;
  name: string;
  foods: Food[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useMealOptions() {
  const [mealOptions, setMealOptions] = useState<MealOption[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchMealOptions = useCallback(async () => {
    const { data, error } = await supabase
      .from("meal_options")
      .select("*")
      .order("name");

    if (error) {
      // Table might not exist yet
      if (!error.message.includes("does not exist")) {
        console.error("Error fetching meal options:", error);
      }
      setIsLoaded(true);
      return;
    }

    const dbOptions = (data as DBMealOption[]) || [];
    const transformed: MealOption[] = dbOptions.map((opt) => ({
      id: opt.id,
      slot: opt.slot as MealOption["slot"],
      name: opt.name,
      foods: opt.foods as MealFood[],
      createdBy: opt.created_by ?? undefined,
      createdAt: opt.created_at,
      updatedAt: opt.updated_at,
    }));

    setMealOptions(transformed);
    setIsLoaded(true);
  }, [supabase]);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      await fetchMealOptions();
      if (ignore) return;
    };

    load();

    return () => {
      ignore = true;
    };
  }, [fetchMealOptions]);

  // Get options for a specific slot
  const getOptionsForSlot = useCallback(
    (slot: MealSlot): MealOption[] => {
      if (slot === "breakfast") {
        return mealOptions.filter((opt) => opt.slot === "breakfast");
      }
      // snack1 and snack2 both use "snack" options
      if (slot === "snack1" || slot === "snack2") {
        return mealOptions.filter((opt) => opt.slot === "snack");
      }
      return [];
    },
    [mealOptions]
  );

  // Add a new meal option
  const addMealOption = useCallback(
    async (
      slot: "breakfast" | "snack",
      name: string,
      foods: MealFood[]
    ): Promise<MealOption | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("meal_options")
        .insert({
          slot,
          name,
          foods,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding meal option:", error);
        return null;
      }

      const newOption: MealOption = {
        id: data.id,
        slot: data.slot as MealOption["slot"],
        name: data.name,
        foods: data.foods as MealFood[],
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setMealOptions((prev) => [...prev, newOption]);
      return newOption;
    },
    [user, supabase]
  );

  // Update an existing meal option
  const updateMealOption = useCallback(
    async (id: string, name: string, foods: MealFood[]): Promise<boolean> => {
      if (!user) return false;

      const { error } = await supabase
        .from("meal_options")
        .update({
          name,
          foods,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Error updating meal option:", error);
        return false;
      }

      setMealOptions((prev) =>
        prev.map((opt) =>
          opt.id === id
            ? { ...opt, name, foods, updatedAt: new Date().toISOString() }
            : opt
        )
      );
      return true;
    },
    [user, supabase]
  );

  // Delete a meal option
  const deleteMealOption = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;

      const { error } = await supabase
        .from("meal_options")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting meal option:", error);
        return false;
      }

      setMealOptions((prev) => prev.filter((opt) => opt.id !== id));
      return true;
    },
    [user, supabase]
  );

  return {
    mealOptions,
    isLoaded,
    getOptionsForSlot,
    addMealOption,
    updateMealOption,
    deleteMealOption,
    refetch: fetchMealOptions,
  };
}

// =============================================
// DAILY TARGETS (Constants) - Updated for 1,900-2,000 cal / 200g+ protein plan (600g meat daily)
// =============================================

export const DAILY_TARGETS = {
  calories: 1950,
  protein: 200,
};
