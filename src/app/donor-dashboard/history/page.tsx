
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getDonationHistory } from '@/lib/firebase/firestore';
import type { Donation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';


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

  const getStatusVariant = (status: string) => {
      switch(status) {
          case 'completed':
              return 'default';
          case 'pending':
              return 'secondary';
          default:
              return 'outline';
      }
  }

  return (
    <div className="container mx-auto py-10 min-h-screen">
       <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">My Donation History</CardTitle>
          <CardDescription>A record of your past and pending donations.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">You have no donation history yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map(donation => (
                  <TableRow key={donation.id}>
                    <TableCell>{donation.donationDate ? format(donation.donationDate.toDate(), 'PPP') : 'N/A'}</TableCell>
                    <TableCell>{donation.requesterName || 'N/A'}</TableCell>
                    <TableCell>{donation.location || 'N/A'}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusVariant(donation.status)} className='capitalize'>{donation.status}</Badge>
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
