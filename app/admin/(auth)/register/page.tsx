'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerStaff } from '@/app/auth/actions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Email whitelist check removed by user request ("just allow me")

      const result = await registerStaff({
        email,
        password,
        fullName,
        phone: '', // Phone is not collected in this form currently
        origin: window.location.origin,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      router.push('/admin/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
        <p className="text-center text-amber-700 mb-6">Create staff account</p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">Full Name</label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="John Doe"
              disabled={loading}
            />
          </div>

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
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-amber-700">
          Already have an account?{' '}
          <Link href="/admin/login" className="font-semibold hover:underline">
            Sign in here
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
