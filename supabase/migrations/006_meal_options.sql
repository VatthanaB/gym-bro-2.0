-- Migration: Add meal_options table for editable breakfast/snack presets
-- This allows admins to create, edit, and delete meal options

-- Meal options table (presets for breakfast/snacks)
CREATE TABLE IF NOT EXISTS meal_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot TEXT NOT NULL, -- 'breakfast' or 'snack' (snack options shared between snack1/snack2)
  name TEXT NOT NULL,
  foods JSONB NOT NULL, -- Array of Food objects
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE meal_options ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read meal options
CREATE POLICY "Anyone can read meal options" ON meal_options
  FOR SELECT USING (true);

-- Policy: Only admins can insert meal options
CREATE POLICY "Admins can insert meal options" ON meal_options
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can update meal options
CREATE POLICY "Admins can update meal options" ON meal_options
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can delete meal options
CREATE POLICY "Admins can delete meal options" ON meal_options
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Create index for faster lookups by slot
CREATE INDEX IF NOT EXISTS idx_meal_options_slot ON meal_options(slot);

-- Seed breakfast options
INSERT INTO meal_options (slot, name, foods) VALUES
('breakfast', '3 eggs + 2 toast + butter', '[
  {"id": "eggs-3", "name": "Whole Eggs", "calories": 216, "protein": 19, "carbs": 1, "fat": 14, "portion": "3 eggs", "rawWeight": 150, "cookedWeight": 150, "category": "protein"},
  {"id": "toast-2", "name": "Whole Grain Toast", "calories": 148, "protein": 8, "carbs": 24, "fat": 2, "portion": "2 slices", "rawWeight": 60, "cookedWeight": 60, "category": "carb"},
  {"id": "butter-5g", "name": "Butter", "calories": 36, "protein": 0, "carbs": 0, "fat": 4, "portion": "5g", "rawWeight": 5, "cookedWeight": 5, "category": "fat"}
]'::jsonb),

('breakfast', '3 eggs + 50g oats + 10g honey', '[
  {"id": "eggs-3", "name": "Whole Eggs", "calories": 216, "protein": 19, "carbs": 1, "fat": 14, "portion": "3 eggs", "rawWeight": 150, "cookedWeight": 150, "category": "protein"},
  {"id": "oats-50", "name": "Oats", "calories": 195, "protein": 8, "carbs": 34, "fat": 4, "portion": "50g dry", "rawWeight": 50, "cookedWeight": 150, "category": "carb"},
  {"id": "honey-10g", "name": "Honey", "calories": 30, "protein": 0, "carbs": 8, "fat": 0, "portion": "10g", "rawWeight": 10, "cookedWeight": 10, "category": "carb"}
]'::jsonb),

('breakfast', '4 eggs + 1 toast', '[
  {"id": "eggs-4", "name": "Whole Eggs", "calories": 294, "protein": 25, "carbs": 1, "fat": 19, "portion": "4 eggs", "rawWeight": 200, "cookedWeight": 200, "category": "protein"},
  {"id": "toast-1", "name": "Whole Grain Toast", "calories": 74, "protein": 4, "carbs": 12, "fat": 1, "portion": "1 slice", "rawWeight": 30, "cookedWeight": 30, "category": "carb"}
]'::jsonb),

('breakfast', '3 eggs + 1 toast + 100g Greek yogurt (2%)', '[
  {"id": "eggs-3", "name": "Whole Eggs", "calories": 216, "protein": 19, "carbs": 1, "fat": 14, "portion": "3 eggs", "rawWeight": 150, "cookedWeight": 150, "category": "protein"},
  {"id": "toast-1", "name": "Whole Grain Toast", "calories": 74, "protein": 4, "carbs": 12, "fat": 1, "portion": "1 slice", "rawWeight": 30, "cookedWeight": 30, "category": "carb"},
  {"id": "greek-yogurt-2pct-100", "name": "Greek Yogurt (2%)", "calories": 97, "protein": 10, "carbs": 4, "fat": 2, "portion": "100g", "rawWeight": 100, "cookedWeight": 100, "category": "dairy"}
]'::jsonb),

