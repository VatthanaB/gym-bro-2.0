-- Migration: Per 100g Ingredient Storage
-- This migration changes ingredient storage from arbitrary portions to per-100g values
-- with optional piece weight for countable items (eggs, slices, etc.)

-- =============================================
-- FOODS TABLE CHANGES
-- =============================================

-- Add piece_weight_grams for countable items (e.g., egg = 50g)
ALTER TABLE public.foods ADD COLUMN IF NOT EXISTS piece_weight_grams INTEGER;

-- Add piece_name for singular name of countable items (e.g., "egg", "slice")
ALTER TABLE public.foods ADD COLUMN IF NOT EXISTS piece_name TEXT;

-- Add comment to clarify that macros are per 100g
COMMENT ON COLUMN public.foods.calories IS 'Calories per 100g';
COMMENT ON COLUMN public.foods.protein IS 'Protein in grams per 100g';
COMMENT ON COLUMN public.foods.carbs IS 'Carbohydrates in grams per 100g';
COMMENT ON COLUMN public.foods.fat IS 'Fat in grams per 100g';
COMMENT ON COLUMN public.foods.piece_weight_grams IS 'Weight of one piece in grams (optional, for countable items like eggs)';
COMMENT ON COLUMN public.foods.piece_name IS 'Singular name for countable items (e.g., egg, slice)';

-- =============================================
-- CUSTOM_FOODS TABLE CHANGES
-- =============================================

-- Add piece_weight_grams for countable items
ALTER TABLE public.custom_foods ADD COLUMN IF NOT EXISTS piece_weight_grams INTEGER;

-- Add piece_name for singular name of countable items
ALTER TABLE public.custom_foods ADD COLUMN IF NOT EXISTS piece_name TEXT;

-- Add comments
COMMENT ON COLUMN public.custom_foods.calories IS 'Calories per 100g';
COMMENT ON COLUMN public.custom_foods.protein IS 'Protein in grams per 100g';
COMMENT ON COLUMN public.custom_foods.carbs IS 'Carbohydrates in grams per 100g';
COMMENT ON COLUMN public.custom_foods.fat IS 'Fat in grams per 100g';
COMMENT ON COLUMN public.custom_foods.piece_weight_grams IS 'Weight of one piece in grams (optional, for countable items like eggs)';
COMMENT ON COLUMN public.custom_foods.piece_name IS 'Singular name for countable items (e.g., egg, slice)';

-- =============================================
-- MEAL_FOODS TABLE CHANGES
-- =============================================

-- Add quantity column (default 100g for existing entries)
ALTER TABLE public.meal_foods ADD COLUMN IF NOT EXISTS quantity NUMERIC(8,2) NOT NULL DEFAULT 100;

-- Add quantity_type column (grams or pieces)
ALTER TABLE public.meal_foods ADD COLUMN IF NOT EXISTS quantity_type TEXT NOT NULL DEFAULT 'grams';

-- Add check constraint for quantity_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'meal_foods_quantity_type_check'
  ) THEN
    ALTER TABLE public.meal_foods ADD CONSTRAINT meal_foods_quantity_type_check 
      CHECK (quantity_type IN ('grams', 'pieces'));
  END IF;
END $$;

-- Add comments
COMMENT ON COLUMN public.meal_foods.quantity IS 'Amount of food (in grams or pieces depending on quantity_type)';
COMMENT ON COLUMN public.meal_foods.quantity_type IS 'Type of quantity: grams or pieces';

-- =============================================
-- CLEAR EXISTING DATA (Fresh Start)
-- =============================================

-- Delete all existing food category assignments
DELETE FROM public.food_category_assignments;

-- Delete all existing meal_foods associations
DELETE FROM public.meal_foods;

-- Delete all existing meals
DELETE FROM public.meals;

-- Delete all existing custom foods
DELETE FROM public.custom_foods;

-- Delete all existing foods
DELETE FROM public.foods;

-- Clear user meal preferences (since foods are being reset)
UPDATE public.user_meal_preferences SET foods = '[]'::jsonb;

-- Delete all meal options (since foods are being reset)
DELETE FROM public.meal_options;
