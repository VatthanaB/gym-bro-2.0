# Supabase Setup Guide for Gym Bro 2.0

This guide will help you connect Gym Bro to Supabase for cloud storage and user authentication.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in:
   - Project name: `gym-bro` (or your choice)
   - Database password: Generate a strong password (save it somewhere safe)
   - Region: Choose the closest to you
4. Click **"Create new project"** and wait for it to provision (~2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings > API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## Step 3: Configure Environment Variables

Create a file named `.env.local` in the `gym-bro-2.0` folder:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key-here
```

Replace the values with your actual keys from Step 2.

## Step 4: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **"Run"** to create all tables and policies

## Step 5: Seed the Database with Exercise & Meal Data

1. Still in the SQL Editor, create a new query
2. Copy and paste the contents of `supabase/seed.sql`
3. Click **"Run"** to populate exercises, foods, meals, and workout templates

## Step 6: Configure Authentication

1. Go to **Authentication > Providers**
2. Ensure **Email** provider is enabled
3. (Optional) Configure email templates in **Authentication > Email Templates**

## Step 7: Run the App

```bash
npm run dev
```

Visit `http://localhost:3000` - you should be redirected to the login page!

## Troubleshooting

### "Your project's URL and API key are required"
- Make sure `.env.local` exists and has the correct values
- Restart the dev server after creating/modifying `.env.local`

### Database errors
- Check that you ran both SQL files in order (schema first, then seed)
- Verify tables exist in **Table Editor** in Supabase dashboard

### Authentication not working
- Verify Email provider is enabled in Supabase Authentication settings
- Check browser console for specific error messages

## Database Schema Overview

| Table | Description |
|-------|-------------|
| `exercises` | All exercise definitions (45 exercises) |
| `foods` | Food database with nutrition info |
| `meals` | Default meal templates |
| `meal_foods` | Links meals to their foods |
| `workout_templates` | Weekly workout schedule |
| `workout_template_exercises` | Links workouts to exercises |
| `user_profiles` | User settings (auto-created on signup) |
| `workout_logs` | User's workout history |
| `weight_entries` | User's weight tracking |
| `user_meal_preferences` | User's customized meals |

## Row Level Security (RLS)

All user data tables have RLS enabled:
- Users can only see/modify their own data
- Reference data (exercises, foods, meals, templates) is readable by everyone
- Only Supabase admin can modify reference data

