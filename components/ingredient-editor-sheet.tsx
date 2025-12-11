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

  // Form state - all macros are per 100g
  const [name, setName] = useState("");
  const [caloriesPer100g, setCaloriesPer100g] = useState("");
  const [proteinPer100g, setProteinPer100g] = useState("");
  const [carbsPer100g, setCarbsPer100g] = useState("");
  const [fatPer100g, setFatPer100g] = useState("");
  const [pieceWeightGrams, setPieceWeightGrams] = useState("");
  const [pieceName, setPieceName] = useState("");
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
    setCaloriesPer100g(String(ingredient!.caloriesPer100g));
    setProteinPer100g(String(ingredient!.proteinPer100g));
    setCarbsPer100g(String(ingredient!.carbsPer100g));
    setFatPer100g(String(ingredient!.fatPer100g));
    setPieceWeightGrams(
      ingredient!.pieceWeightGrams ? String(ingredient!.pieceWeightGrams) : ""
    );
    setPieceName(ingredient!.pieceName || "");
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
    const cal = parseFloat(caloriesPer100g);
    const prot = parseFloat(proteinPer100g);
    const carb = parseFloat(carbsPer100g);
    const fatVal = parseFloat(fatPer100g);

    if (
      !isNaN(cal) &&
      !isNaN(prot) &&
      !isNaN(carb) &&
      !isNaN(fatVal) &&
      cal > 0
    ) {
      return validateMacros({
        name,
        caloriesPer100g: cal,
        proteinPer100g: prot,
        carbsPer100g: carb,
        fatPer100g: fatVal,
        category,
        foodBankCategory: primaryCategory,
      });
    }
    return null;
  }, [
    caloriesPer100g,
    proteinPer100g,
    carbsPer100g,
    fatPer100g,
    name,
    category,
    primaryCategory,
  ]);

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
      caloriesPer100g: parseInt(caloriesPer100g, 10),
      proteinPer100g: parseFloat(proteinPer100g),
      carbsPer100g: parseFloat(carbsPer100g),
      fatPer100g: parseFloat(fatPer100g),
      pieceWeightGrams: pieceWeightGrams
        ? parseInt(pieceWeightGrams, 10)
        : undefined,
      pieceName: pieceName.trim() || undefined,
      category,
      foodBankCategory: primaryCategory,
    };

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
    caloriesPer100g !== "" &&
    proteinPer100g !== "" &&
    carbsPer100g !== "" &&
    fatPer100g !== "" &&
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
              placeholder="e.g., Chicken Breast, Egg, Oats"
            />
          </div>

          {/* Per 100g Notice */}
          <div className="mb-4 rounded-lg bg-muted/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">
              All nutritional values should be entered <strong>per 100g</strong>
              . You can find these values on food labels or nutrition databases.
            </p>
          </div>

          {/* Macros Grid - Per 100g */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caloriesPer100g">Calories (per 100g) *</Label>
              <Input
                id="caloriesPer100g"
                type="number"
                min="0"
                value={caloriesPer100g}
                onChange={(e) => setCaloriesPer100g(e.target.value)}
                placeholder="e.g., 165"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proteinPer100g">Protein (g per 100g) *</Label>
              <Input
                id="proteinPer100g"
                type="number"
                min="0"
                step="0.1"
                value={proteinPer100g}
                onChange={(e) => setProteinPer100g(e.target.value)}
                placeholder="e.g., 31"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbsPer100g">Carbs (g per 100g) *</Label>
              <Input
                id="carbsPer100g"
                type="number"
                min="0"
                step="0.1"
                value={carbsPer100g}
                onChange={(e) => setCarbsPer100g(e.target.value)}
                placeholder="e.g., 0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fatPer100g">Fat (g per 100g) *</Label>
              <Input
                id="fatPer100g"
                type="number"
                min="0"
                step="0.1"
                value={fatPer100g}
                onChange={(e) => setFatPer100g(e.target.value)}
                placeholder="e.g., 3.6"
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
                    {macroValidation.calculatedCalories} kcal/100g
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

          {/* Piece Information (Optional) */}
          <div className="mb-4 space-y-2">
            <Label>Piece Information (Optional)</Label>
            <p className="text-xs text-muted-foreground">
              For countable items like eggs, slices of bread, etc. This allows
              measuring by piece count instead of grams.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pieceWeightGrams" className="text-xs">
                  Weight per piece (g)
                </Label>
                <Input
                  id="pieceWeightGrams"
                  type="number"
                  min="0"
                  value={pieceWeightGrams}
                  onChange={(e) => setPieceWeightGrams(e.target.value)}
                  placeholder="e.g., 50 for an egg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pieceName" className="text-xs">
                  Piece name (singular)
                </Label>
                <Input
                  id="pieceName"
                  value={pieceName}
                  onChange={(e) => setPieceName(e.target.value)}
                  placeholder="e.g., egg, slice"
                />
              </div>
            </div>
          </div>

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
