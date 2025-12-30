'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // 1. Not Logged In -> Go to Login
    if (!user && pathname.startsWith('/dashboard')) {
      router.push('/authentication');
      return;
    }

    // 2. Logged In BUT Waitlisted -> Kick out of Dashboard
    if (user && user.accessStatus === 'waitlist' && pathname.startsWith('/dashboard')) {
      router.push('/waitlist-pending');
      return;
    }

    // 3. Logged In AND Approved -> Kick out of Waitlist Page (Send to Dashboard)
    // (Optional polish: If they try to view the pending page while approved)
    if (user && (user.accessStatus === 'approved' || user.accessStatus === 'admin') && pathname === '/waitlist-pending') {
      router.push('/dashboard');
      return;
    }

  }, [user, loading, router, pathname]);

  if (loading) return <div className="h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>;

  // Don't render dashboard content if not authorized
  if (pathname.startsWith('/dashboard') && (!user || user.accessStatus === 'waitlist')) {
    return null;
  }

  return <>{children}</>;
}