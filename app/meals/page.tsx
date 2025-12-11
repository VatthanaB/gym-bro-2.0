"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Flame, Beef, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MealCard } from "@/components/meal-card";
import { FoodSwapSheet } from "@/components/food-swap-sheet";
import {
  useMeals,
  useUserMeals,
  useFoods,
  DAILY_TARGETS,
} from "@/lib/hooks/use-supabase";
import { breakfastOptions, snackOptions } from "@/lib/data/meals";
import type { MealSlot, Food } from "@/lib/types";

const MEAL_ORDER: MealSlot[] = [
  "breakfast",
  "snack1",
  "lunch",
  "snack2",
  "dinner",
];

export default function MealsPage() {
  const { meals: defaultMeals, isLoaded: mealsLoaded } = useMeals();
  const { foodBank, isLoaded: foodsLoaded } = useFoods();
  const {
    customMeals,
    updateMealFoods,
    resetMeal,
    resetAllMeals,
    isLoaded: prefsLoaded,
  } = useUserMeals();

  const [swapSheetOpen, setSwapSheetOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<MealSlot | null>(null);
  const [tempFoods, setTempFoods] = useState<Food[]>([]);

  const isLoaded = mealsLoaded && foodsLoaded && prefsLoaded;

  // Calculate daily totals based on custom or default meals
  const calculateTotals = () => {
    let totalCalories = 0;
    let totalProtein = 0;

    defaultMeals.forEach((meal) => {
      const foods =
        customMeals[meal.slot].length > 0 ? customMeals[meal.slot] : meal.foods;
      totalCalories += foods.reduce((sum, f) => sum + f.calories, 0);
      totalProtein += foods.reduce((sum, f) => sum + f.protein, 0);
    });

    return { totalCalories, totalProtein };
  };

  const { totalCalories, totalProtein } = calculateTotals();
  const caloriePercent = Math.round(
    (totalCalories / DAILY_TARGETS.calories) * 100
  );
  const proteinPercent = Math.round(
    (totalProtein / DAILY_TARGETS.protein) * 100
  );

  const handleOpenSwapSheet = (slot: MealSlot) => {
    const currentFoods =
      customMeals[slot].length > 0
        ? customMeals[slot]
        : defaultMeals.find((m) => m.slot === slot)?.foods || [];
    setTempFoods([...currentFoods]);
    setActiveSlot(slot);
    setSwapSheetOpen(true);
  };

  const handleSwapFood = (oldFoodId: string, newFood: Food) => {
    setTempFoods((prev) => prev.map((f) => (f.id === oldFoodId ? newFood : f)));
    // Also immediately save the change
    if (activeSlot) {
      const updatedFoods = tempFoods.map((f) =>
        f.id === oldFoodId ? newFood : f
      );
      updateMealFoods(activeSlot, updatedFoods);
      setTempFoods(updatedFoods);
    }
  };

  // Handle selecting a complete meal option (for breakfast/snacks)
  const handleSelectMealOption = (foods: Food[]) => {
    if (activeSlot) {
      updateMealFoods(activeSlot, foods);
      setTempFoods(foods);
    }
  };

  // Get meal options for the current slot (breakfast/snacks only)
  const getMealOptionsForSlot = (slot: MealSlot | null) => {
    if (!slot) return undefined;
    if (slot === "breakfast") return breakfastOptions;
    if (slot === "snack1" || slot === "snack2") return snackOptions;
    return undefined;
  };

  const handleCloseSwapSheet = () => {
    setSwapSheetOpen(false);
    setActiveSlot(null);
    setTempFoods([]);
  };

  const hasAnyCustomizations = Object.values(customMeals).some(
    (foods) => foods.length > 0
  );

  // Get swap options based on food bank categories (updated for 1,900-2,000 cal / 200g+ protein plan)
  const getSwapOptionsForSlot = (slot: MealSlot): Record<string, Food[]> => {
    switch (slot) {
      case "breakfast":
        return {
          Proteins: foodBank.breakfastProteins || [],
          Carbs: foodBank.breakfastCarbs || [],
        };
      case "snack1":
      case "snack2":
        return {
          "Protein Options": foodBank.snackProteins || [],
          "Add Fats": foodBank.fats || [],
        };
      case "lunch":
        return {
          "Proteins (400g raw)": foodBank.lunchProteins || [],
          "Carbs (80g for lean, 60g for salmon/beef)":
            foodBank.lunchCarbs || [],
          "Vegetables (200g raw)": foodBank.lunchVegetables || [],
          "Oil (10ml)": foodBank.fats || [],
        };
      case "dinner":
        return {
          "Proteins (200g raw)": foodBank.dinnerProteins || [],
          "Vegetables (300g raw)": foodBank.dinnerVegetables || [],
          "Oil (10ml)": foodBank.fats || [],
        };
      default:
        return {};
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Meal Plan
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Daily nutrition for fat loss
            </p>
          </div>
          {hasAnyCustomizations && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground"
              onClick={resetAllMeals}
            >
              <RotateCcw className="h-4 w-4" />
              Reset All
            </Button>
          )}
        </div>
      </header>

      {/* Daily Summary Card */}
      <Card className="mb-6 overflow-hidden">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Calories */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Flame className="h-5 w-5 text-warning" />
                <span className="text-sm font-medium text-muted-foreground">
                  Daily Calories
                </span>
              </div>
              <div className="mb-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">
                  {totalCalories}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {DAILY_TARGETS.calories}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${
                    caloriePercent > 105
                      ? "bg-destructive"
                      : caloriePercent >= 90
                      ? "bg-success"
                      : "bg-warning"
                  }`}
                  style={{ width: `${Math.min(caloriePercent, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {caloriePercent}% of target
              </p>
            </div>

            {/* Protein */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Beef className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Daily Protein
                </span>
              </div>
              <div className="mb-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">
                  {totalProtein}g
                </span>
                <span className="text-sm text-muted-foreground">
                  / {DAILY_TARGETS.protein}g
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${
                    proteinPercent >= 100 ? "bg-success" : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(proteinPercent, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {proteinPercent}% of target
              </p>
            </div>
          </div>

          {/* Key rule reminder */}
          <div className="mt-4 rounded-lg bg-muted/50 px-3 py-2 text-center text-xs text-muted-foreground">
            <span className="font-medium">Remember:</span> Carbs at breakfast &
            lunch only. No carbs at dinner.
          </div>
        </CardContent>
      </Card>

      {/* Meals List */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Today&apos;s Meals
        </h2>
        <div className="space-y-3">
          {[...defaultMeals]
            .sort(
              (a, b) => MEAL_ORDER.indexOf(a.slot) - MEAL_ORDER.indexOf(b.slot)
            )
            .map((meal) => (
              <MealCard
                key={meal.slot}
                meal={meal}
                customFoods={customMeals[meal.slot]}
                onSwapFood={handleOpenSwapSheet}
                onReset={resetMeal}
              />
            ))}
        </div>
      </section>

      {/* Food Swap Sheet */}
      <FoodSwapSheet
        isOpen={swapSheetOpen}
        onClose={handleCloseSwapSheet}
        slot={activeSlot}
        currentFoods={tempFoods}
        onSwapFood={handleSwapFood}
        onSelectMealOption={handleSelectMealOption}
        onConfirm={handleCloseSwapSheet}
        getSwapOptions={
          activeSlot ? () => getSwapOptionsForSlot(activeSlot) : undefined
        }
        mealOptions={getMealOptionsForSlot(activeSlot)}
      />
    </div>
  );
}
