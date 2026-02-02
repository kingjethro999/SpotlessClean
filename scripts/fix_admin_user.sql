-- Link Admin/Staff User Correctly
-- This script ensures that the user with the specified email has a corresponding
-- entry in the public.users table with the CORRECT auth_id from auth.users.

DO $$
DECLARE
  v_auth_id uuid;
  v_email text := 'admin123acct@gmail.com'; -- The email causing issues
  v_full_name text := 'Admin Staff';
BEGIN
  -- 1. Get the current Auth ID for this email
  SELECT id INTO v_auth_id FROM auth.users WHERE email = v_email;

  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'User % not found in auth.users. Please register this user first in the Auth tab or via the registration page.', v_email;
  END IF;

  -- 2. Upsert into public.users
  -- This updates the auth_id to match (critical fix) and ensures role is 'staff'
  INSERT INTO public.users (auth_id, email, full_name, role)
  VALUES (v_auth_id, v_email, v_full_name, 'staff')
  ON CONFLICT (email) DO UPDATE
  SET 
    auth_id = EXCLUDED.auth_id,
    role = 'staff',
    updated_at = NOW();
    
  RAISE NOTICE 'Successfully linked user % (Auth ID: %) to public profile.', v_email, v_auth_id;
END $$;