('breakfast', 'Omelette (4 eggs + veg) + 1 toast', '[
  {"id": "eggs-4", "name": "Whole Eggs", "calories": 294, "protein": 25, "carbs": 1, "fat": 19, "portion": "4 eggs", "rawWeight": 200, "cookedWeight": 200, "category": "protein"},
  {"id": "omelette-veg", "name": "Mixed Veg (peppers, onion)", "calories": 10, "protein": 1, "carbs": 2, "fat": 0, "portion": "50g", "rawWeight": 50, "cookedWeight": 40, "category": "vegetable"},
  {"id": "toast-1", "name": "Whole Grain Toast", "calories": 74, "protein": 4, "carbs": 12, "fat": 1, "portion": "1 slice", "rawWeight": 30, "cookedWeight": 30, "category": "carb"}
]'::jsonb);

-- Seed snack options (shared between snack1 and snack2)
INSERT INTO meal_options (slot, name, foods) VALUES
('snack', '200g cottage cheese (2%)', '[
  {"id": "cottage-cheese-200", "name": "Cottage Cheese", "calories": 196, "protein": 22, "carbs": 7, "fat": 5, "portion": "200g", "rawWeight": 200, "cookedWeight": 200, "category": "dairy"}
]'::jsonb),

('snack', '200g Greek yogurt (0%) + 30g berries', '[
  {"id": "greek-yogurt-200", "name": "Greek Yogurt (0%)", "calories": 120, "protein": 20, "carbs": 8, "fat": 0, "portion": "200g", "rawWeight": 200, "cookedWeight": 200, "category": "dairy"},
  {"id": "berries-30g", "name": "Berries", "calories": 17, "protein": 0.5, "carbs": 4, "fat": 0, "portion": "30g", "rawWeight": 30, "cookedWeight": 30, "category": "vegetable"}
]'::jsonb),

('snack', 'Protein shake (30g powder + 200ml skim milk)', '[
  {"id": "protein-shake-30-milk", "name": "Protein Shake + Milk", "calories": 190, "protein": 34, "carbs": 9, "fat": 1, "portion": "30g powder + 200ml skim milk", "rawWeight": 230, "cookedWeight": 500, "category": "protein"}
]'::jsonb),

('snack', '2 hard boiled eggs + 100g cottage cheese', '[
  {"id": "boiled-eggs-2", "name": "Boiled Eggs", "calories": 156, "protein": 13, "carbs": 1, "fat": 11, "portion": "2 eggs", "rawWeight": 100, "cookedWeight": 100, "category": "protein"},
  {"id": "cottage-cheese-100", "name": "Cottage Cheese", "calories": 98, "protein": 11, "carbs": 3, "fat": 3, "portion": "100g", "rawWeight": 100, "cookedWeight": 100, "category": "dairy"}
]'::jsonb),

('snack', '150g cottage cheese + 50g Greek yogurt', '[
  {"id": "cottage-cheese-150", "name": "Cottage Cheese", "calories": 147, "protein": 17, "carbs": 5, "fat": 4, "portion": "150g", "rawWeight": 150, "cookedWeight": 150, "category": "dairy"},
  {"id": "greek-yogurt-50", "name": "Greek Yogurt (0%)", "calories": 48, "protein": 5, "carbs": 2, "fat": 0, "portion": "50g", "rawWeight": 50, "cookedWeight": 50, "category": "dairy"}
]'::jsonb),

('snack', 'Small tuna tin (100g) + cucumber + 5 crackers', '[
  {"id": "tuna-100", "name": "Canned Tuna", "calories": 116, "protein": 26, "carbs": 0, "fat": 1, "portion": "100g drained", "rawWeight": 100, "cookedWeight": 100, "category": "protein"},
  {"id": "cucumber-100", "name": "Cucumber", "calories": 8, "protein": 0, "carbs": 2, "fat": 0, "portion": "100g", "rawWeight": 100, "cookedWeight": 100, "category": "vegetable"},
  {"id": "crackers-20g", "name": "Crackers", "calories": 90, "protein": 2, "carbs": 12, "fat": 4, "portion": "20g (5 crackers)", "rawWeight": 20, "cookedWeight": 20, "category": "carb"}
]'::jsonb),

('snack', 'Protein bar (20g+ protein, 200-230 cal)', '[
  {"id": "protein-bar", "name": "Protein Bar", "calories": 215, "protein": 22, "carbs": 20, "fat": 6, "portion": "1 bar (60g)", "rawWeight": 60, "cookedWeight": 60, "category": "protein"}
]'::jsonb);
