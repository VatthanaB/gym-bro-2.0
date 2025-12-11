"use client";

import { useState } from "react";
import { ArrowRight, ChevronLeft, Check, Plus, Minus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Food, MealFood, MealSlot, Meal, QuantityType } from "@/lib/types";
import type { MealOption } from "@/lib/hooks/use-supabase";
import {
  calculateMacros,
  createMealFood,
  formatQuantity,
  canMeasureInPieces,
  getDefaultQuantity,
} from "@/lib/utils/nutrition";

interface FoodSwapSheetProps {
  isOpen: boolean;
  onClose: () => void;
  slot: MealSlot | null;
  currentFoods: MealFood[];
  onSwapFood: (oldFoodId: string, newFood: MealFood) => void;
  onSelectMealOption?: (foods: MealFood[]) => void;
  onConfirm: () => void;
  getSwapOptions?: () => Record<string, Food[]>;
  mealOptions?: MealOption[];
  meal?: Meal;
}

// Quantity picker component for selecting how much of a food to add
function QuantityPicker({
  food,
  quantity,
  quantityType,
  onQuantityChange,
  onQuantityTypeChange,
}: {
  food: Food;
  quantity: number;
  quantityType: QuantityType;
  onQuantityChange: (qty: number) => void;
  onQuantityTypeChange: (type: QuantityType) => void;
}) {
  const canUsePieces = canMeasureInPieces(food);
  const macros = calculateMacros(food, quantity, quantityType);

  const increment = () => {
    if (quantityType === "pieces") {
      onQuantityChange(quantity + 1);
    } else {
      // Increment by 10g for grams
      onQuantityChange(quantity + 10);
    }
  };

  const decrement = () => {
    if (quantityType === "pieces") {
      if (quantity > 1) onQuantityChange(quantity - 1);
    } else {
      if (quantity > 10) onQuantityChange(quantity - 10);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      {/* Quantity type toggle (if pieces available) */}
      {canUsePieces && (
        <div className="flex gap-2">
          <button
            onClick={() => {
              onQuantityTypeChange("grams");
              onQuantityChange(100);
            }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              quantityType === "grams"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Grams
          </button>
          <button
            onClick={() => {
              onQuantityTypeChange("pieces");
              onQuantityChange(1);
            }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              quantityType === "pieces"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {food.pieceName ? `${food.pieceName}s` : "Pieces"}
          </button>
        </div>
      )}

      {/* Quantity input */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={decrement}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background hover:bg-muted"
        >
          <Minus className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={quantityType === "pieces" ? 1 : 10}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val > 0) {
                onQuantityChange(val);
              }
            }}
            className="h-12 w-24 text-center text-lg font-semibold"
          />
          <span className="text-sm text-muted-foreground">
            {quantityType === "grams" ? "g" : food.pieceName || "piece(s)"}
          </span>
        </div>

        <button
          onClick={increment}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Preview macros */}
      <div className="rounded-lg bg-muted/50 p-3">
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          <div>
            <p className="text-lg font-semibold text-foreground">
              {macros.calories}
            </p>
            <p className="text-xs text-muted-foreground">kcal</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-primary">
              {macros.protein}g
            </p>
            <p className="text-xs text-muted-foreground">protein</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {macros.carbs}g
            </p>
            <p className="text-xs text-muted-foreground">carbs</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {macros.fat}g
            </p>
            <p className="text-xs text-muted-foreground">fat</p>
          </div>
        </div>
      </div>
    </div>
  );
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
  const [selectedFoodToSwap, setSelectedFoodToSwap] = useState<MealFood | null>(
    null
  );
  const [selectedNewFood, setSelectedNewFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [quantityType, setQuantityType] = useState<QuantityType>("grams");

  if (!slot) return null;

  const swapOptions = getSwapOptions?.() || {};

  // Determine if this is a simple swap slot (breakfast/snacks)
  const isSimpleSwapSlot =
    slot === "breakfast" || slot === "snack1" || slot === "snack2";
  const hasMealOptions =
    isSimpleSwapSlot && mealOptions && mealOptions.length > 0;

  // Calculate current totals
  const totalCalories = currentFoods.reduce((sum, f) => sum + f.calories, 0);
  const totalProtein = currentFoods.reduce((sum, f) => sum + f.protein, 0);

  const handleClose = () => {
    setSelectedFoodToSwap(null);
    setSelectedNewFood(null);
    setQuantity(100);
    setQuantityType("grams");
    onClose();
  };

  const handleSelectFoodToSwap = (food: MealFood) => {
    setSelectedFoodToSwap(food);
  };

  const handleSelectNewFood = (food: Food) => {
    const defaults = getDefaultQuantity(food);
    setSelectedNewFood(food);
    setQuantity(defaults.quantity);
    setQuantityType(defaults.quantityType);
  };

  const handleConfirmSwap = () => {
    if (selectedFoodToSwap && selectedNewFood) {
      const mealFood = createMealFood(selectedNewFood, quantity, quantityType);
      onSwapFood(selectedFoodToSwap.id, mealFood);
      setSelectedFoodToSwap(null);
      setSelectedNewFood(null);
      setQuantity(100);
      setQuantityType("grams");
    }
  };

  const handleSelectMealOption = (option: MealOption) => {
    if (onSelectMealOption) {
      // Convert option foods to MealFood with default quantities
      const mealFoods: MealFood[] = option.foods.map((food) => {
        const defaults = getDefaultQuantity(food);
        return createMealFood(food, defaults.quantity, defaults.quantityType);
      });
      onSelectMealOption(mealFoods);
      handleClose();
    }
  };

  const handleBack = () => {
    if (selectedNewFood) {
      setSelectedNewFood(null);
    } else {
      setSelectedFoodToSwap(null);
    }
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

  // Check if current foods match a meal option (compare id, quantity, and quantityType)
  const isCurrentOption = (option: MealOption) => {
    if (option.foods.length !== currentFoods.length) return false;

    // Create a key for each food: id-quantity-quantityType
    const makeKey = (f: MealFood) => `${f.id}-${f.quantity}-${f.quantityType}`;
    const currentKeys = currentFoods.map(makeKey).sort();
    const optionKeys = option.foods.map(makeKey).sort();

    return currentKeys.every((key, i) => key === optionKeys[i]);
  };

  const targetCalories = meal?.targetCalories || 500;
  const targetProtein = meal?.targetProtein || 30;

  // Render the quantity selection screen
  if (selectedNewFood) {
    const macros = calculateMacros(selectedNewFood, quantity, quantityType);

    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent
          side="bottom"
          className="h-[85vh] overflow-hidden rounded-t-3xl"
        >
          <SheetHeader className="text-left">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                className="rounded-full p-1 hover:bg-muted"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <SheetTitle>Set Quantity</SheetTitle>
            </div>
            <SheetDescription>
              How much {selectedNewFood.name} do you want?
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Food info */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground">
                {selectedNewFood.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedNewFood.caloriesPer100g} kcal /{" "}
                {selectedNewFood.proteinPer100g}g protein per 100g
              </p>
            </div>

            {/* Quantity picker */}
            <QuantityPicker
              food={selectedNewFood}
              quantity={quantity}
              quantityType={quantityType}
              onQuantityChange={setQuantity}
              onQuantityTypeChange={setQuantityType}
            />
          </div>

          {/* Confirm button */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background p-4">
            <Button
              onClick={handleConfirmSwap}
              className="h-12 w-full rounded-xl text-base font-semibold"
            >
              Add{" "}
              {formatQuantity(
                quantity,
                quantityType,
                selectedNewFood.pieceName
              )}{" "}
              ({macros.calories} kcal)
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

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
                const optionCalories = option.foods.reduce(
                  (sum, f) => sum + f.caloriesPer100g,
                  0
                );
                const optionProtein = option.foods.reduce(
                  (sum, f) => sum + f.proteinPer100g,
                  0
                );
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
                        {option.foods.map((f) => f.name).join(" + ")}
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
                  onClick={() => handleSelectFoodToSwap(food)}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30"
                >
                  <div className="flex-1">
                    <span className="font-medium text-foreground">
                      {food.name}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {formatQuantity(
                        food.quantity,
                        food.quantityType,
                        food.pieceName
                      )}
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

                      return (
                        <button
                          key={food.id}
                          onClick={() =>
                            !isCurrentSelection && handleSelectNewFood(food)
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
                              {food.caloriesPer100g} kcal /{" "}
                              {food.proteinPer100g}g protein per 100g
                              {food.pieceWeightGrams && (
                                <>
                                  {" "}
                                  · 1 {food.pieceName || "piece"} ={" "}
                                  {food.pieceWeightGrams}g
                                </>
                              )}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
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
