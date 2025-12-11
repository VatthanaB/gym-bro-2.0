"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type {
  Exercise,
  ExerciseLog,
  SetLog,
  WorkoutLog,
  WeightEntry,
  UserProfile,
  Food,
  Meal,
  MealSlot,
  DayType,
  CardioTemplate,
  WorkoutTemplate,
} from "@/lib/types";

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
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: string;
  category: string;
  food_bank_category: string;
}

export function useFoods() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [foodBank, setFoodBank] = useState<Record<string, Food[]>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchFoods() {
      const { data, error } = await supabase.from("foods").select("*");

      if (error) {
        console.error("Error fetching foods:", error);
        setIsLoaded(true);
        return;
      }

      const dbFoods = (data as DBFood[]) || [];
      const transformed: Food[] = dbFoods.map((f) => ({
        id: f.id,
        name: f.name,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        portion: f.portion,
        category: f.category as Food["category"],
      }));

      setFoods(transformed);

      // Group by food_bank_category
      const grouped: Record<string, Food[]> = {};
      dbFoods.forEach((f) => {
        if (!grouped[f.food_bank_category]) {
          grouped[f.food_bank_category] = [];
        }
        grouped[f.food_bank_category].push({
          id: f.id,
          name: f.name,
          calories: f.calories,
          protein: f.protein,
          carbs: f.carbs,
          fat: f.fat,
          portion: f.portion,
          category: f.category as Food["category"],
        });
      });

      setFoodBank(grouped);
      setIsLoaded(true);
    }

    fetchFoods();
  }, [supabase]);

  return { foods, foodBank, isLoaded };
}

interface DBMeal {
  id: string;
  slot: string;
  label: string;
  target_calories: number;
  target_protein: number;
  notes: string | null;
  meal_foods: Array<{
    food_id: string;
    foods: DBFood;
  }>;
}

export function useMeals() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchMeals() {
      // Fetch meals with their foods
      const { data: mealsData, error: mealsError } = await supabase
        .from("meals")
        .select(
          `
          *,
          meal_foods (
            food_id,
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
        foods: (m.meal_foods || []).map((mf) => ({
          id: mf.foods.id,
          name: mf.foods.name,
          calories: mf.foods.calories,
          protein: mf.foods.protein,
          carbs: mf.foods.carbs,
          fat: mf.foods.fat,
          portion: mf.foods.portion,
          category: mf.foods.category as Food["category"],
        })),
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
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "User",
    currentWeight: 80,
    targetWeight: 75,
    height: 175,
    startDate: new Date().toISOString().split("T")[0],
    weekNumber: 1,
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      queueMicrotask(() => setIsLoaded(true));
      return;
    }

    async function fetchProfile() {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
        setIsLoaded(true);
        return;
      }

      if (data) {
        const dbProfile = data as DBUserProfile;
        setProfile({
          name: dbProfile.name,
          currentWeight: Number(dbProfile.current_weight),
          targetWeight: Number(dbProfile.target_weight),
          height: Number(dbProfile.height),
          startDate: dbProfile.start_date,
          weekNumber: dbProfile.week_number,
        });
      }

      setIsLoaded(true);
    }

    fetchProfile();
  }, [user, supabase]);

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

      const { error } = await supabase
        .from("user_profiles")
        .update(dbUpdates)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        return;
      }

      setProfile((prev) => ({ ...prev, ...updates }));
    },
    [user, supabase]
  );

  return { profile, setProfile: updateProfile, isLoaded };
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

  return {
    logs,
    setLogs,
    addLog,
    updateLog,
    getTodayLog,
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
  foods: Food[];
}

export function useUserMeals() {
  const [customMeals, setCustomMeals] = useState<Record<MealSlot, Food[]>>({
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

      const prefs: Record<MealSlot, Food[]> = {
        breakfast: [],
        snack1: [],
        lunch: [],
        snack2: [],
        dinner: [],
      };

      const dbPrefs = (data as DBUserMealPreference[]) || [];
      dbPrefs.forEach((p) => {
        prefs[p.slot as MealSlot] = p.foods as Food[];
      });

      setCustomMeals(prefs);
      setIsLoaded(true);
    }

    fetchPreferences();
  }, [user, supabase]);

  const updateMealFoods = useCallback(
    async (slot: MealSlot, foods: Food[]) => {
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
    async (slot: MealSlot, food: Food) => {
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
// DAILY TARGETS (Constants) - Updated for 1,900-2,000 cal / 200g+ protein plan (600g meat daily)
// =============================================

export const DAILY_TARGETS = {
  calories: 1950,
  protein: 200,
};
