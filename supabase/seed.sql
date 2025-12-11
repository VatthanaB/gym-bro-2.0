-- =============================================
-- GYM BRO 2.0 - SEED DATA
-- Run this AFTER the migration
-- Updated for 1,900 cal / 170g protein plan
-- =============================================

-- =============================================
-- EXERCISES - UPPER BODY
-- =============================================

INSERT INTO public.exercises (id, name, category, muscle_group, body_section, sets, reps, rest_seconds, form_cues, why, starting_weight, weight_unit) VALUES
-- BIG MOVEMENTS - PUSH
('db-bench-press', 'Dumbbell Bench Press', 'big', 'push', 'upper', 3, '8-10', 150, 
  ARRAY['Feet flat on floor', 'Squeeze shoulder blades together', 'Lower to chest, press up smoothly'],
  'Builds chest, shoulders, triceps. Foundation movement.', 15, 'kg'),
('bb-bench-press', 'Barbell Bench Press', 'big', 'push', 'upper', 3, '8-10', 150,
  ARRAY['Grip slightly wider than shoulder width', 'Keep wrists straight', 'Touch chest, don''t bounce'],
  'Primary chest builder. Allows heavier loading than dumbbells.', 40, 'kg'),
('db-overhead-press', 'Dumbbell Overhead Press', 'big', 'push', 'upper', 3, '8-10', 150,
  ARRAY['Core tight throughout', 'Press straight up, not forward', 'Don''t arch lower back excessively'],
  'Builds shoulder strength and stability.', 10, 'kg'),
('bb-overhead-press', 'Barbell Overhead Press', 'big', 'push', 'upper', 3, '8-10', 150,
  ARRAY['Start at collarbone level', 'Lock out at top', 'Squeeze glutes for stability'],
  'Compound shoulder movement for strength.', 30, 'kg'),

-- BIG MOVEMENTS - PULL
('lat-pulldown', 'Lat Pulldown', 'big', 'pull', 'upper', 3, '10-12', 90,
  ARRAY['Lean back slightly (~15°)', 'Pull to upper chest, not behind neck', 'Squeeze shoulder blades at bottom'],
  'Develops back width, helps with posture from desk work.', 40, 'kg'),
('bb-row', 'Barbell Row', 'big', 'pull', 'upper', 3, '8-10', 120,
  ARRAY['Hinge at hips, back flat', 'Pull to lower chest/upper abs', 'Control the weight down'],
  'Builds back thickness and strength.', 40, 'kg'),

-- MEDIUM MOVEMENTS
('cable-rows', 'Cable Rows', 'medium', 'pull', 'upper', 3, '10-12', 90,
  ARRAY['Sit tall, don''t round back', 'Pull to belly button', 'Squeeze shoulder blades together'],
  'Great for back development and posture correction.', 30, 'kg'),
('db-rows', 'Dumbbell Rows', 'medium', 'pull', 'upper', 3, '10-12', 90,
  ARRAY['Support with non-working hand', 'Pull elbow to hip', 'Keep torso stable'],
  'Unilateral work to fix imbalances.', 15, 'kg'),
('incline-db-press', 'Incline Dumbbell Press', 'medium', 'push', 'upper', 3, '10-12', 90,
  ARRAY['Set bench to 30-45 degrees', 'Lower to upper chest', 'Press up and slightly in'],
  'Targets upper chest, builds full chest development.', 12, 'kg'),
('face-pulls', 'Face Pulls', 'medium', 'pull', 'upper', 3, '12-15', 60,
  ARRAY['Pull to face level', 'Externally rotate at end', 'Keep elbows high'],
  'Essential for shoulder health and posture.', 15, 'kg'),

-- SMALL MOVEMENTS
('bicep-curls', 'Bicep Curls', 'small', 'isolation', 'upper', 2, '12-15', 60,
  ARRAY['Keep elbows still', 'Control the weight down (don''t drop)', 'No swinging'],
  'Isolation for arms, builds confidence.', 8, 'kg'),
('hammer-curls', 'Hammer Curls', 'small', 'isolation', 'upper', 2, '12-15', 60,
  ARRAY['Palms facing each other', 'Keep elbows at sides', 'Controlled tempo'],
  'Targets brachialis and forearms.', 8, 'kg'),
