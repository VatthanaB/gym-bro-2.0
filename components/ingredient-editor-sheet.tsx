"use client";

import { useState, useMemo } from "react";
import { Loader2, AlertCircle, CheckCircle2, Check, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useIngredientManagement,
  validateMacros,
  type ExtendedFood,
  type CustomFoodInput,
} from "@/lib/hooks/use-supabase";
import type { Food } from "@/lib/types";

// All food bank categories
const FOOD_BANK_CATEGORIES = [
  { value: "breakfastProteins", label: "Breakfast Proteins" },
  { value: "breakfastCarbs", label: "Breakfast Carbs" },
  { value: "lunchProteins", label: "Lunch Proteins" },
  { value: "lunchCarbs", label: "Lunch Carbs" },
  { value: "lunchVegetables", label: "Lunch Vegetables" },
  { value: "dinnerProteins", label: "Dinner Proteins" },
  { value: "dinnerVegetables", label: "Dinner Vegetables" },
  { value: "snackProteins", label: "Snack Proteins" },
  { value: "fats", label: "Fats/Oils" },
];

const FOOD_CATEGORIES: { value: Food["category"]; label: string }[] = [
  { value: "protein", label: "Protein" },
  { value: "carb", label: "Carb" },
  { value: "vegetable", label: "Vegetable" },
  { value: "fat", label: "Fat" },
  { value: "dairy", label: "Dairy" },
  { value: "complete", label: "Complete Meal" },
];

interface IngredientEditorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient: ExtendedFood | null;
  onSave: () => void; // Called after successful save to refresh data
}

