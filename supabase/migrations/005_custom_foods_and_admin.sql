-- Migration: Add admin access and custom foods table
-- This migration adds:
-- 1. is_admin column to user_profiles for admin-only access control
-- 2. custom_foods table for user-created ingredients added to global food bank

-- Add admin column to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Custom foods table for user-created ingredients
CREATE TABLE IF NOT EXISTS custom_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein NUMERIC(6,1) NOT NULL,
  carbs NUMERIC(6,1) NOT NULL,
  fat NUMERIC(6,1) NOT NULL,
  portion TEXT NOT NULL,
  raw_weight INTEGER,
  cooked_weight INTEGER,
  category TEXT NOT NULL DEFAULT 'protein',
  food_bank_category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on custom_foods
ALTER TABLE custom_foods ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read custom foods (they're global)
CREATE POLICY "Anyone can read custom foods" ON custom_foods
  FOR SELECT USING (true);

-- Policy: Only admins can insert custom foods
CREATE POLICY "Admins can insert custom foods" ON custom_foods
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can update custom foods
CREATE POLICY "Admins can update custom foods" ON custom_foods
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can delete custom foods
CREATE POLICY "Admins can delete custom foods" ON custom_foods
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Create index for faster lookups by food_bank_category
CREATE INDEX IF NOT EXISTS idx_custom_foods_category ON custom_foods(food_bank_category);

-- After running this migration, manually set your user as admin:
-- UPDATE user_profiles SET is_admin = true WHERE user_id = 'your-user-id';
