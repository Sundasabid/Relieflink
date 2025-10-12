
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getDonationHistory } from '@/lib/firebase/firestore';
import type { Donation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function DonationHistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getDonationHistory(user.uid)
        .then(data => {
          setHistory(data);
          setLoading(false);
        });
    }
  }, [user]);

  return (
    <div className="container mx-auto py-10 min-h-screen">
       <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">My Donation History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading history...</p>
          ) : history.length === 0 ? (
            <p>You have no completed donations yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map(donation => (
                  <TableRow key={donation.id}>
                    <TableCell>{donation.donationDate ? format(donation.donationDate.toDate(), 'PPP') : 'N/A'}</TableCell>
                    <TableCell className='font-mono'>{donation.requestId}</TableCell>
                    <TableCell>
                        <span className='capitalize bg-green-500 text-white px-2 py-1 rounded-full text-xs'>{donation.status}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