('tricep-pushdowns', 'Tricep Pushdowns', 'small', 'isolation', 'upper', 2, '12-15', 60,
  ARRAY['Elbows locked at sides', 'Fully extend at bottom', 'Control the return'],
  'Builds tricep strength for pressing movements.', 20, 'kg'),
('overhead-tricep-ext', 'Overhead Tricep Extension', 'small', 'isolation', 'upper', 2, '12-15', 60,
  ARRAY['Keep elbows pointed forward', 'Lower behind head', 'Extend fully at top'],
  'Stretches long head of tricep for full development.', 15, 'kg'),
('lateral-raises', 'Lateral Raises', 'small', 'isolation', 'upper', 2, '12-15', 60,
  ARRAY['Slight bend in elbows', 'Raise to shoulder height', 'Lead with pinkies slightly up'],
  'Builds shoulder width and capped look.', 6, 'kg'),
('rear-delt-flyes', 'Rear Delt Flyes', 'small', 'isolation', 'upper', 2, '12-15', 60,
  ARRAY['Bend at hips', 'Squeeze shoulder blades', 'Light weight, focus on contraction'],
  'Balances shoulder development, improves posture.', 5, 'kg'),

-- =============================================
-- EXERCISES - LOWER BODY
-- =============================================

-- BIG MOVEMENTS - SQUAT
('goblet-squat', 'Goblet Squat', 'big', 'squat', 'lower', 3, '8-10', 120,
  ARRAY['Hold weight at chest', 'Sit back and down', 'Knees track over toes'],
  'Teaches proper squat mechanics with counterbalance.', 16, 'kg'),
('leg-press', 'Leg Press', 'big', 'squat', 'lower', 3, '10-12', 120,
  ARRAY['Feet shoulder width apart', 'Lower until thighs touch belly', 'Don''t lock knees at top'],
  'Safe way to load legs heavily without spinal stress.', 70, 'kg'),
('bb-back-squat', 'Barbell Back Squat', 'big', 'squat', 'lower', 3, '8-10', 150,
  ARRAY['Bar on upper traps', 'Brace core hard', 'Squat to parallel or below'],
  'King of lower body exercises. Full body strength builder.', 40, 'kg'),

-- BIG MOVEMENTS - HINGE
('romanian-deadlift', 'Romanian Deadlift', 'big', 'hinge', 'lower', 3, '8-10', 120,
  ARRAY['Slight knee bend, push hips back', 'Keep bar close to legs', 'Feel stretch in hamstrings'],
  'Builds hamstrings and glutes, essential for back health.', 20, 'kg'),
('conventional-deadlift', 'Conventional Deadlift', 'big', 'hinge', 'lower', 3, '6-8', 180,
  ARRAY['Bar over mid-foot', 'Chest up, back flat', 'Push floor away with legs'],
  'Ultimate full-body strength builder.', 60, 'kg'),
('trap-bar-deadlift', 'Trap Bar Deadlift', 'big', 'hinge', 'lower', 3, '8-10', 150,
  ARRAY['Stand in center of trap bar', 'Grip neutral handles', 'Stand straight up'],
  'More quad-dominant, easier on lower back.', 60, 'kg'),

-- MEDIUM MOVEMENTS
('lunges', 'Lunges', 'medium', 'squat', 'lower', 3, '10-12 each leg', 90,
  ARRAY['Step forward with control', 'Knee tracks over toes', 'Push back to start'],
  'Unilateral work for balance and strength.', NULL, 'bodyweight'),
('bulgarian-split-squat', 'Bulgarian Split Squat', 'medium', 'squat', 'lower', 3, '10-12 each leg', 90,
  ARRAY['Rear foot on bench', 'Lower straight down', 'Keep torso upright'],
  'Single leg strength and stability.', NULL, 'bodyweight'),
('step-ups', 'Step Ups', 'medium', 'squat', 'lower', 3, '10-12 each leg', 90,
  ARRAY['Drive through front heel', 'Stand fully at top', 'Control the descent'],
  'Functional single leg power.', NULL, 'bodyweight'),

-- SMALL MOVEMENTS
('leg-curls', 'Leg Curls', 'small', 'isolation', 'lower', 3, '12-15', 60,
  ARRAY['Control the movement', 'Full range of motion', 'Don''t lift hips'],
  'Isolates hamstrings for balance with quads.', 20, 'kg'),
