'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase'; 
import { useRouter } from 'next/navigation';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  studioName?: string;
  role?: string;
  accessStatus: 'waitlist' | 'approved' | 'admin';
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, signOut: async () => {} });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          // 1. User is authenticated with Google/Email
          const userRef = doc(db, 'users', authUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            // 2. Profile exists, load it
            setUser(userSnap.data() as UserProfile);
          } else {
            // 3. New User? Create "Waitlist" Profile automatically
            const newProfile: UserProfile = {
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName,
              accessStatus: 'waitlist', // DEFAULT IS WAITLIST
            };
            await setDoc(userRef, { ...newProfile, createdAt: serverTimestamp() });
            setUser(newProfile);
          }
        } catch (err) {
          console.error("AuthContext Error:", err);
          // Don't crash the app, just set user to null or basic info
          //setUser({ uid: authUser.uid, email: authUser.email } as any);
          setUser(null);
        }
      } else {
      setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- UPDATED LOGOUT LOGIC ---
  const signOut = async () => {
    try {
      // 1. Sign out from Firebase
      await firebaseSignOut(auth);
      
      // 2. Kill the Session Cookie (Set expiration to past)
      document.cookie = "scriptoplay_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      
      // 3. Clear Local State
      setUser(null);
      
      // 4. Force Redirect to Auth Page
      router.push('/authentication');
      router.refresh(); // Force re-evaluation of middleware/cookies
      
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};