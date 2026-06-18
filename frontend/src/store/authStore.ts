import type { User } from 'firebase/auth';
import { create } from 'zustand';

export interface UserProfileData {
  uid: string;
  displayName: string;
  email: string;
  country: string;
  ageGroup: string;
  weeklyTarget: number;
  baselineWeekly: number;
  streakDays: number;
  lastActiveDate: string | null;
}

interface AuthState {
  user: User | null; // Firebase User
  profile: UserProfileData | null; // Custom Profile
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User | null, profile: UserProfileData | null) => void;
  updateProfile: (profile: Partial<UserProfileData>) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: (user, profile) => set({
    user,
    profile,
    isAuthenticated: !!user,
    isLoading: false
  }),
  updateProfile: (profileUpdates) => set((state) => ({
    profile: state.profile ? { ...state.profile, ...profileUpdates } : null
  })),
  clearAuth: () => set({
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: false
  }),
  setLoading: (isLoading) => set({ isLoading })
}));
