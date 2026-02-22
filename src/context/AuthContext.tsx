'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Session } from '@supabase/supabase-js'; // Removed unused User import
import { useRouter } from 'next/navigation';

interface UserProfile {
  uid: string; // Mapped from id for backward compatibility
  id: string; // Supabase native
  email?: string;
  display_name?: string | null;
  displayName?: string | null; // Compatibility
  photo_url?: string | null;
  photoURL?: string | null; // Compatibility
  studio_name?: string | null;
  role?: string | null;
  accessStatus?: 'waitlist' | 'approved' | 'admin'; // Compatibility camelCase
  access_status?: 'waitlist' | 'approved' | 'admin'; // Supabase snake_case
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string, d: { displayName: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => { },
  signInWithGoogle: async () => { },
  signInWithEmail: async () => { },
  signUpWithEmail: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, retries = 3) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error fetching profile:', JSON.stringify(error, null, 2));
          // Retry logic for network errors
          if (retries > 0) {
            console.log(`Retrying profile fetch... (${retries} attempts left)`);
            setTimeout(() => fetchProfile(userId, retries - 1), 2000);
            return;
          }
        }
      }

      const userData = data || {};

      // Merge Auth User metadata if profile is missing fields or doesn't exist
      const { data: { user: authUser } } = await supabase.auth.getUser();

      const finalUser: UserProfile = {
        id: userId,
        uid: userId, // Match Firebase
        email: authUser?.email,

        // Profile DB takes precedence, fallback to Auth Meta
        display_name: userData.display_name || authUser?.user_metadata?.full_name,
        displayName: userData.display_name || authUser?.user_metadata?.full_name,

        photo_url: userData.photo_url || authUser?.user_metadata?.avatar_url,
        photoURL: userData.photo_url || authUser?.user_metadata?.avatar_url,

        studio_name: userData.studio_name,
        role: userData.role,

        access_status: userData.access_status || 'waitlist',
        accessStatus: userData.access_status || 'waitlist' as any
      };

      setUser(finalUser);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    // router.refresh() handles state update via onAuthStateChange
    router.refresh();
  };

  const signUpWithEmail = async (email: string, password: string, data: { displayName: string }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: data.displayName
        }
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    router.push('/authentication');
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, signInWithGoogle, signInWithEmail, signUpWithEmail }}>
      {children}
    </AuthContext.Provider>
  );
};