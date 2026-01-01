'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import AccessPending from './AccessPending';

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname.startsWith('/dashboard')) {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  if (loading) return <div className="h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading Scriptoplay...</div>;

  // 1. If not logged in, content is hidden (useEffect redirects)
  if (!user && pathname.startsWith('/dashboard')) return null;

  // 2. If logged in but WAITLISTED, show Pending Screen
  if (user && user.accessStatus === 'waitlist' && pathname.startsWith('/dashboard')) {
    return <AccessPending />;
  }

  // 3. Approved? Show Dashboard
  return <>{children}</>;
}