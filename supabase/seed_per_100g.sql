-- =============================================
-- GYM BRO 2.0 - SEED DATA (Per 100g Format)
-- Run this AFTER migration 008_per_100g_ingredients.sql
-- All nutritional values are per 100g
-- =============================================

-- =============================================
-- FOODS - Per 100g Nutritional Values
-- =============================================

-- Note: All calories, protein, carbs, fat values are PER 100g
-- piece_weight_grams: weight of one piece (for countable items)
-- piece_name: singular name for pieces (e.g., "egg", "slice")

INSERT INTO public.foods (id, name, calories, protein, carbs, fat, portion, category, food_bank_category, piece_weight_grams, piece_name) VALUES

-- =============================================
-- PROTEINS - Per 100g
-- =============================================

-- Eggs (whole, raw) - 143 kcal/100g
('egg', 'Egg (Whole)', 143, 13, 1, 10, 'per 100g', 'protein', 'breakfastProteins', 50, 'egg'),

-- Chicken Breast (raw) - 120 kcal/100g
('chicken-breast', 'Chicken Breast', 120, 23, 0, 2.6, 'per 100g', 'protein', 'lunchProteins', NULL, NULL),

-- Turkey Breast (raw) - 111 kcal/100g
('turkey-breast', 'Turkey Breast', 111, 24, 0, 1.5, 'per 100g', 'protein', 'lunchProteins', NULL, NULL),

-- Salmon (raw) - 208 kcal/100g
('salmon', 'Salmon Fillet', 208, 20, 0, 13, 'per 100g', 'protein', 'lunchProteins', NULL, NULL),

-- White Fish (Cod/Haddock, raw) - 82 kcal/100g
('white-fish', 'White Fish (Cod/Haddock)', 82, 18, 0, 0.7, 'per 100g', 'protein', 'lunchProteins', NULL, NULL),

-- Tuna Steak (raw) - 144 kcal/100g
('tuna-steak', 'Tuna Steak', 144, 23, 0, 5, 'per 100g', 'protein', 'lunchProteins', NULL, NULL),

-- Lean Beef (raw) - 150 kcal/100g
('beef-lean', 'Lean Beef', 150, 22, 0, 7, 'per 100g', 'protein', 'lunchProteins', NULL, NULL),

-- Pork Tenderloin (raw) - 122 kcal/100g
('pork-tenderloin', 'Pork Tenderloin', 122, 22, 0, 3.5, 'per 100g', 'protein', 'lunchProteins', NULL, NULL),

-- Prawns/Shrimp (raw) - 85 kcal/100g
('prawns', 'Prawns/Shrimp', 85, 20, 0, 0.5, 'per 100g', 'protein', 'lunchProteins', NULL, NULL),

-- Canned Tuna (drained) - 116 kcal/100g
('tuna-canned', 'Canned Tuna (in water)', 116, 26, 0, 1, 'per 100g', 'protein', 'snackProteins', NULL, NULL),

-- =============================================
-- DAIRY - Per 100g
-- =============================================

-- Greek Yogurt 0% - 59 kcal/100g
('greek-yogurt-0', 'Greek Yogurt (0% fat)', 59, 10, 4, 0, 'per 100g', 'dairy', 'breakfastProteins', NULL, NULL),

-- Greek Yogurt 2% - 97 kcal/100g
('greek-yogurt-2', 'Greek Yogurt (2% fat)', 97, 9, 4, 3, 'per 100g', 'dairy', 'breakfastProteins', NULL, NULL),

-- Cottage Cheese - 98 kcal/100g
('cottage-cheese', 'Cottage Cheese', 98, 11, 3, 4, 'per 100g', 'dairy', 'snackProteins', NULL, NULL),

-- Skim Milk - 35 kcal/100ml
('skim-milk', 'Skim Milk', 35, 3.5, 5, 0.1, 'per 100ml', 'dairy', 'snackProteins', NULL, NULL),

-- =============================================
-- CARBS - Per 100g (dry weight where applicable)
-- =============================================

-- Whole Grain Bread - 247 kcal/100g
('bread-wholegrain', 'Whole Grain Bread', 247, 13, 41, 4, 'per 100g', 'carb', 'breakfastCarbs', 30, 'slice'),

