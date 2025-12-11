"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader2, Minus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Food, MealFood, QuantityType } from "@/lib/types";
import type { MealOption } from "@/lib/hooks/use-supabase";
import {
  calculateMacros,
  createMealFood,
  formatQuantity,
  canMeasureInPieces,
  getDefaultQuantity,
} from "@/lib/utils/nutrition";

interface MealOptionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  slot: "breakfast" | "snack";
  option?: MealOption; // If editing, pass the existing option
  foodBank: Record<string, Food[]>;
  onSave: (name: string, foods: MealFood[]) => Promise<boolean>;
}

// Quantity picker for selecting food quantity
function FoodQuantityPicker({
  food,
  onConfirm,
  onCancel,
}: {
  food: Food;
  onConfirm: (mealFood: MealFood) => void;
  onCancel: () => void;
}) {
  const defaults = getDefaultQuantity(food);
  const [quantity, setQuantity] = useState(defaults.quantity);
  const [quantityType, setQuantityType] = useState<QuantityType>(
    defaults.quantityType
  );

  const canUsePieces = canMeasureInPieces(food);
  const macros = calculateMacros(food, quantity, quantityType);

  const increment = () => {
    if (quantityType === "pieces") {
      setQuantity((q) => q + 1);
    } else {
      setQuantity((q) => q + 10);
    }
  };

  const decrement = () => {
    if (quantityType === "pieces") {
      if (quantity > 1) setQuantity((q) => q - 1);
    } else {
      if (quantity > 10) setQuantity((q) => q - 10);
    }
  };

  const handleConfirm = () => {
    const mealFood = createMealFood(food, quantity, quantityType);
    onConfirm(mealFood);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="text-lg font-semibold">{food.name}</h4>
        <p className="text-sm text-muted-foreground">
          {food.caloriesPer100g} kcal / {food.proteinPer100g}g protein per 100g
        </p>
      </div>

      {/* Quantity type toggle */}
      {canUsePieces && (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setQuantityType("grams");
              setQuantity(100);
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
              setQuantityType("pieces");
              setQuantity(1);
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
                setQuantity(val);
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

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleConfirm} className="flex-1">
          Add {formatQuantity(quantity, quantityType, food.pieceName)}
        </Button>
      </div>
    </div>
  );
}

export function MealOptionEditor({
  isOpen,
  onClose,
  slot,
  option,
  foodBank,
  onSave,
}: MealOptionEditorProps) {
  const [name, setName] = useState("");
  const [selectedFoods, setSelectedFoods] = useState<MealFood[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [foodToAdd, setFoodToAdd] = useState<Food | null>(null);

  // Initialize form when option changes or sheet opens
  useEffect(() => {
    if (isOpen) {
      if (option) {
        setName(option.name);
        // Convert stored foods to MealFood format
        // Note: Old format foods might not have quantity info
        const mealFoods: MealFood[] = option.foods.map((food) => {
          // If it's already a MealFood (has quantity), use it
          if ("quantity" in food && "quantityType" in food) {
            return food as unknown as MealFood;
          }
          // Otherwise, create with default quantity
          const defaults = getDefaultQuantity(food);
          return createMealFood(food, defaults.quantity, defaults.quantityType);
        });
        setSelectedFoods(mealFoods);
      } else {
        setName("");
        setSelectedFoods([]);
      }
      setShowFoodPicker(false);
      setFoodToAdd(null);
    }
  }, [isOpen, option]);

  // Calculate totals from MealFood (which has calculated macros)
  const totalCalories = selectedFoods.reduce((sum, f) => sum + f.calories, 0);
  const totalProtein = selectedFoods.reduce((sum, f) => sum + f.protein, 0);
  const totalCarbs = selectedFoods.reduce((sum, f) => sum + f.carbs, 0);
  const totalFat = selectedFoods.reduce((sum, f) => sum + f.fat, 0);

  // Get relevant food bank categories based on slot
  const getRelevantCategories = (): Record<string, Food[]> => {
    if (slot === "breakfast") {
      return {
        "Breakfast Proteins": foodBank.breakfastProteins || [],
        "Breakfast Carbs": foodBank.breakfastCarbs || [],
        Fats: foodBank.fats || [],
      };
    } else {
      return {
        "Snack Proteins": foodBank.snackProteins || [],
        Fats: foodBank.fats || [],
      };
    }
  };

  const handleSelectFood = (food: Food) => {
    setFoodToAdd(food);
  };

  const handleConfirmAddFood = (mealFood: MealFood) => {
    setSelectedFoods((prev) => [...prev, mealFood]);
    setFoodToAdd(null);
    setShowFoodPicker(false);
  };

  const handleRemoveFood = (index: number) => {
    setSelectedFoods((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim() || selectedFoods.length === 0) return;

    setIsSaving(true);
    // Note: We're passing the base Food properties for storage
    // The MealFood format will be converted when loaded
    const success = await onSave(name.trim(), selectedFoods);
    setIsSaving(false);

    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    setShowFoodPicker(false);
    setFoodToAdd(null);
    onClose();
  };

  const isValid = name.trim() !== "" && selectedFoods.length > 0;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent
        side="bottom"
        className="h-[90vh] overflow-hidden rounded-t-3xl"
      >
        <SheetHeader className="text-left">
          <SheetTitle>
            {option ? "Edit" : "Create"}{" "}
            {slot === "breakfast" ? "Breakfast" : "Snack"} Option
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex h-[calc(100%-140px)] flex-col overflow-hidden">
          {foodToAdd ? (
            /* Quantity Picker for selected food */
            <FoodQuantityPicker
              food={foodToAdd}
              onConfirm={handleConfirmAddFood}
              onCancel={() => setFoodToAdd(null)}
            />
          ) : !showFoodPicker ? (
            <>
              {/* Name Input */}
              <div className="mb-4 space-y-2">
                <Label htmlFor="option-name">Option Name</Label>
                <Input
                  id="option-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., 3 eggs + 2 toast + butter"
                />
              </div>

              {/* Totals Summary */}
              <div className="mb-4 rounded-lg bg-muted p-3">
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div>
                    <p className="font-semibold text-foreground">
                      {Math.round(totalCalories)}
                    </p>
                    <p className="text-xs text-muted-foreground">kcal</p>
                  </div>
                  <div>
                    <p className="font-semibold text-primary">
                      {Math.round(totalProtein)}g
                    </p>
                    <p className="text-xs text-muted-foreground">protein</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {Math.round(totalCarbs)}g
                    </p>
                    <p className="text-xs text-muted-foreground">carbs</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {Math.round(totalFat)}g
                    </p>
                    <p className="text-xs text-muted-foreground">fat</p>
                  </div>
                </div>
              </div>

              {/* Selected Foods */}
              <div className="flex-1 overflow-y-auto">
                <div className="mb-2 flex items-center justify-between">
                  <Label>Foods in this option</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFoodPicker(true)}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Food
                  </Button>
                </div>

                {selectedFoods.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      No foods added yet. Click &quot;Add Food&quot; to start
                      building this option.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedFoods.map((food, index) => (
                      <div
                        key={`${food.id}-${index}`}
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {food.name}
                          </p>
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
                            <span className="text-muted-foreground">
                              {food.calories} kcal
                            </span>
                            <span className="mx-1 text-muted-foreground">
                              ·
                            </span>
                            <span className="font-medium text-primary">
                              {food.protein}g
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveFood(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Food Picker View */
            <div className="flex-1 overflow-y-auto">
              <div className="mb-3 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFoodPicker(false)}
                >
                  ← Back
                </Button>
                <span className="text-sm font-medium">
                  Select a food to add
                </span>
              </div>

              {Object.entries(getRelevantCategories()).map(
                ([category, foods]) => (
                  <div key={category} className="mb-4">
                    <h4 className="mb-2 text-sm font-semibold text-foreground">
                      {category}
                    </h4>
                    {foods.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        No ingredients in this category yet
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {foods.map((food) => (
                          <button
                            key={food.id}
                            onClick={() => handleSelectFood(food)}
                            className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary/30"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-foreground">
                                {food.name}
                              </p>
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
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!showFoodPicker && !foodToAdd && (
          <div className="absolute bottom-0 left-0 right-0 flex gap-3 border-t border-border bg-background p-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValid || isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : option ? (
                "Save Changes"
              ) : (
                "Create Option"
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Confirmation dialog for delete
interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  optionName: string;
  isDeleting: boolean;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  optionName,
  isDeleting,
}: DeleteConfirmDialogProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="text-left">
          <SheetTitle>Delete Meal Option?</SheetTitle>
        </SheetHeader>

        <div className="my-6">
          <p className="text-muted-foreground">
            Are you sure you want to delete &quot;{optionName}&quot;? This
            action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
