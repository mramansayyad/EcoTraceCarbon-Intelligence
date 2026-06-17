import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuthStore, UserProfileData } from '../store/authStore';

export function useAuth() {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);
          
          let profileData: UserProfileData | null = null;
          if (userSnap.exists()) {
            profileData = {
              uid: firebaseUser.uid,
              ...userSnap.data()
            } as UserProfileData;
          }
          setAuth(firebaseUser, profileData);
        } catch (err) {
          console.error('Failed to resolve custom Firestore profile for auth session:', err);
          setAuth(firebaseUser, null);
        }
      } else {
        clearAuth();
      }
    });

    return () => unsubscribe();
  }, [setAuth, clearAuth, setLoading]);
}