-- White Rice (dry) - 360 kcal/100g
('rice-white', 'White Rice (dry)', 360, 7, 79, 0.6, 'per 100g', 'carb', 'lunchCarbs', NULL, NULL),

-- Brown Rice (dry) - 357 kcal/100g
('rice-brown', 'Brown Rice (dry)', 357, 8, 73, 2.7, 'per 100g', 'carb', 'lunchCarbs', NULL, NULL),

-- Pasta (dry) - 371 kcal/100g
('pasta', 'Pasta (dry)', 371, 13, 75, 1.5, 'per 100g', 'carb', 'lunchCarbs', NULL, NULL),

-- Oats (dry) - 389 kcal/100g
('oats', 'Oats (dry)', 389, 17, 66, 7, 'per 100g', 'carb', 'breakfastCarbs', NULL, NULL),

-- Quinoa (dry) - 368 kcal/100g
('quinoa', 'Quinoa (dry)', 368, 14, 64, 6, 'per 100g', 'carb', 'lunchCarbs', NULL, NULL),

-- Couscous (dry) - 376 kcal/100g
('couscous', 'Couscous (dry)', 376, 13, 77, 0.6, 'per 100g', 'carb', 'lunchCarbs', NULL, NULL),

-- Potatoes (raw) - 77 kcal/100g
('potato', 'Potatoes', 77, 2, 17, 0.1, 'per 100g', 'carb', 'lunchCarbs', NULL, NULL),

-- Sweet Potato (raw) - 86 kcal/100g
('sweet-potato', 'Sweet Potato', 86, 1.6, 20, 0.1, 'per 100g', 'carb', 'lunchCarbs', NULL, NULL),

-- =============================================
-- VEGETABLES - Per 100g (raw)
-- =============================================

-- Broccoli - 34 kcal/100g
('broccoli', 'Broccoli', 34, 2.8, 7, 0.4, 'per 100g', 'vegetable', 'lunchVegetables', NULL, NULL),

-- Spinach - 23 kcal/100g
('spinach', 'Spinach', 23, 2.9, 3.6, 0.4, 'per 100g', 'vegetable', 'lunchVegetables', NULL, NULL),

-- Green Beans - 31 kcal/100g
('green-beans', 'Green Beans', 31, 1.8, 7, 0.1, 'per 100g', 'vegetable', 'lunchVegetables', NULL, NULL),

-- Zucchini - 17 kcal/100g
('zucchini', 'Zucchini', 17, 1.2, 3.1, 0.3, 'per 100g', 'vegetable', 'lunchVegetables', NULL, NULL),

-- Cauliflower - 25 kcal/100g
('cauliflower', 'Cauliflower', 25, 1.9, 5, 0.3, 'per 100g', 'vegetable', 'dinnerVegetables', NULL, NULL),

-- Asparagus - 20 kcal/100g
('asparagus', 'Asparagus', 20, 2.2, 3.9, 0.1, 'per 100g', 'vegetable', 'dinnerVegetables', NULL, NULL),

-- Bell Peppers - 28 kcal/100g
('bell-peppers', 'Bell Peppers', 28, 1, 6, 0.3, 'per 100g', 'vegetable', 'lunchVegetables', NULL, NULL),

-- Mushrooms - 22 kcal/100g
('mushrooms', 'Mushrooms', 22, 3.1, 3.3, 0.3, 'per 100g', 'vegetable', 'dinnerVegetables', NULL, NULL),

-- Tomatoes - 18 kcal/100g
('tomatoes', 'Tomatoes', 18, 0.9, 3.9, 0.2, 'per 100g', 'vegetable', 'lunchVegetables', NULL, NULL),

-- Cucumber - 16 kcal/100g
('cucumber', 'Cucumber', 16, 0.7, 3.6, 0.1, 'per 100g', 'vegetable', 'lunchVegetables', NULL, NULL),

-- Mixed Salad Leaves - 20 kcal/100g
('mixed-salad', 'Mixed Salad Leaves', 20, 1.5, 3.5, 0.2, 'per 100g', 'vegetable', 'lunchVegetables', NULL, NULL),

