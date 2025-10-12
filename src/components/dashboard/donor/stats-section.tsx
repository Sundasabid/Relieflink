
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDonationHistory, getPendingDonations } from '@/lib/firebase/firestore';

export default function DonorStats() {
    const { user } = useAuth();
    const [totalDonations, setTotalDonations] = useState(0);
    const [pendingConfirmations, setPendingConfirmations] = useState(0);

    useEffect(() => {
        if(user) {
            getDonationHistory(user.uid).then(history => setTotalDonations(history.length));
            getPendingDonations(user.uid).then(pending => setPendingConfirmations(pending.length));
        }
    }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">My Stats</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-3xl font-bold text-blue-400">{totalDonations}</p>
          <p className="text-sm text-muted-foreground">Total Donations Made</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-blue-400">{pendingConfirmations}</p>
          <p className="text-sm text-muted-foreground">Pending Confirmations</p>
        </div>
      </CardContent>
    </Card>
  );
}
