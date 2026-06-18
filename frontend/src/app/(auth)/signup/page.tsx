'use client';

import React, { useState } from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '../../../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { SignupSchema } from '../../../lib/validators';
import { useAuthStore, UserProfileData } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Leaf, UserPlus, Info } from 'lucide-react';
import { Tooltip } from '../../../components/ui/Tooltip';
import { z } from 'zod';

type SignupInput = z.infer<typeof SignupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { addToast } = useUIStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupInput>({
    resolver: zodResolver(SignupSchema) as unknown as Resolver<SignupInput>,
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      country: 'India',
      ageGroup: '25-34',
      weeklyTarget: 44.0
    }
  });

  const onSubmit = async (data: SignupInput) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      const profile: UserProfileData = {
        uid: userCredential.user.uid,
        displayName: data.displayName,
        email: data.email,
        country: data.country,
        ageGroup: data.ageGroup,
        weeklyTarget: data.weeklyTarget,
        baselineWeekly: data.weeklyTarget, // set initial baseline
        streakDays: 0,
        lastActiveDate: null
      };

      // Create user profile document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...profile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setAuth(userCredential.user, profile);
      addToast('Welcome to EcoTrace! Let\'s track your carbon footprint.', 'success');
      router.push('/dashboard');
    } catch (err) {
      console.error('Firebase Auth Signup Error:', err);
      let friendlyMessage = 'Registration failed. Please try again.';
      
      const error = err as { code?: string; message?: string };
      const errorCode = error.code || '';
      const errorMessage = error.message || '';
      
      if (errorCode === 'auth/email-already-in-use' || errorMessage.includes('auth/email-already-in-use')) {
        friendlyMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (errorCode === 'auth/weak-password' || errorMessage.includes('auth/weak-password')) {
        friendlyMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (errorCode === 'auth/invalid-email' || errorMessage.includes('auth/invalid-email')) {
        friendlyMessage = 'Invalid email address format. Please check and try again.';
      } else if (errorMessage) {
        friendlyMessage = errorMessage;
      }
      
      addToast(friendlyMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const ageGroupOptions = [
    { value: 'under-18', label: 'Under 18' },
    { value: '18-24', label: '18-24' },
    { value: '25-34', label: '25-34' },
    { value: '35-44', label: '35-44' },
    { value: '45-54', label: '45-54' },
    { value: '55-plus', label: '55+' }
  ];

  return (
    <main className="flex-grow flex items-center justify-center px-4 py-12 bg-bg-base">
      <Card variant="elevated" className="max-w-md w-full border border-border-color bg-bg-surface p-8 shadow-2xl">
        <CardHeader className="flex flex-col items-center gap-2 mb-4">
          <div className="p-3 bg-accent-green/10 rounded-full">
            <Leaf className="h-8 w-8 text-accent-green" />
          </div>
          <h2 className="text-2xl font-extrabold text-text-primary text-center">Create Account</h2>
          <p className="text-xs text-text-muted text-center">Onboard to personalized carbon insights</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              type="text"
              error={errors.displayName?.message}
              placeholder="Aman Sayyad"
              {...register('displayName')}
            />
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
              placeholder="Min 6 characters"
              {...register('password')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Country"
                type="text"
                error={errors.country?.message}
                placeholder="India"
                {...register('country')}
              />
              <Select
                label="Age Group"
                options={ageGroupOptions}
                error={errors.ageGroup?.message}
                {...register('ageGroup')}
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-text-primary">Weekly Carbon Budget Target (kg CO2e)</span>
                <Tooltip content="The 1.5°C Paris Agreement pathway recommends under ~44 kg CO2e per week.">
                  <Info className="h-3.5 w-3.5 text-accent-emerald cursor-pointer" />
                </Tooltip>
              </div>
              <Input
                type="number"
                step="0.1"
                error={errors.weeklyTarget?.message}
                placeholder="44.0"
                {...register('weeklyTarget')}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full flex items-center gap-2 mt-4"
            >
              <UserPlus className="h-4 w-4" />
              Register & Onboard
            </Button>
          </form>

          <div className="text-center mt-6 text-xs text-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="text-accent-green hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </CardBody>
      </Card>
    </main>
  );
}
