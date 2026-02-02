'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      if (data.user) {
        // Check user role
        const { data: userData, error: roleError } = await supabase
          .from('users')
          .select('role')
          .eq('auth_id', data.user.id)
          .single();

        if (roleError || !userData) throw new Error('User not found');

        if (userData.role === 'admin' || userData.role === 'staff') {
          router.push('/admin/dashboard');
        } else {
          setError('You do not have admin access');
          await supabase.auth.signOut();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-4">
          <Logo size={40} />
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 text-amber-900">SpotlessClean Admin</h1>
        <p className="text-center text-amber-700 mb-6">Staff Portal - Sign in to manage requests</p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="staff@SpotlessClean.ng"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-amber-700 hover:bg-amber-800">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-amber-700">
          Need to register?{' '}
          <Link href="/admin/register" className="font-semibold hover:underline">
            Create admin account
          </Link>
        </p>

        <div className="mt-6 pt-6 border-t border-amber-200">
          <Link href="/" className="text-center text-sm text-amber-600 hover:underline block">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