export function IngredientEditorSheet({
  isOpen,
  onClose,
  ingredient,
  onSave,
}: IngredientEditorSheetProps) {
  const {
    updateFood,
    updateFoodCategories,
    toggleFoodEnabled,
    isLoading,
    error,
    clearError,
  } = useIngredientManagement();

  // Form state
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [portion, setPortion] = useState("");
  const [rawWeight, setRawWeight] = useState("");
  const [cookedWeight, setCookedWeight] = useState("");
  const [category, setCategory] = useState<Food["category"]>("protein");
  const [primaryCategory, setPrimaryCategory] = useState("");
  const [additionalCategories, setAdditionalCategories] = useState<string[]>(
    []
  );
  const [isEnabled, setIsEnabled] = useState(true);

  // Track the last ingredient ID to detect changes
  const [lastIngredientId, setLastIngredientId] = useState<string | null>(null);

  // Initialize form when ingredient changes
  const ingredientId = ingredient?.id ?? null;
  const shouldInitialize =
    isOpen && ingredientId && lastIngredientId !== ingredientId;

  if (shouldInitialize) {
    setName(ingredient!.name);
    setCalories(String(ingredient!.calories));
    setProtein(String(ingredient!.protein));
    setCarbs(String(ingredient!.carbs));
    setFat(String(ingredient!.fat));
    setPortion(ingredient!.portion);
    setRawWeight(ingredient!.rawWeight ? String(ingredient!.rawWeight) : "");
    setCookedWeight(
      ingredient!.cookedWeight ? String(ingredient!.cookedWeight) : ""
    );
    setCategory(ingredient!.category);
    setPrimaryCategory(ingredient!.foodBankCategory);
    setAdditionalCategories(ingredient!.additionalCategories || []);
    setIsEnabled(ingredient!.isEnabled);
    setLastIngredientId(ingredientId);
    clearError();
  }

  // Reset when sheet closes (handled in handleClose)
  const resetTracking = () => {
    setLastIngredientId(null);
  };

  // Validate macros using useMemo instead of useEffect
  const macroValidation = useMemo(() => {
    const cal = parseFloat(calories);
    const prot = parseFloat(protein);
    const carb = parseFloat(carbs);
    const fatVal = parseFloat(fat);

    if (
      !isNaN(cal) &&
      !isNaN(prot) &&
      !isNaN(carb) &&
      !isNaN(fatVal) &&
      cal > 0
    ) {
      return validateMacros({
        name,
        calories: cal,
        protein: prot,
        carbs: carb,
        fat: fatVal,
        portion,
        category,
        foodBankCategory: primaryCategory,
      });
    }
    return null;
  }, [calories, protein, carbs, fat, name, portion, category, primaryCategory]);

  const handleToggleAdditionalCategory = (cat: string) => {
    // Don't allow toggling the primary category
    if (cat === primaryCategory) return;

    setAdditionalCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async () => {
    if (!ingredient) return;

    const foodData: Partial<CustomFoodInput> = {
      name: name.trim(),
      calories: parseInt(calories, 10),
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fat: parseFloat(fat),
      portion: portion.trim(),
      category,
      foodBankCategory: primaryCategory,
    };

    // Only include weight fields for custom_foods
    if (ingredient.source === "custom_foods") {
      foodData.rawWeight = rawWeight ? parseInt(rawWeight, 10) : undefined;
      foodData.cookedWeight = cookedWeight
        ? parseInt(cookedWeight, 10)
        : undefined;
    }

    // Update the food
    const updateSuccess = await updateFood(
      ingredient.id,
      ingredient.source,
      foodData
    );
    if (!updateSuccess) return;

    // Update enabled status if changed
    if (isEnabled !== ingredient.isEnabled) {
      const enabledSuccess = await toggleFoodEnabled(
        ingredient.id,
        ingredient.source,
        isEnabled
      );
      if (!enabledSuccess) return;
    }

    // Update additional categories
    const categoriesChanged =
      JSON.stringify(additionalCategories.sort()) !==
      JSON.stringify((ingredient.additionalCategories || []).sort());

    if (categoriesChanged) {
      const catSuccess = await updateFoodCategories(
        ingredient.id,
        ingredient.source,
        additionalCategories
      );
      if (!catSuccess) return;
    }

    onSave();
    onClose();
  };

  const handleClose = () => {
    clearError();
    resetTracking();
    onClose();
  };

  const isFormValid =
    name.trim() !== "" &&
    calories !== "" &&
    protein !== "" &&
    carbs !== "" &&
    fat !== "" &&
    portion.trim() !== "" &&
    primaryCategory !== "";

  if (!ingredient) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent
        side="bottom"
        className="h-[90vh] overflow-hidden rounded-t-3xl"
      >
        <SheetHeader className="text-left">
          <SheetTitle>Edit Ingredient</SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex h-[calc(100%-140px)] flex-col overflow-y-auto">
          {/* Error Display */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Source Badge */}
          <div className="mb-4">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                ingredient.source === "custom_foods"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {ingredient.source === "custom_foods"
                ? "Custom Ingredient"
                : "Default Ingredient"}
            </span>
          </div>

          {/* Enabled Toggle */}
          <div className="mb-4 flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label className="text-base">Enabled</Label>
              <p className="text-xs text-muted-foreground">
                Disabled ingredients won&apos;t appear in meal swaps
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEnabled(!isEnabled)}
              className={`flex h-8 w-14 items-center rounded-full px-1 transition-colors ${
                isEnabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition-transform ${
                  isEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              >
                {isEnabled ? (
                  <Check className="h-3 w-3 text-primary" />
                ) : (
                  <X className="h-3 w-3 text-muted-foreground" />
                )}
              </span>
            </button>
          </div>

          {/* Name */}
          <div className="mb-4 space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Chicken Breast"
            />
          </div>

          {/* Macros Grid */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Calories *</Label>
              <Input
                id="calories"
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g) *</Label>
              <Input
                id="protein"
                type="number"
                min="0"
                step="0.1"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g) *</Label>
              <Input
                id="carbs"
                type="number"
                min="0"
                step="0.1"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat">Fat (g) *</Label>
              <Input
                id="fat"
                type="number"
                min="0"
                step="0.1"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Macro Validation Feedback */}
          {macroValidation && (
            <div
              className={`mb-4 rounded-lg p-3 text-sm ${
                macroValidation.valid
                  ? "bg-success/10 text-success"
                  : "bg-warning/10 text-warning"
              }`}
            >
              {macroValidation.valid ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>
                    Macros check out! Calculated:{" "}
                    {macroValidation.calculatedCalories} kcal
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{macroValidation.message}</span>
                </div>
              )}
            </div>
          )}

          {/* Portion */}
          <div className="mb-4 space-y-2">
            <Label htmlFor="portion">Portion Description *</Label>
            <Input
              id="portion"
              value={portion}
              onChange={(e) => setPortion(e.target.value)}
              placeholder="e.g., 200g raw / 150g cooked"
            />
          </div>

          {/* Weights Grid (Custom foods only) */}
          {ingredient.source === "custom_foods" && (
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rawWeight">Raw Weight (g)</Label>
                <Input
                  id="rawWeight"
                  type="number"
                  min="0"
                  value={rawWeight}
                  onChange={(e) => setRawWeight(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cookedWeight">Cooked Weight (g)</Label>
                <Input
                  id="cookedWeight"
                  type="number"
                  min="0"
                  value={cookedWeight}
                  onChange={(e) => setCookedWeight(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
          )}

          {/* Category Dropdowns */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Food Category *</Label>
              <select
                id="category"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as Food["category"])
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {FOOD_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryCategory">Primary Meal Category *</Label>
              <select
                id="primaryCategory"
                value={primaryCategory}
                onChange={(e) => setPrimaryCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select category...</option>
                {FOOD_BANK_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Categories (Multi-select) */}
          <div className="mb-4 space-y-2">
            <Label>Also Available In (Optional)</Label>
            <p className="text-xs text-muted-foreground">
              Select additional meal categories where this ingredient should
              appear
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {FOOD_BANK_CATEGORIES.filter(
                (cat) => cat.value !== primaryCategory
              ).map((cat) => {
                const isSelected = additionalCategories.includes(cat.value);
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleToggleAdditionalCategory(cat.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 flex gap-3 border-t border-border bg-background p-4">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Delete confirmation dialog for ingredients
interface DeleteIngredientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  ingredientName: string;
  isDeleting: boolean;
}

export function DeleteIngredientDialog({
  isOpen,
  onClose,
  onConfirm,
  ingredientName,
  isDeleting,
}: DeleteIngredientDialogProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="text-left">
          <SheetTitle>Delete Ingredient?</SheetTitle>
        </SheetHeader>

        <div className="my-6">
          <p className="text-muted-foreground">
            Are you sure you want to delete &quot;{ingredientName}&quot;? This
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
            className="flex-1"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