('leg-extensions', 'Leg Extensions', 'small', 'isolation', 'lower', 3, '12-15', 60,
  ARRAY['Full extension at top', 'Control the descent', 'Keep back against pad'],
  'Quad isolation for definition.', 25, 'kg'),
('calf-raises', 'Calf Raises', 'small', 'calves', 'lower', 3, '15-20', 60,
  ARRAY['Full stretch at bottom', 'Pause at top', 'Control the negative'],
  'Builds lower leg strength and aesthetics.', 30, 'kg'),
('hip-thrusts', 'Hip Thrusts', 'small', 'isolation', 'lower', 3, '12-15', 60,
  ARRAY['Upper back on bench', 'Drive through heels', 'Squeeze glutes at top'],
  'Best glute isolation exercise.', 40, 'kg');

-- =============================================
-- FOODS - Updated for 1,900 cal / 170g protein plan
-- =============================================

INSERT INTO public.foods (id, name, calories, protein, carbs, fat, portion, raw_weight, cooked_weight, category, food_bank_category) VALUES
-- Breakfast proteins (for individual swapping)
('eggs-2', 'Whole Eggs', 144, 13, 1, 10, '2 eggs', 100, 100, 'protein', 'breakfastProteins'),
('eggs-3', 'Whole Eggs', 216, 19, 1, 14, '3 eggs', 150, 150, 'protein', 'breakfastProteins'),
('greek-yogurt-100', 'Greek Yogurt (0%)', 65, 10, 4, 0, '100g', 100, 100, 'dairy', 'breakfastProteins'),

-- Breakfast carbs (smaller portions for 1,900 cal plan)
('toast-1', 'Whole Grain Toast', 74, 4, 12, 1, '1 slice', 30, 30, 'carb', 'breakfastCarbs'),
('toast-half', 'Whole Grain Toast', 37, 2, 6, 1, '½ slice', 15, 15, 'carb', 'breakfastCarbs'),
('oats-40', 'Oats', 156, 7, 27, 3, '40g dry', 40, 120, 'carb', 'breakfastCarbs'),

-- Lunch proteins (300g raw)
('chicken-300', 'Chicken Breast', 345, 69, 0, 8, '300g raw / 225g cooked', 300, 225, 'protein', 'lunchProteins'),
('salmon-300', 'Salmon Fillet', 618, 61, 0, 40, '300g raw / 255g cooked', 300, 255, 'protein', 'lunchProteins'),
('tuna-steak-300', 'Tuna Steak', 432, 70, 0, 15, '300g raw / 255g cooked', 300, 255, 'protein', 'lunchProteins'),
('beef-lean-300', 'Lean Beef', 450, 66, 0, 21, '300g raw / 225g cooked', 300, 225, 'protein', 'lunchProteins'),
('turkey-300', 'Turkey Breast', 333, 72, 0, 5, '300g raw / 225g cooked', 300, 225, 'protein', 'lunchProteins'),
('fish-white-300', 'White Fish (Cod/Haddock)', 246, 54, 0, 2, '300g raw / 255g cooked', 300, 255, 'protein', 'lunchProteins'),
('prawns-300', 'Prawns', 255, 60, 0, 2, '300g raw / 270g cooked', 300, 270, 'protein', 'lunchProteins'),

-- Dinner proteins (150g raw)
('chicken-150', 'Chicken Breast', 173, 35, 0, 4, '150g raw / 113g cooked', 150, 113, 'protein', 'dinnerProteins'),
('salmon-150', 'Salmon Fillet', 309, 31, 0, 20, '150g raw / 128g cooked', 150, 128, 'protein', 'dinnerProteins'),
('fish-white-150', 'White Fish (Cod/Haddock)', 123, 27, 0, 1, '150g raw / 128g cooked', 150, 128, 'protein', 'dinnerProteins'),
('beef-lean-150', 'Lean Beef/Steak', 225, 33, 0, 10, '150g raw / 113g cooked', 150, 113, 'protein', 'dinnerProteins'),
('pork-tenderloin-150', 'Pork Tenderloin', 183, 33, 0, 5, '150g raw / 128g cooked', 150, 128, 'protein', 'dinnerProteins'),
('turkey-150', 'Turkey Breast', 167, 36, 0, 3, '150g raw / 113g cooked', 150, 113, 'protein', 'dinnerProteins'),

