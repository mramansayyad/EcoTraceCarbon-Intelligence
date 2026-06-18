'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '../../../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { LoginSchema } from '../../../lib/validators';
import { useAuthStore, UserProfileData } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Leaf, LogIn } from 'lucide-react';
import { z } from 'zod';

type LoginInput = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { addToast } = useUIStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      
      // Fetch user profile from Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userDocRef);
      const profile = userSnap.exists() ? (userSnap.data() as UserProfileData) : null;

      // Update local state
      setAuth(userCredential.user, profile);
      addToast('Welcome back to EcoTrace!', 'success');
      router.push('/dashboard');
    } catch (err) {
      console.error('Firebase Auth Login Error:', err);
      let friendlyMessage = 'Invalid credentials. Please try again.';
      
      const error = err as { code?: string; message?: string };
      const errorCode = error.code || '';
      const errorMessage = error.message || '';
      
      if (errorCode === 'auth/user-not-found' || errorMessage.includes('auth/user-not-found')) {
        friendlyMessage = 'User account not found. Click "Create an account" below to register.';
      } else if (errorCode === 'auth/wrong-password' || errorMessage.includes('auth/wrong-password')) {
        friendlyMessage = 'Incorrect password. Please try again.';
      } else if (errorCode === 'auth/invalid-credential' || errorMessage.includes('auth/invalid-credential')) {
        friendlyMessage = 'Invalid email or password. Please verify and try again.';
      } else if (errorCode === 'auth/too-many-requests' || errorMessage.includes('auth/too-many-requests')) {
        friendlyMessage = 'Too many login attempts. Please try again later.';
      } else if (errorMessage) {
        friendlyMessage = errorMessage;
      }
      
      addToast(friendlyMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userDocRef);
      const profile = userSnap.exists() ? (userSnap.data() as UserProfileData) : null;

      setAuth(userCredential.user, profile);
      addToast('Successfully signed in with Google!', 'success');
      router.push('/dashboard');
    } catch (err) {
      console.error('Google Sign-in Error:', err);
      const error = err as { message?: string };
      addToast(error.message || 'Google Sign-in failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center px-4 py-16 bg-bg-base">
      <Card variant="elevated" className="max-w-md w-full border border-border-color bg-bg-surface p-8 shadow-2xl">
        <CardHeader className="flex flex-col items-center gap-2 mb-6">
          <div className="p-3 bg-accent-green/10 rounded-full">
            <Leaf className="h-8 w-8 text-accent-green" />
          </div>
          <h2 className="text-2xl font-extrabold text-text-primary text-center">Welcome Back</h2>
          <p className="text-xs text-text-muted text-center">Enter your details to track your footprint</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Email Address"
              type="email"
              error={errors.email?.message}
              placeholder="you@example.com"
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              error={errors.password?.message}
              placeholder="••••••••"
              {...register('password')}
            />
            
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full flex items-center gap-2 mt-2"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </form>

          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 border-t border-border-color" />
            <span className="relative px-3 text-xxs font-semibold uppercase tracking-widest text-text-muted bg-bg-surface">
              or continue with
            </span>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full text-xs font-semibold py-2"
          >
            Google Sign-In
          </Button>

          <div className="text-center mt-6 text-xs text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-accent-green hover:underline font-semibold">
              Create an account
            </Link>
          </div>
        </CardBody>
      </Card>
    </main>
  );
}
