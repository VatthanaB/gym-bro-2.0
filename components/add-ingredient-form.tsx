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
  const [foodBankCategory, setFoodBankCategory] = useState("");

  // Validation state
  const [macroValidation, setMacroValidation] = useState<{
    valid: boolean;
    calculatedCalories: number;
    message?: string;
  } | null>(null);

  // Validate macros when values change
  useEffect(() => {
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
      const validation = validateMacros({
        name,
        calories: cal,
        protein: prot,
        carbs: carb,
        fat: fatVal,
        portion,
        category,
        foodBankCategory,
      });
      setMacroValidation(validation);
    } else {
      setMacroValidation(null);
    }
  }, [
    calories,
    protein,
    carbs,
    fat,
    name,
    portion,
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
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setPortion("");
    setRawWeight("");
    setCookedWeight("");
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
      calories: parseInt(calories, 10),
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fat: parseFloat(fat),
      portion: portion.trim(),
      rawWeight: rawWeight ? parseInt(rawWeight, 10) : undefined,
      cookedWeight: cookedWeight ? parseInt(cookedWeight, 10) : undefined,
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
    calories !== "" &&
    protein !== "" &&
    carbs !== "" &&
    fat !== "" &&
    portion.trim() !== "" &&
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
          placeholder="e.g., Chicken Breast"
          required
        />
      </div>

      {/* Macros Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="calories">Calories *</Label>
          <Input
            id="calories"
            type="number"
            min="0"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="0"
            required
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
            required
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
            required
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
      <div className="space-y-2">
        <Label htmlFor="portion">Portion Description *</Label>
        <Input
          id="portion"
          value={portion}
          onChange={(e) => setPortion(e.target.value)}
          placeholder="e.g., 200g raw / 150g cooked"
          required
        />
      </div>

      {/* Weights Grid (Optional) */}
      <div className="grid grid-cols-2 gap-4">
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