-- Lunch carbs (70g dry or 200g potato)
('rice-70', 'Rice (White or Brown)', 252, 5, 55, 1, '70g dry / 210g cooked', 70, 210, 'carb', 'lunchCarbs'),
('pasta-70', 'Pasta', 260, 9, 52, 1, '70g dry / 175g cooked', 70, 175, 'carb', 'lunchCarbs'),
('potato-200', 'Potatoes', 154, 4, 35, 0, '200g raw / 185g cooked', 200, 185, 'carb', 'lunchCarbs'),
('quinoa-70', 'Quinoa', 258, 10, 45, 4, '70g dry / 210g cooked', 70, 210, 'carb', 'lunchCarbs'),
('couscous-70', 'Couscous', 263, 9, 54, 0, '70g dry / 175g cooked', 70, 175, 'carb', 'lunchCarbs'),

-- Lunch vegetables (200g raw)
('broccoli-200', 'Broccoli', 68, 6, 13, 1, '200g raw / 170g cooked', 200, 170, 'vegetable', 'lunchVegetables'),
('mixed-salad-200', 'Mixed Salad', 40, 3, 7, 0, '200g', 200, 200, 'vegetable', 'lunchVegetables'),
('peppers-onions-200', 'Peppers + Onions', 66, 2, 15, 0, '200g raw / 170g cooked', 200, 170, 'vegetable', 'lunchVegetables'),
('zucchini-200', 'Zucchini', 34, 2, 6, 1, '200g raw / 170g cooked', 200, 170, 'vegetable', 'lunchVegetables'),
('tomato-cucumber-200', 'Tomatoes + Cucumber', 33, 2, 8, 0, '200g', 200, 200, 'vegetable', 'lunchVegetables'),
('green-beans-200', 'Green Beans', 62, 4, 14, 0, '200g raw / 170g cooked', 200, 170, 'vegetable', 'lunchVegetables'),
('spinach-200', 'Spinach', 46, 6, 7, 1, '200g raw / 60g cooked', 200, 60, 'vegetable', 'lunchVegetables'),

-- Dinner vegetables (300g raw)
('broccoli-300', 'Broccoli', 102, 8, 20, 1, '300g raw / 255g cooked', 300, 255, 'vegetable', 'dinnerVegetables'),
('cauliflower-300', 'Cauliflower', 75, 6, 15, 1, '300g raw / 255g cooked', 300, 255, 'vegetable', 'dinnerVegetables'),
('asparagus-300', 'Asparagus', 60, 7, 12, 0, '300g raw / 255g cooked', 300, 255, 'vegetable', 'dinnerVegetables'),
('zucchini-300', 'Zucchini', 51, 4, 9, 1, '300g raw / 255g cooked', 300, 255, 'vegetable', 'dinnerVegetables'),
('spinach-300', 'Spinach', 69, 9, 11, 1, '300g raw / 90g cooked', 300, 90, 'vegetable', 'dinnerVegetables'),
('green-beans-300', 'Green Beans', 93, 5, 21, 1, '300g raw / 255g cooked', 300, 255, 'vegetable', 'dinnerVegetables'),
('mushrooms-300', 'Mushrooms', 66, 9, 10, 1, '300g raw / 240g cooked', 300, 240, 'vegetable', 'dinnerVegetables'),
('peppers-300', 'Bell Peppers', 84, 3, 18, 1, '300g raw / 255g cooked', 300, 255, 'vegetable', 'dinnerVegetables'),
('mixed-roasted-veg-300', 'Mixed Roasted Veg', 90, 6, 18, 1, '300g raw / 255g cooked', 300, 255, 'vegetable', 'dinnerVegetables'),
('large-salad-300', 'Large Salad', 60, 4, 11, 1, '300g', 300, 300, 'vegetable', 'dinnerVegetables'),

