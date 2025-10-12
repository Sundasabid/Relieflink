
'use client';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';
import VolunteerProfileCard from '@/components/dashboard/volunteer/profile-card';
import VolunteerStats from '@/components/dashboard/volunteer/stats-section';
import AvailableTasks from '@/components/dashboard/volunteer/tasks-area';


export default function VolunteerDashboard() {
  const { user, userProfile } = useAuth();
  const router = useRouter();

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen text-foreground p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <div className='flex items-center gap-4'>
            <h1 className="text-3xl font-bold font-headline text-primary">
                Volunteer Dashboard
            </h1>
            {userProfile?.verified && (
                <Badge variant="secondary" className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    Verified
                </Badge>
            )}
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <VolunteerProfileCard />
          <VolunteerStats />
        </div>

        <div className="lg:col-span-2">
          <AvailableTasks />
        </div>
      </main>

      <footer className="text-center mt-12">
        <Button variant="outline" onClick={() => router.push('/volunteer-dashboard/history')}>
          View My Task History
        </Button>
      </footer>
    </div>
  );
}
