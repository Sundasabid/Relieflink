
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTaskHistory, getPendingTasks } from '@/lib/firebase/firestore';

export default function VolunteerStats() {
    const { user, userProfile } = useAuth();
    const [tasksCompleted, setTasksCompleted] = useState(0);
    const [pendingTasks, setPendingTasks] = useState(0);

    useEffect(() => {
        if(user) {
            getTaskHistory(user.uid).then(history => setTasksCompleted(history.length));
            getPendingTasks(user.uid).then(pending => setPendingTasks(pending.length));
        }
    }, [user]);

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
        <div className="col-span-2">
            <p className="text-3xl font-bold text-primary">{userProfile?.verified ? 'Verified' : 'Basic'}</p>
            <p className="text-sm text-muted-foreground">Verification Level</p>
        </div>
      </CardContent>
    </Card>
  );
}
