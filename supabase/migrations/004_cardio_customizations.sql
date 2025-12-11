-- =============================================
-- ADD CARDIO CUSTOMIZATION TO USER WORKOUT CUSTOMIZATIONS
-- Adds ability to customize cardio type per day per week
-- =============================================

-- Add cardio_customization column to store selected cardio type
ALTER TABLE public.user_workout_customizations
ADD COLUMN IF NOT EXISTS cardio_customization TEXT CHECK (cardio_customization IN ('elliptical', 'incline_walk', 'stair_climber', 'hiit'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_workout_customizations_cardio 
  ON public.user_workout_customizations(cardio_customization) 
  WHERE cardio_customization IS NOT NULL;

