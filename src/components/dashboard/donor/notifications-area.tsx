
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getBloodRequests, acceptBloodRequest, getDonorData } from '@/lib/firebase/firestore';
import type { HelpRequest } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function BloodRequestNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [bloodType, setBloodType] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!bloodType) return;
    setLoading(true);
    try {
      const relevantRequests = await getBloodRequests(bloodType);
      setRequests(relevantRequests);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Could not fetch blood requests.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [bloodType, toast]);

  useEffect(() => {
    if(user) {
        getDonorData(user.uid).then(donorData => {
            if(donorData) {
                setBloodType(donorData.bloodType);
            }
        })
    }
  }, [user]);

  useEffect(() => {
    if (bloodType) {
      fetchRequests();
    }
  }, [bloodType, fetchRequests]);

  const handleAccept = (request: HelpRequest) => {
    if (!user || !request.id) return;

    acceptBloodRequest(request, user.uid);

    toast({
      title: 'Request Accepted',
      description: `You are helping ${request.requesterName}. Your donation is now pending confirmation.`,
    });
    // Optimistically remove the request from the list
    setRequests(prev => prev.filter(r => r.id !== request.id));
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Urgent Blood Requests</CardTitle>
        <CardDescription>Requests matching your blood type ({bloodType || 'N/A'})</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No blood requests matching your type right now. Thank you for being ready!</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {requests.map(req => (
              <Card key={req.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{req.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Requester: {req.requesterName || 'Anonymous'} | Location: {req.location}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="destructive">{req.bloodType}</Badge>
                        {req.urgency && <Badge variant={req.urgency === 'high' ? 'destructive' : 'secondary'}>{req.urgency}</Badge>}
                    </div>
                  </div>
                  <Button onClick={() => handleAccept(req)} size="sm">Accept</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
