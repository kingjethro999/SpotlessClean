'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button - visible only on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-amber-100 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="text-amber-900" size={24} />
        ) : (
          <Menu className="text-amber-900" size={24} />
        )}
      </button>

      {/* Desktop Navigation - visible on md and up */}
      <div className="hidden md:flex gap-2 md:gap-4">
        <Link href="/auth/login">
          <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent text-xs md:text-sm">
            Sign In
          </Button>
        </Link>
        <Link href="/auth/register">
          <Button size="sm" className="bg-amber-700 hover:bg-amber-800 text-xs md:text-sm">
            Register
          </Button>
        </Link>
      </div>

      {/* Mobile Menu - visible when open */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-amber-200 md:hidden shadow-lg">
          <div className="flex flex-col gap-2 p-4">
            <Link href="/auth/login" onClick={() => setIsOpen(false)}>
              <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent w-full justify-start">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register" onClick={() => setIsOpen(false)}>
              <Button size="sm" className="bg-amber-700 hover:bg-amber-800 w-full justify-start">
                Register
              </Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
