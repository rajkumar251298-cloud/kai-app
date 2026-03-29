-- Row Level Security: run in Supabase SQL Editor against your project.
-- Adjust table/column names if your schema differs.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own checkins"
ON checkins FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins"
ON checkins FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins"
ON checkins FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own goals"
ON goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
ON goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
ON goals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
ON goals FOR DELETE
USING (auth.uid() = user_id);
