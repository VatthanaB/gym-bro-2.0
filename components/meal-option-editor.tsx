"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Food } from "@/lib/types";
import type { MealOption } from "@/lib/hooks/use-supabase";

interface MealOptionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  slot: "breakfast" | "snack";
  option?: MealOption; // If editing, pass the existing option
  foodBank: Record<string, Food[]>;
  onSave: (name: string, foods: Food[]) => Promise<boolean>;
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
  const [selectedFoods, setSelectedFoods] = useState<Food[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showFoodPicker, setShowFoodPicker] = useState(false);

  // Initialize form when option changes or sheet opens
  useEffect(() => {
    if (isOpen) {
      if (option) {
        setName(option.name);
        setSelectedFoods([...option.foods]);
      } else {
        setName("");
        setSelectedFoods([]);
      }
      setShowFoodPicker(false);
    }
  }, [isOpen, option]);

  // Calculate totals
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

  const handleAddFood = (food: Food) => {
    setSelectedFoods((prev) => [...prev, food]);
    setShowFoodPicker(false);
  };

  const handleRemoveFood = (index: number) => {
    setSelectedFoods((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim() || selectedFoods.length === 0) return;

    setIsSaving(true);
    const success = await onSave(name.trim(), selectedFoods);
    setIsSaving(false);

    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    setShowFoodPicker(false);
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
          {!showFoodPicker ? (
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
                      {totalCalories}
                    </p>
                    <p className="text-xs text-muted-foreground">kcal</p>
                  </div>
                  <div>
                    <p className="font-semibold text-primary">
                      {totalProtein}g
                    </p>
                    <p className="text-xs text-muted-foreground">protein</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {totalCarbs}g
                    </p>
                    <p className="text-xs text-muted-foreground">carbs</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{totalFat}g</p>
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
                            {food.portion}
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
                    <div className="space-y-1">
                      {foods.map((food) => (
                        <button
                          key={food.id}
                          onClick={() => handleAddFood(food)}
                          className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary/30"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-foreground">
                              {food.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {food.portion}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-foreground">
                              {food.calories} kcal
                            </p>
                            <p className="font-medium text-primary">
                              {food.protein}g protein
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!showFoodPicker && (
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