-- Onion - 40 kcal/100g
('onion', 'Onion', 40, 1.1, 9, 0.1, 'per 100g', 'vegetable', 'lunchVegetables', NULL, NULL),

-- =============================================
-- FATS - Per 100g/100ml
-- =============================================

-- Olive Oil - 884 kcal/100ml
('olive-oil', 'Olive Oil', 884, 0, 0, 100, 'per 100ml', 'fat', 'fats', NULL, NULL),

-- Butter - 717 kcal/100g
('butter', 'Butter', 717, 0.9, 0.1, 81, 'per 100g', 'fat', 'fats', 5, 'teaspoon'),

-- Avocado - 160 kcal/100g
('avocado', 'Avocado', 160, 2, 9, 15, 'per 100g', 'fat', 'fats', 150, 'avocado'),

-- Almonds - 579 kcal/100g
('almonds', 'Almonds', 579, 21, 22, 50, 'per 100g', 'fat', 'fats', NULL, NULL),

-- Peanut Butter - 588 kcal/100g
('peanut-butter', 'Peanut Butter', 588, 25, 20, 50, 'per 100g', 'fat', 'fats', NULL, NULL),

-- =============================================
-- SUPPLEMENTS/MISC - Per 100g
-- =============================================

-- Whey Protein Powder - 400 kcal/100g (approx)
('whey-protein', 'Whey Protein Powder', 400, 80, 8, 5, 'per 100g', 'protein', 'snackProteins', 30, 'scoop'),

-- Honey - 304 kcal/100g
('honey', 'Honey', 304, 0.3, 82, 0, 'per 100g', 'carb', 'breakfastCarbs', 21, 'tablespoon'),

-- Berries (Mixed) - 57 kcal/100g
('berries', 'Mixed Berries', 57, 0.7, 14, 0.3, 'per 100g', 'vegetable', 'snackProteins', NULL, NULL),

-- Protein Bar (average) - 350 kcal/100g
('protein-bar', 'Protein Bar', 350, 33, 35, 10, 'per 100g', 'protein', 'snackProteins', 60, 'bar'),

-- Crackers - 450 kcal/100g
('crackers', 'Crackers', 450, 10, 60, 20, 'per 100g', 'carb', 'snackProteins', 4, 'cracker');

-- =============================================
-- Add foods to additional categories
-- (Allow same ingredient to appear in multiple meal categories)
-- =============================================

INSERT INTO public.food_category_assignments (food_id, food_source, category) VALUES
-- Chicken available in dinner too
('chicken-breast', 'foods', 'dinnerProteins'),
-- Turkey available in dinner
('turkey-breast', 'foods', 'dinnerProteins'),
-- Salmon available in dinner
('salmon', 'foods', 'dinnerProteins'),
-- White fish available in dinner
('white-fish', 'foods', 'dinnerProteins'),
-- Tuna available in dinner
('tuna-steak', 'foods', 'dinnerProteins'),
-- Beef available in dinner
('beef-lean', 'foods', 'dinnerProteins'),
-- Pork available in dinner
('pork-tenderloin', 'foods', 'dinnerProteins'),
-- Prawns available in dinner
('prawns', 'foods', 'dinnerProteins'),
-- Eggs available in snacks
('egg', 'foods', 'snackProteins'),
-- Greek yogurt available in snacks
('greek-yogurt-0', 'foods', 'snackProteins'),
('greek-yogurt-2', 'foods', 'snackProteins'),
-- Broccoli available in dinner
('broccoli', 'foods', 'dinnerVegetables'),
-- Spinach available in dinner
('spinach', 'foods', 'dinnerVegetables'),
-- Green beans available in dinner
('green-beans', 'foods', 'dinnerVegetables'),
-- Zucchini available in dinner
('zucchini', 'foods', 'dinnerVegetables'),
-- Bell peppers available in dinner
('bell-peppers', 'foods', 'dinnerVegetables');

-- =============================================
-- MEALS - Default meal structure
-- =============================================

