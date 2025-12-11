"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCustomFoods,
  validateMacros,
  type CustomFoodInput,
} from "@/lib/hooks/use-supabase";
import type { Food } from "@/lib/types";

interface AddIngredientFormProps {
  foodBankCategories: { value: string; label: string }[];
  onSuccess?: (food: Food) => void;
}

const FOOD_CATEGORIES: { value: Food["category"]; label: string }[] = [
  { value: "protein", label: "Protein" },
  { value: "carb", label: "Carb" },
  { value: "vegetable", label: "Vegetable" },
  { value: "fat", label: "Fat" },
  { value: "dairy", label: "Dairy" },
];

export function AddIngredientForm({
  foodBankCategories,
  onSuccess,
}: AddIngredientFormProps) {
  const { addCustomFood, isAdding, error, clearError } = useCustomFoods();
  const [success, setSuccess] = useState(false);

  // Form state - all macros are per 100g
  const [name, setName] = useState("");
  const [caloriesPer100g, setCaloriesPer100g] = useState("");
  const [proteinPer100g, setProteinPer100g] = useState("");
  const [carbsPer100g, setCarbsPer100g] = useState("");
  const [fatPer100g, setFatPer100g] = useState("");
  const [pieceWeightGrams, setPieceWeightGrams] = useState("");
  const [pieceName, setPieceName] = useState("");
  const [category, setCategory] = useState<Food["category"]>("protein");
  const [foodBankCategory, setFoodBankCategory] = useState("");

  // Validation state
  const [macroValidation, setMacroValidation] = useState<{
    valid: boolean;
    calculatedCalories: number;
    message?: string;
  } | null>(null);

  // Validate macros when values change
  useEffect(() => {
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
      const validation = validateMacros({
        name,
        caloriesPer100g: cal,
        proteinPer100g: prot,
        carbsPer100g: carb,
        fatPer100g: fatVal,
        category,
        foodBankCategory,
      });
      setMacroValidation(validation);
    } else {
      setMacroValidation(null);
    }
  }, [
    caloriesPer100g,
    proteinPer100g,
    carbsPer100g,
    fatPer100g,
    name,
    category,
    foodBankCategory,
  ]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const resetForm = () => {
    setName("");
    setCaloriesPer100g("");
    setProteinPer100g("");
    setCarbsPer100g("");
    setFatPer100g("");
    setPieceWeightGrams("");
    setPieceName("");
    setCategory("protein");
    setFoodBankCategory("");
    setMacroValidation(null);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess(false);

    const foodInput: CustomFoodInput = {
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
      foodBankCategory,
    };

    const result = await addCustomFood(foodInput);

    if (result) {
      setSuccess(true);
      resetForm();
      onSuccess?.(result);
    }
  };

  const isFormValid =
    name.trim() !== "" &&
    caloriesPer100g !== "" &&
    proteinPer100g !== "" &&
    carbsPer100g !== "" &&
    fatPer100g !== "" &&
    foodBankCategory !== "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Ingredient added successfully!</span>
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Chicken Breast, Egg, Oats"
          required
        />
      </div>

      {/* Per 100g Notice */}
      <div className="rounded-lg bg-muted/50 px-3 py-2">
        <p className="text-xs text-muted-foreground">
          All nutritional values should be entered <strong>per 100g</strong>.
          You can find these values on food labels or nutrition databases.
        </p>
      </div>

      {/* Macros Grid - Per 100g */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="caloriesPer100g">Calories (per 100g) *</Label>
          <Input
            id="caloriesPer100g"
            type="number"
            min="0"
            value={caloriesPer100g}
            onChange={(e) => setCaloriesPer100g(e.target.value)}
            placeholder="e.g., 165"
            required
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
            required
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
            required
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
            required
          />
        </div>
      </div>

      {/* Macro Validation Feedback */}
      {macroValidation && (
        <div
          className={`rounded-lg p-3 text-sm ${
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
      <div className="space-y-2">
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Food Category *</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Food["category"])}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            required
          >
            {FOOD_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="foodBankCategory">Food Bank Category *</Label>
          <select
            id="foodBankCategory"
            value={foodBankCategory}
            onChange={(e) => setFoodBankCategory(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            required
          >
            <option value="">Select category...</option>
            {foodBankCategories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={!isFormValid || isAdding}
          className="flex-1"
        >
          {isAdding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Ingredient"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={resetForm}>
          Clear
        </Button>
      </div>
    </form>
  );
}
