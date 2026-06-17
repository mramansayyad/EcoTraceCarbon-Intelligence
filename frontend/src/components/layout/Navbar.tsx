import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { Menu, LogOut, Leaf, User } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, profile, clearAuth } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearAuth();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-color bg-bg-base/80 backdrop-blur-md px-4 lg:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {user && (
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-full hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <Link href="/" className="flex items-center gap-2 group">
          <Leaf className="h-6 w-6 text-accent-green group-hover:rotate-12 transition-transform duration-300" />
          <div>
            <span className="text-lg font-bold text-text-primary tracking-tight">EcoTrace</span>
            <span className="hidden md:inline-block text-xxs text-accent-emerald ml-2 font-mono uppercase tracking-widest font-semibold">
              Carbon Intelligence
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="hidden md:flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-all font-medium"
            >
              <User className="h-4 w-4 text-accent-emerald" />
              <span>{profile?.displayName || user.email?.split('@')[0] || 'User'}</span>
            </Link>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm hover:text-danger-red py-1.5 px-3"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" className="text-sm shadow-md">Get Started</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
