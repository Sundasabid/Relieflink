
"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, userProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }

    if (!loading && user && userProfile) {
        if (userProfile.role === 'unassigned' && pathname !== '/role-select') {
            router.replace('/role-select');
        } else if (userProfile.role !== 'unassigned' && (pathname === '/role-select' || pathname === '/dashboard')) {
            router.replace(`/${userProfile.role}-dashboard`);
        }
    }
  }, [user, loading, router, userProfile, pathname]);

  if (loading || !user) {
    return (
        <div className="p-4 md:p-8 space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-12 w-full" />
            <div className="border rounded-lg p-4">
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    )
  }

  return <>{children}</>;
}
