
'use client';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import DonorProfileCard from '@/components/dashboard/donor/profile-card';
import DonorStats from '@/components/dashboard/donor/stats-section';
import BloodRequestNotifications from '@/components/dashboard/donor/notifications-area';
import { useEffect } from 'react';

export default function DonorDashboard() {
  const { user, userProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const body = document.body;
    body.classList.add('donor-dashboard-theme');

    return () => {
      body.classList.remove('donor-dashboard-theme');
    }
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen text-foreground p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline text-white">
          Blood Donor Dashboard
        </h1>
        <div className='flex items-center gap-4'>
            <span className="text-white">Welcome, {userProfile?.name}</span>
            <Button onClick={handleLogout} variant="destructive">Logout</Button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <DonorProfileCard />
          <DonorStats />
        </div>

        <div className="lg:col-span-2">
          <BloodRequestNotifications />
        </div>
      </main>

      <footer className="text-center mt-12">
        <Button variant="outline" onClick={() => router.push('/donor-dashboard/history')}>
          View My Donation History
        </Button>
      </footer>
    </div>
  );
}