INSERT INTO public.meals (id, slot, label, target_calories, target_protein, notes) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'breakfast', 'Breakfast', 400, 30, 'Protein + carbs to start the day'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'snack1', 'Morning Snack', 200, 25, 'High protein snack'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'lunch', 'Lunch', 700, 80, '400g protein + carbs + vegetables'),
('d4e5f6a7-b8c9-0123-defa-234567890123', 'snack2', 'Afternoon Snack', 200, 25, 'High protein snack'),
('e5f6a7b8-c9d0-1234-efab-345678901234', 'dinner', 'Dinner', 450, 50, '200g protein + vegetables (no carbs)');

-- =============================================
-- MEAL FOODS - Default compositions with quantities
-- =============================================

-- Breakfast: 3 eggs (150g) + 2 slices toast (60g) = ~390 cal, ~28g protein
INSERT INTO public.meal_foods (meal_id, food_id, quantity, quantity_type) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'egg', 3, 'pieces'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'bread-wholegrain', 2, 'pieces');

-- Morning Snack: 200g cottage cheese = ~196 cal, ~22g protein
INSERT INTO public.meal_foods (meal_id, food_id, quantity, quantity_type) VALUES
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'cottage-cheese', 200, 'grams');

-- Lunch: 400g chicken + 80g rice (dry) + 200g broccoli + 10ml oil = ~928 cal, ~104g protein
INSERT INTO public.meal_foods (meal_id, food_id, quantity, quantity_type) VALUES
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'chicken-breast', 400, 'grams'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'rice-white', 80, 'grams'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'broccoli', 200, 'grams'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'olive-oil', 10, 'grams');

-- Afternoon Snack: 1 scoop protein + 200ml skim milk = ~190 cal, ~31g protein
INSERT INTO public.meal_foods (meal_id, food_id, quantity, quantity_type) VALUES
('d4e5f6a7-b8c9-0123-defa-234567890123', 'whey-protein', 1, 'pieces'),
('d4e5f6a7-b8c9-0123-defa-234567890123', 'skim-milk', 200, 'grams');

-- Dinner: 200g chicken + 300g broccoli + 10ml oil = ~380 cal, ~52g protein
INSERT INTO public.meal_foods (meal_id, food_id, quantity, quantity_type) VALUES
('e5f6a7b8-c9d0-1234-efab-345678901234', 'chicken-breast', 200, 'grams'),
('e5f6a7b8-c9d0-1234-efab-345678901234', 'broccoli', 300, 'grams'),
('e5f6a7b8-c9d0-1234-efab-345678901234', 'olive-oil', 10, 'grams');

-- =============================================
-- MEAL OPTIONS - Pre-defined meal combinations
-- =============================================

-- Breakfast options
INSERT INTO public.meal_options (slot, name, foods, created_by) VALUES
('breakfast', '3 Eggs + 2 Toast', 
 '[{"id":"egg","name":"Egg (Whole)","caloriesPer100g":143,"proteinPer100g":13,"carbsPer100g":1,"fatPer100g":10,"pieceWeightGrams":50,"pieceName":"egg","category":"protein","quantity":3,"quantityType":"pieces","calories":215,"protein":20,"carbs":2,"fat":15},{"id":"bread-wholegrain","name":"Whole Grain Bread","caloriesPer100g":247,"proteinPer100g":13,"carbsPer100g":41,"fatPer100g":4,"pieceWeightGrams":30,"pieceName":"slice","category":"carb","quantity":2,"quantityType":"pieces","calories":148,"protein":8,"carbs":25,"fat":2}]'::jsonb,
 NULL),
('breakfast', '4 Eggs + 1 Toast',
 '[{"id":"egg","name":"Egg (Whole)","caloriesPer100g":143,"proteinPer100g":13,"carbsPer100g":1,"fatPer100g":10,"pieceWeightGrams":50,"pieceName":"egg","category":"protein","quantity":4,"quantityType":"pieces","calories":286,"protein":26,"carbs":2,"fat":20},{"id":"bread-wholegrain","name":"Whole Grain Bread","caloriesPer100g":247,"proteinPer100g":13,"carbsPer100g":41,"fatPer100g":4,"pieceWeightGrams":30,"pieceName":"slice","category":"carb","quantity":1,"quantityType":"pieces","calories":74,"protein":4,"carbs":12,"fat":1}]'::jsonb,
 NULL),
