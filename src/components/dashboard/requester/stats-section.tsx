
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { HelpRequest } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RequesterStats() {
    const { user } = useAuth();
    const [total, setTotal] = useState(0);
    const [completed, setCompleted] = useState(0);
    const [pending, setPending] = useState(0);

    useEffect(() => {
        if (!user) return;

        const requestsRef = collection(db, 'requests');
        const q = query(requestsRef, where("userId", "==", user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let totalCount = 0;
            let completedCount = 0;
            let pendingCount = 0;

            snapshot.forEach(doc => {
                const request = doc.data() as HelpRequest;
                totalCount++;
                if (request.status === 'completed') {
                    completedCount++;
                } else if (request.status === 'pending' || request.status === 'accepted') {
                    pendingCount++;
                }
            });

            setTotal(totalCount);
            setCompleted(completedCount);
            setPending(pendingCount);
        });

        return () => unsubscribe();

    }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Request Stats</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-3xl font-bold text-primary">{total}</p>
          <p className="text-sm text-muted-foreground">Total Made</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-green-500">{completed}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-amber-500">{pending}</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
      </CardContent>
    </Card>
  );
}
