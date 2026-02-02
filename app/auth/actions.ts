'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

interface RegisterData {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    origin: string; // Passed from client to know where to redirect for email verification
}

export async function registerUser(data: RegisterData) {
    const { email, password, fullName, phone, origin } = data;

    // 1. Initialize Supabase Client (for Auth with Cookies)
    const supabase = await createClient();

    // 2. Sign Up User (Auth)
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo:
                process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${origin}/auth/callback`,
            data: {
                full_name: fullName,
                phone: phone,
            },
        },
    });

    if (signUpError) {
        return { success: false, error: signUpError.message };
    }

    if (!authData.user) {
        return { success: false, error: 'Registration failed: No user returned from provider' };
    }

    // 3. Create Profile in Public Table (using Admin Client to bypass RLS)
    // We use a clean admin client here just for the DB operation
    try {
        const adminClient = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        const { error: profileError } = await adminClient.from('users').insert([
            {
                auth_id: authData.user.id,
                full_name: fullName,
                email,
                phone,
                role: 'customer',
            },
        ]);

        if (profileError) {
            console.error('Profile creation error:', profileError);
            // Optional: Clean up auth user if profile creation fails?
            // For now, return error so user knows.
            return {
                success: false,
                error: `Account created but profile failed: ${profileError.message}. Please contact support.`
            };
        }

        return { success: true };
    } catch (err) {
        console.error('Server action internal error:', err);
        return {
            success: false,
            error: 'An unexpected error occurred during registration.'
        };
    }
}

export async function registerStaff(data: RegisterData) {
    const { email, password, fullName, phone, origin } = data;

    // 1. Initialize Supabase Client (for Auth)
    const supabase = await createClient();

    // 2. Sign Up User (Auth)
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo:
                process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${origin}/auth/callback`,
            data: {
                full_name: fullName,
                phone: phone,
            },
        },
    });

    if (signUpError) {
        return { success: false, error: signUpError.message };
    }

    if (!authData.user) {
        return { success: false, error: 'Registration failed: No user returned from provider' };
    }

    // 3. Create Profile (Service Role)
    try {
        const adminClient = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        const { error: profileError } = await adminClient.from('users').insert([
            {
                auth_id: authData.user.id,
                full_name: fullName,
                email,
                phone,
                role: 'staff',
            },
        ]);

        if (profileError) {
            console.error('Profile creation error:', profileError);
            return {
                success: false,
                error: `Account created but profile failed: ${profileError.message}.`
            };
        }

        return { success: true };
    } catch (err) {
        console.error('Server action internal error:', err);
        return {
            success: false,
            error: 'An unexpected error occurred during registration.'
        };
    }
}