-- Snack proteins (150g portions for 1,900 cal plan)
('cottage-cheese-150', 'Cottage Cheese', 135, 17, 5, 4, '150g', 150, 150, 'dairy', 'snackProteins'),
('cottage-cheese-100', 'Cottage Cheese', 90, 11, 3, 3, '100g', 100, 100, 'dairy', 'snackProteins'),
('greek-yogurt-150', 'Greek Yogurt (0%)', 100, 15, 6, 0, '150g', 150, 150, 'dairy', 'snackProteins'),
('greek-yogurt-50', 'Greek Yogurt (0%)', 33, 5, 2, 0, '50g', 50, 50, 'dairy', 'snackProteins'),
('protein-shake-25', 'Protein Shake', 100, 23, 2, 1, '25g powder + water', 25, 250, 'protein', 'snackProteins'),
('tuna-100', 'Canned Tuna', 110, 24, 0, 1, '100g drained', 100, 100, 'protein', 'snackProteins'),
('boiled-eggs-2', 'Boiled Eggs', 156, 13, 1, 11, '2 eggs', 100, 100, 'protein', 'snackProteins'),

-- Fats - Lunch: 8ml (½ tbsp), Dinner: 5ml (1 tsp)
('olive-oil-8ml', 'Olive Oil (Lunch)', 63, 0, 0, 7, '8ml (½ tbsp)', 8, 8, 'fat', 'fats'),
('olive-oil-5ml', 'Olive Oil (Dinner)', 40, 0, 0, 5, '5ml (1 tsp)', 5, 5, 'fat', 'fats'),
('avocado-half', 'Avocado', 120, 1, 6, 11, '½ avocado', 75, 75, 'fat', 'fats'),
('almonds-30', 'Almonds', 175, 6, 6, 15, '30g', 30, 30, 'fat', 'fats'),
('almonds-5', 'Almonds', 29, 1, 1, 3, '5g', 5, 5, 'fat', 'fats'),
('peanut-butter-1tbsp', 'Peanut Butter', 95, 4, 3, 8, '1 tbsp', 16, 16, 'fat', 'fats'),

-- Additional snack items
('cucumber-100', 'Cucumber', 15, 1, 4, 0, '100g', 100, 100, 'vegetable', 'snackProteins');

-- =============================================
-- MEALS - Updated for 1,900 cal / 170g protein plan
-- =============================================

INSERT INTO public.meals (id, slot, label, target_calories, target_protein, notes) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'breakfast', 'Breakfast', 450, 35, 'Eggs + smaller carb (done in 5 minutes)'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'snack1', 'Morning Snack', 200, 25, 'Optional add: 50g berries or cucumber'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'lunch', 'Lunch', 650, 60, 'PROTEIN + CARB + VEG + OIL - Biggest meal of the day'),
('d4e5f6a7-b8c9-0123-defa-234567890123', 'snack2', 'Afternoon Snack', 200, 25, 'Can swap for cottage cheese, tuna tin, or 2 eggs + nuts'),
('e5f6a7b8-c9d0-1234-efab-345678901234', 'dinner', 'Dinner', 400, 25, 'PROTEIN + VEG ONLY (NO CARBS) - Season heavily with salt, pepper, garlic, herbs');

-- =============================================
-- MEAL FOODS (Default meal compositions for 1,900 cal plan)
-- =============================================

-- Breakfast: 3 eggs + 1 toast (290 cal, 23g protein)
INSERT INTO public.meal_foods (meal_id, food_id) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'eggs-3'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'toast-1');

-- Morning Snack: 150g cottage cheese (135 cal, 17g protein)
INSERT INTO public.meal_foods (meal_id, food_id) VALUES
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'cottage-cheese-150');

-- Lunch: chicken (300g) + rice (70g) + broccoli (200g) + olive oil (8ml)
INSERT INTO public.meal_foods (meal_id, food_id) VALUES
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'chicken-300'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'rice-70'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'broccoli-200'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'olive-oil-8ml');

-- Afternoon Snack: Protein shake (25g powder)
INSERT INTO public.meal_foods (meal_id, food_id) VALUES
('d4e5f6a7-b8c9-0123-defa-234567890123', 'protein-shake-25');

-- Dinner: chicken (150g) + broccoli (300g) + olive oil (5ml)
INSERT INTO public.meal_foods (meal_id, food_id) VALUES
('e5f6a7b8-c9d0-1234-efab-345678901234', 'chicken-150'),
('e5f6a7b8-c9d0-1234-efab-345678901234', 'broccoli-300'),
('e5f6a7b8-c9d0-1234-efab-345678901234', 'olive-oil-5ml');

