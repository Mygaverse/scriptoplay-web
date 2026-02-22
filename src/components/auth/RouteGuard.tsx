'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import LoadingScreen from '@/components/ui/LoadingScreen'; // Reuse your spinner

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Wait for Auth to initialize
    if (loading) return;

    // 2. Logic: Not Logged In
    if (!user) {
      // If trying to access dashboard, kick to login
      // EXCEPTION: Allow access to Migration Page so users can debug/login there if needed
      if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/migration')) {
        router.push('/authentication');
      }
      return;
    }

    // 3. Logic: Logged In but Waitlisted
    if (user.accessStatus === 'waitlist') {
      // If trying to access dashboard, kick to pending page
      // EXCEPTION: Allow access to Migration Page
      if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/migration')) {
        router.push('/waitlist-pending');
      }
      return;
    }

    // 4. Logic: Approved but stuck on Waitlist Page
    if ((user.accessStatus === 'approved' || user.accessStatus === 'admin') && pathname === '/waitlist-pending') {
      router.push('/dashboard');
    }

  }, [user, loading, router, pathname]);

  // --- RENDERING PROTECTION ---

  // A. While checking Supabase, show Spinner (Blocks content)
  if (loading) {
    return <LoadingScreen message="Verifying Access..." />;
  }

  // B. If no user, OR user is waitlisted, DO NOT RENDER CHILDREN (Blocks content)
  // This prevents the "Flash of Unauthenticated Content"
  if (!user && pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/migration')) {
    return null;
  }

  if (user?.accessStatus === 'waitlist' && pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/migration')) {
    return null;
  }

  // C. Safe to render
  return <>{children}</>;
}