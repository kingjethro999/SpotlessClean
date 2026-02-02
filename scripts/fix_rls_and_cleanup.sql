-- 1. Fix RLS: Allow users to insert their own profile
-- This allows the public.users table to accept inserts where the auth_id matches the authenticated user.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

CREATE POLICY "Users can insert their own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = auth_id);

-- 2. Cleanup: Delete the "zombie" user
-- Replace 'jethrojerrybj@gmail.com' with the actual email if different.
-- This deletes the user from the auth.users table, which cascades to wipe out any partial data,
-- allowing you to register again from scratch.
DELETE FROM auth.users WHERE email = 'jethrojerrybj@gmail.com';
