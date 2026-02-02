-- FIX: Remove recursive policy and use simple, non-recursive approach
-- Error 42P17 = infinite recursion in policy

-- 1. Drop ALL existing policies
DROP POLICY IF EXISTS "allow_select_own" ON public.users;
DROP POLICY IF EXISTS "allow_staff_select_all" ON public.users;
DROP POLICY IF EXISTS "allow_insert_own" ON public.users;
DROP POLICY IF EXISTS "allow_update_own" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Staff and Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- 2. Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Create ONLY simple policies (no subqueries on same table!)
-- Allow any authenticated user to see their own row
CREATE POLICY "select_own_profile" ON public.users 
FOR SELECT 
USING (auth.uid() = auth_id);

-- Allow inserting own profile
CREATE POLICY "insert_own_profile" ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = auth_id);

-- Allow updating own profile  
CREATE POLICY "update_own_profile" ON public.users 
FOR UPDATE 
USING (auth.uid() = auth_id);

-- For staff to see all users, we use a SECURITY DEFINER function instead
-- This avoids recursion. Create the function:
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid() 
    AND role IN ('staff', 'admin')
  );
$$;

-- Now create staff policy using the function
CREATE POLICY "staff_select_all" ON public.users 
FOR SELECT 
USING (public.is_staff_or_admin());
