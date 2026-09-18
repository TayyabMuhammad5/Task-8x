-- ============================================
-- Higgsfield Clone — Supabase Database Setup
-- Paste this entire file into Supabase SQL Editor and click "Run"
-- ============================================

-- 1. Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  credits INTEGER DEFAULT 50 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits)
  VALUES (NEW.id, NEW.email, 50);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Generations table
CREATE TABLE public.generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'seedance-2.5',
  mode TEXT NOT NULL DEFAULT 'video',
  status TEXT NOT NULL DEFAULT 'pending',
  result_url TEXT,
  aspect_ratio TEXT DEFAULT '16:9',
  credit_cost INTEGER NOT NULL DEFAULT 45,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own generations"
  ON public.generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own generations"
  ON public.generations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own generations"
  ON public.generations FOR UPDATE USING (auth.uid() = user_id);

-- 5. Atomic credit deduction function
CREATE OR REPLACE FUNCTION public.deduct_credits(cost INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET credits = credits - cost
  WHERE id = auth.uid() AND credits >= cost;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
