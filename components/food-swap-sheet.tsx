"use client";

import { useState } from "react";
import { ArrowRight, ChevronLeft, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { Food, MealSlot, Meal } from "@/lib/types";
import type { MealOption } from "@/lib/data/meals";

interface FoodSwapSheetProps {
  isOpen: boolean;
  onClose: () => void;
  slot: MealSlot | null;
  currentFoods: Food[];
  onSwapFood: (oldFoodId: string, newFood: Food) => void;
  onSelectMealOption?: (foods: Food[]) => void;
  onConfirm: () => void;
  getSwapOptions?: () => Record<string, Food[]>;
  mealOptions?: MealOption[];
  meal?: Meal;
}

export function FoodSwapSheet({
  isOpen,
  onClose,
  slot,
  currentFoods,
  onSwapFood,
  onSelectMealOption,
  onConfirm,
  getSwapOptions,
  mealOptions,
  meal,
}: FoodSwapSheetProps) {
  const [selectedFoodToSwap, setSelectedFoodToSwap] = useState<Food | null>(
    null
  );

  if (!slot) return null;

  const swapOptions = getSwapOptions?.() || {};

  // Determine if this is a simple swap slot (breakfast/snacks)
  const isSimpleSwapSlot = slot === "breakfast" || slot === "snack1" || slot === "snack2";
  const hasMealOptions = isSimpleSwapSlot && mealOptions && mealOptions.length > 0;

  // Calculate current totals
  const totalCalories = currentFoods.reduce((sum, f) => sum + f.calories, 0);
  const totalProtein = currentFoods.reduce((sum, f) => sum + f.protein, 0);

  const handleClose = () => {
    setSelectedFoodToSwap(null);
    onClose();
  };

  const handleSelectReplacement = (newFood: Food) => {
    if (selectedFoodToSwap) {
      onSwapFood(selectedFoodToSwap.id, newFood);
      setSelectedFoodToSwap(null);
    }
  };

  const handleSelectMealOption = (option: MealOption) => {
    if (onSelectMealOption) {
      onSelectMealOption(option.foods);
      handleClose();
    }
  };

  const handleBack = () => {
    setSelectedFoodToSwap(null);
  };

  // Get swap options based on the food category being swapped
  const getRelevantSwapOptions = () => {
    if (!selectedFoodToSwap) return {};

    // Filter options to same category type
    const category = selectedFoodToSwap.category;
    const relevantOptions: Record<string, Food[]> = {};

    Object.entries(swapOptions).forEach(([categoryName, foods]) => {
      const filtered = foods.filter(
        (f) =>
          f.category === category ||
          (category === "dairy" && f.category === "protein") ||
          (category === "protein" && f.category === "dairy")
      );
      if (filtered.length > 0) {
        relevantOptions[categoryName] = filtered;
      }
    });

    return relevantOptions;
  };

  // Get meal label based on slot
  const getMealLabel = (s: MealSlot) => {
    const labels: Record<MealSlot, string> = {
      breakfast: "Breakfast",
      snack1: "Morning Snack",
      lunch: "Lunch",
      snack2: "Afternoon Snack",
      dinner: "Dinner",
    };
    return labels[s];
  };

  // Check if current foods match a meal option
  const isCurrentOption = (option: MealOption) => {
    if (option.foods.length !== currentFoods.length) return false;
    const currentIds = currentFoods.map(f => f.id).sort();
    const optionIds = option.foods.map(f => f.id).sort();
    return currentIds.every((id, i) => id === optionIds[i]);
  };

  const targetCalories = meal?.targetCalories || 500;
  const targetProtein = meal?.targetProtein || 30;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent
        side="bottom"
        className="h-[85vh] overflow-hidden rounded-t-3xl"
      >
        <SheetHeader className="text-left">
          {hasMealOptions ? (
            // Simple swap mode for breakfast/snacks
            <>
              <SheetTitle>Change {getMealLabel(slot)}</SheetTitle>
              <SheetDescription>
                Pick one option to replace your current selection
              </SheetDescription>
            </>
          ) : selectedFoodToSwap ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBack}
                  className="rounded-full p-1 hover:bg-muted"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <SheetTitle>Replace {selectedFoodToSwap.name}</SheetTitle>
              </div>
              <SheetDescription>
                Choose a replacement ({selectedFoodToSwap.calories} kcal /{" "}
                {selectedFoodToSwap.protein}g protein)
              </SheetDescription>
            </>
          ) : (
            <>
              <SheetTitle>Swap Foods - {getMealLabel(slot)}</SheetTitle>
              <SheetDescription>
                Tap a food to swap it for something else
              </SheetDescription>
            </>
          )}
        </SheetHeader>

        {/* Current selection summary */}
        <div className="my-4 rounded-xl bg-muted p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Current totals
            </span>
            <div className="flex gap-3 text-sm">
              <span
                className={
                  totalCalories > targetCalories
                    ? "text-destructive font-medium"
                    : "text-muted-foreground"
                }
              >
                {totalCalories} kcal
              </span>
              <span
                className={
                  totalProtein >= targetProtein
                    ? "text-success font-medium"
                    : "text-warning font-medium"
                }
              >
                {totalProtein}g protein
              </span>
            </div>
          </div>
        </div>

        {hasMealOptions ? (
          // Simple swap mode: show complete meal options
          <div className="h-[calc(100%-220px)] overflow-y-auto pb-4">
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              Choose an option
            </h4>
            <div className="space-y-2">
              {mealOptions.map((option) => {
                const optionCalories = option.foods.reduce((sum, f) => sum + f.calories, 0);
                const optionProtein = option.foods.reduce((sum, f) => sum + f.protein, 0);
                const isCurrent = isCurrentOption(option);

                return (
                  <button
                    key={option.id}
                    onClick={() => !isCurrent && handleSelectMealOption(option)}
                    disabled={isCurrent}
                    className={`flex w-full items-center justify-between rounded-xl p-4 text-left transition-all ${
                      isCurrent
                        ? "border-2 border-primary bg-primary/5"
                        : "border border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {option.name}
                        </span>
                        {isCurrent && (
                          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            <Check className="h-3 w-3" />
                            CURRENT
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {option.foods.map(f => f.name).join(" + ")}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-foreground">{optionCalories} kcal</p>
                      <p className="text-primary font-medium">
                        {optionProtein}g protein
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : !selectedFoodToSwap ? (
          // Step 1: Show current foods to pick one to swap (for lunch/dinner)
          <div className="h-[calc(100%-220px)] overflow-y-auto pb-4">
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              Select food to swap
            </h4>
            <div className="space-y-2">
              {currentFoods.map((food) => (
                <button
                  key={food.id}
                  onClick={() => setSelectedFoodToSwap(food)}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30"
                >
                  <div className="flex-1">
                    <span className="font-medium text-foreground">
                      {food.name}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {food.portion}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <p className="text-foreground">{food.calories} kcal</p>
                      <p className="text-primary font-medium">
                        {food.protein}g
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Step 2: Show replacement options (for lunch/dinner)
          <div className="h-[calc(100%-220px)] overflow-y-auto pb-4">
            {Object.entries(getRelevantSwapOptions()).map(
              ([category, foods]) => (
                <div key={category} className="mb-6">
                  <h4 className="mb-2 text-sm font-semibold text-foreground">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {foods.map((food) => {
                      const isCurrentSelection =
                        food.id === selectedFoodToSwap.id;
                      const calorieDiff =
                        food.calories - selectedFoodToSwap.calories;
                      const proteinDiff =
                        food.protein - selectedFoodToSwap.protein;

                      return (
                        <button
                          key={food.id}
                          onClick={() =>
                            !isCurrentSelection && handleSelectReplacement(food)
                          }
                          disabled={isCurrentSelection}
                          className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition-all ${
                            isCurrentSelection
                              ? "border-2 border-primary bg-primary/5 opacity-50"
                              : "border border-border bg-card hover:border-primary/30"
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">
                                {food.name}
                              </span>
                              {isCurrentSelection && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                  CURRENT
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {food.portion}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-foreground">
                              {food.calories} kcal
                            </p>
                            <p className="text-primary font-medium">
                              {food.protein}g protein
                            </p>
                            {!isCurrentSelection && (
                              <p className="text-xs text-muted-foreground">
                                {calorieDiff >= 0 ? "+" : ""}
                                {calorieDiff} kcal /{" "}
                                {proteinDiff >= 0 ? "+" : ""}
                                {proteinDiff}g
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Done button */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background p-4">
          <Button
            onClick={handleClose}
            className="h-12 w-full rounded-xl text-base font-semibold"
          >
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