('breakfast', 'Oats + Greek Yogurt',
 '[{"id":"oats","name":"Oats (dry)","caloriesPer100g":389,"proteinPer100g":17,"carbsPer100g":66,"fatPer100g":7,"category":"carb","quantity":50,"quantityType":"grams","calories":195,"protein":9,"carbs":33,"fat":4},{"id":"greek-yogurt-0","name":"Greek Yogurt (0% fat)","caloriesPer100g":59,"proteinPer100g":10,"carbsPer100g":4,"fatPer100g":0,"category":"dairy","quantity":150,"quantityType":"grams","calories":89,"protein":15,"carbs":6,"fat":0}]'::jsonb,
 NULL),

-- Snack options
('snack', '200g Cottage Cheese',
 '[{"id":"cottage-cheese","name":"Cottage Cheese","caloriesPer100g":98,"proteinPer100g":11,"carbsPer100g":3,"fatPer100g":4,"category":"dairy","quantity":200,"quantityType":"grams","calories":196,"protein":22,"carbs":6,"fat":8}]'::jsonb,
 NULL),
('snack', 'Protein Shake + Milk',
 '[{"id":"whey-protein","name":"Whey Protein Powder","caloriesPer100g":400,"proteinPer100g":80,"carbsPer100g":8,"fatPer100g":5,"pieceWeightGrams":30,"pieceName":"scoop","category":"protein","quantity":1,"quantityType":"pieces","calories":120,"protein":24,"carbs":2,"fat":2},{"id":"skim-milk","name":"Skim Milk","caloriesPer100g":35,"proteinPer100g":3.5,"carbsPer100g":5,"fatPer100g":0.1,"category":"dairy","quantity":200,"quantityType":"grams","calories":70,"protein":7,"carbs":10,"fat":0}]'::jsonb,
 NULL),
('snack', '150g Greek Yogurt + Berries',
 '[{"id":"greek-yogurt-0","name":"Greek Yogurt (0% fat)","caloriesPer100g":59,"proteinPer100g":10,"carbsPer100g":4,"fatPer100g":0,"category":"dairy","quantity":150,"quantityType":"grams","calories":89,"protein":15,"carbs":6,"fat":0},{"id":"berries","name":"Mixed Berries","caloriesPer100g":57,"proteinPer100g":0.7,"carbsPer100g":14,"fatPer100g":0.3,"category":"vegetable","quantity":50,"quantityType":"grams","calories":29,"protein":0,"carbs":7,"fat":0}]'::jsonb,
 NULL),
('snack', '2 Boiled Eggs',
 '[{"id":"egg","name":"Egg (Whole)","caloriesPer100g":143,"proteinPer100g":13,"carbsPer100g":1,"fatPer100g":10,"pieceWeightGrams":50,"pieceName":"egg","category":"protein","quantity":2,"quantityType":"pieces","calories":143,"protein":13,"carbs":1,"fat":10}]'::jsonb,
 NULL);

-- =============================================
-- REFERENCE: Common per-100g values for manual entry
-- =============================================
-- 
-- PROTEINS (raw):
-- Chicken Breast: 120 cal, 23g protein, 0g carbs, 2.6g fat
-- Salmon: 208 cal, 20g protein, 0g carbs, 13g fat
-- Lean Beef: 150 cal, 22g protein, 0g carbs, 7g fat
-- Eggs: 143 cal, 13g protein, 1g carbs, 10g fat (1 egg = 50g)
-- Whey Protein: 400 cal, 80g protein, 8g carbs, 5g fat (1 scoop = 30g)
--
-- CARBS (dry):
-- White Rice: 360 cal, 7g protein, 79g carbs, 0.6g fat
-- Oats: 389 cal, 17g protein, 66g carbs, 7g fat
-- Bread: 247 cal, 13g protein, 41g carbs, 4g fat (1 slice = 30g)
--
-- VEGETABLES:
-- Broccoli: 34 cal, 2.8g protein, 7g carbs, 0.4g fat
-- Spinach: 23 cal, 2.9g protein, 3.6g carbs, 0.4g fat
--
-- FATS:
-- Olive Oil: 884 cal, 0g protein, 0g carbs, 100g fat
-- Avocado: 160 cal, 2g protein, 9g carbs, 15g fat
-- =============================================
