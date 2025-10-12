
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getUserHelpRequests, cancelHelpRequest } from '@/lib/firebase/firestore';
import type { HelpRequest } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function MyRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    const unsubscribe = getUserHelpRequests(user.uid, (newRequests) => {
      setRequests(newRequests);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCancel = (requestId: string) => {
    cancelHelpRequest(requestId);
    toast({
      title: 'Request Cancelled',
      description: 'Your help request has been cancelled.',
    });
  };

  const getStatusVariant = (status: HelpRequest['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'accepted': return 'default';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Requests</CardTitle>
        <CardDescription>A real-time view of all the help requests you've submitted.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12"><Loader2 className="animate-spin" /></div>
        ) : requests.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">You haven't made any requests yet.</p>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {requests.map(req => (
              <Card key={req.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={getStatusVariant(req.status)} className="capitalize">{req.status}</Badge>
                      <span className="text-sm font-semibold">{req.type} Request</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Urgency: <span className="font-medium text-foreground">{req.urgency}</span>
                    </p>
                     <p className="text-sm text-muted-foreground">
                      Location: <span className="font-medium text-foreground">{req.location}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Date: {req.createdAt ? format(req.createdAt.toDate(), 'PPP') : 'N/A'}
                    </p>
                     {req.description && <p className="text-sm mt-2 p-2 bg-muted rounded-md">{req.description}</p>}
                  </div>
                  {req.status === 'pending' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently cancel your request. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Back</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleCancel(req.id!)} className="bg-destructive hover:bg-destructive/90">
                            Yes, Cancel Request
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
