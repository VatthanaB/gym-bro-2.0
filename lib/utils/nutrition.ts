import type { Food, MealFood, QuantityType } from "@/lib/types";

// Calculated macros result
export interface CalculatedMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Calculate the actual macros for a food based on quantity
 * @param food - The base food with per-100g values
 * @param quantity - The amount (in grams or pieces)
 * @param quantityType - Whether quantity is in "grams" or "pieces"
 * @returns Calculated macros rounded to nearest integer
 */
export function calculateMacros(
  food: Food,
  quantity: number,
  quantityType: QuantityType
): CalculatedMacros {
  // Convert pieces to grams if needed
  let grams = quantity;
  if (quantityType === "pieces") {
    if (!food.pieceWeightGrams) {
      console.warn(
        `Food "${food.name}" doesn't have pieceWeightGrams defined, defaulting to 100g per piece`
      );
      grams = quantity * 100;
    } else {
      grams = quantity * food.pieceWeightGrams;
    }
  }

  // Calculate macros based on grams (values are per 100g)
  const multiplier = grams / 100;

  return {
    calories: Math.round(food.caloriesPer100g * multiplier),
    protein: Math.round(food.proteinPer100g * multiplier * 10) / 10, // 1 decimal
    carbs: Math.round(food.carbsPer100g * multiplier * 10) / 10, // 1 decimal
    fat: Math.round(food.fatPer100g * multiplier * 10) / 10, // 1 decimal
  };
}

/**
 * Convert a base Food to a MealFood with quantity and calculated macros
 */
export function createMealFood(
  food: Food,
  quantity: number,
  quantityType: QuantityType
): MealFood {
  const macros = calculateMacros(food, quantity, quantityType);
  return {
    ...food,
    quantity,
    quantityType,
    calories: macros.calories,
    protein: macros.protein,
    carbs: macros.carbs,
    fat: macros.fat,
  };
}

/**
 * Format quantity for display
 * @param quantity - The amount
 * @param quantityType - "grams" or "pieces"
 * @param pieceName - Optional singular name for pieces (e.g., "egg")
 * @returns Formatted string (e.g., "150g", "3 eggs", "1 egg")
 */
export function formatQuantity(
  quantity: number,
  quantityType: QuantityType,
  pieceName?: string
): string {
  if (quantityType === "grams") {
    return `${quantity}g`;
  }

  // For pieces
  if (pieceName) {
    // Simple pluralization
    const plural = quantity === 1 ? pieceName : `${pieceName}s`;
    return `${quantity} ${plural}`;
  }

  return `${quantity} piece${quantity === 1 ? "" : "s"}`;
}

/**
 * Get the weight in grams for a food quantity
 */
export function getWeightInGrams(
  food: Food,
  quantity: number,
  quantityType: QuantityType
): number {
  if (quantityType === "grams") {
    return quantity;
  }
  return quantity * (food.pieceWeightGrams ?? 100);
}

/**
 * Check if a food can be measured in pieces
 */
export function canMeasureInPieces(food: Food): boolean {
  return food.pieceWeightGrams !== undefined && food.pieceWeightGrams > 0;
}

/**
 * Get default quantity for a food
 * Returns 100g for grams, or 1 piece if pieces are available
 */
export function getDefaultQuantity(food: Food): {
  quantity: number;
  quantityType: QuantityType;
} {
  if (canMeasureInPieces(food)) {
    return { quantity: 1, quantityType: "pieces" };
  }
  return { quantity: 100, quantityType: "grams" };
}

/**
 * Calculate total macros for an array of meal foods
 */
export function calculateTotalMacros(foods: MealFood[]): CalculatedMacros {
  return foods.reduce(
    (totals, food) => ({
      calories: totals.calories + food.calories,
      protein: Math.round((totals.protein + food.protein) * 10) / 10,
      carbs: Math.round((totals.carbs + food.carbs) * 10) / 10,
      fat: Math.round((totals.fat + food.fat) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}
