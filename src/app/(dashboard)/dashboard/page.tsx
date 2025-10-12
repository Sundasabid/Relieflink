
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardRedirector() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (userProfile?.role && userProfile.role !== 'unassigned') {
        router.replace(`/${userProfile.role}-dashboard`);
      } else {
        router.replace('/role-select');
      }
    }
  }, [userProfile, loading, router]);

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
  );
}
