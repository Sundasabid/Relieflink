
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTaskHistory, getPendingTasks } from '@/lib/firebase/firestore';
import { Award, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type BadgeLevel = 'Bronze' | 'Silver' | 'Gold';

export default function VolunteerStats() {
    const { user, userProfile } = useAuth();
    const [tasksCompleted, setTasksCompleted] = useState(0);
    const [pendingTasks, setPendingTasks] = useState(0);
    const [badgeLevel, setBadgeLevel] = useState<BadgeLevel>('Bronze');

    useEffect(() => {
        if(user) {
            getTaskHistory(user.uid).then(history => {
                const completedCount = history.length;
                setTasksCompleted(completedCount);
                if (completedCount >= 15) {
                    setBadgeLevel('Gold');
                } else if (completedCount >= 5) {
                    setBadgeLevel('Silver');
                } else {
                    setBadgeLevel('Bronze');
                }
            });
            getPendingTasks(user.uid).then(pending => setPendingTasks(pending.length));
        }
    }, [user]);

  const badgeColors: Record<BadgeLevel, string> = {
    Bronze: 'bg-[#cd7f32] text-white',
    Silver: 'bg-[#c0c0c0] text-black',
    Gold: 'bg-[#ffd700] text-black',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Stats</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-3xl font-bold text-primary">{tasksCompleted}</p>
          <p className="text-sm text-muted-foreground">Tasks Completed</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-primary">{pendingTasks}</p>
          <p className="text-sm text-muted-foreground">Pending Tasks</p>
        </div>
        <div className="col-span-2 space-y-2">
            <div className='flex items-center justify-center gap-2'>
              <Award className="h-8 w-8 text-primary" />
              <Badge className={`text-lg ${badgeColors[badgeLevel]}`}>{badgeLevel}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Activity Badge</p>
        </div>
         <div className="col-span-2 space-y-2">
             <div className='flex items-center justify-center gap-2'>
                <Shield className="h-8 w-8 text-primary" />
                <p className={`text-xl font-bold ${userProfile?.verified ? 'text-green-500' : 'text-muted-foreground'}`}>{userProfile?.verified ? 'Verified' : 'Basic'}</p>
             </div>
            <p className="text-sm text-muted-foreground">Verification Level</p>
        </div>
      </CardContent>
    </Card>
  );
}