-- =============================================
-- WORKOUT TEMPLATES
-- =============================================

INSERT INTO public.workout_templates (id, day_of_week, day_name, type, focus, warmup, cardio_type, cardio_duration_minutes, cardio_intensity, cardio_rpe, cardio_notes) VALUES
-- Monday - Upper Body 1
('11111111-1111-1111-1111-111111111111', 1, 'Monday', 'upper', 'Chest and back, horizontal movements',
  ARRAY['5 min light cardio (bike or row)', 'Arm circles, band pull-aparts', '1 light set of push-ups'],
  'elliptical', 15, 'Moderate pace (can talk but slightly breathless)', '6-7/10', 'Use arms actively'),

-- Tuesday - Lower Body 1
('22222222-2222-2222-2222-222222222222', 2, 'Tuesday', 'lower', 'Squat pattern and posterior chain',
  ARRAY['5 min light cardio', 'Bodyweight squats x 10', 'Leg swings front/side'],
  'elliptical', 15, 'Moderate pace (can talk but slightly breathless)', '6-7/10', 'Use arms actively'),

-- Wednesday - Rest
('33333333-3333-3333-3333-333333333333', 3, 'Wednesday', 'rest', 'Recovery and nutrition focus',
  NULL, NULL, NULL, NULL, NULL, NULL),

-- Thursday - Upper Body 2
('44444444-4444-4444-4444-444444444444', 4, 'Thursday', 'upper', 'Shoulders and rowing movements',
  ARRAY['5 min light cardio', 'Shoulder dislocates with band', 'Light overhead press x 10'],
  'incline_walk', 15, '5-6 km/h, 5-10% incline', '5-6/10', 'No handrails, stand tall'),

-- Friday - Lower Body 2
('55555555-5555-5555-5555-555555555555', 5, 'Friday', 'lower', 'Hinge pattern and single leg work',
  ARRAY['5 min light cardio', 'Hip circles', 'Glute bridges x 10'],
  'elliptical', 15, 'Moderate pace (can talk but slightly breathless)', '6-7/10', 'Use arms actively'),

-- Saturday - Cardio/HIIT
('66666666-6666-6666-6666-666666666666', 6, 'Saturday', 'cardio', 'Active recovery or HIIT',
  NULL, 'hiit', 25, '30 sec on / 30 sec off × 20 rounds', '8/10 during work, 4/10 during rest', 'Or 45-60 min easy e-bike ride'),

-- Sunday - Full Rest
('77777777-7777-7777-7777-777777777777', 0, 'Sunday', 'rest', 'Full rest - meal prep for the week',
  NULL, NULL, NULL, NULL, NULL, NULL);

-- =============================================
-- WORKOUT TEMPLATE EXERCISES
-- =============================================

-- Monday exercises
INSERT INTO public.workout_template_exercises (workout_template_id, exercise_id, order_index) VALUES
('11111111-1111-1111-1111-111111111111', 'db-bench-press', 0),
('11111111-1111-1111-1111-111111111111', 'lat-pulldown', 1),
('11111111-1111-1111-1111-111111111111', 'bicep-curls', 2);

-- Tuesday exercises
INSERT INTO public.workout_template_exercises (workout_template_id, exercise_id, order_index) VALUES
('22222222-2222-2222-2222-222222222222', 'goblet-squat', 0),
('22222222-2222-2222-2222-222222222222', 'romanian-deadlift', 1),
('22222222-2222-2222-2222-222222222222', 'leg-curls', 2);

-- Thursday exercises
INSERT INTO public.workout_template_exercises (workout_template_id, exercise_id, order_index) VALUES
('44444444-4444-4444-4444-444444444444', 'db-overhead-press', 0),
('44444444-4444-4444-4444-444444444444', 'cable-rows', 1),
('44444444-4444-4444-4444-444444444444', 'tricep-pushdowns', 2);

-- Friday exercises
INSERT INTO public.workout_template_exercises (workout_template_id, exercise_id, order_index) VALUES
('55555555-5555-5555-5555-555555555555', 'leg-press', 0),
('55555555-5555-5555-5555-555555555555', 'lunges', 1),
('55555555-5555-5555-5555-555555555555', 'leg-extensions', 2);
