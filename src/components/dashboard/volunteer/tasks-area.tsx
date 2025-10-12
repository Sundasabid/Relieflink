
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getAvailableTasks, acceptTask } from '@/lib/firebase/firestore';
import type { HelpRequest } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AvailableTasks() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const availableTasks = await getAvailableTasks();
      setTasks(availableTasks);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Could not fetch available tasks.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAccept = (task: HelpRequest) => {
    if (!user || !userProfile?.name || !task.id) return;

    acceptTask(task, user.uid, userProfile.name);

    toast({
      title: 'Task Accepted',
      description: `You have accepted the task: ${task.title}.`,
    });
    // Optimistically remove the task from the list
    setTasks(prev => prev.filter(t => t.id !== task.id));
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Available Tasks</CardTitle>
        <CardDescription>Tasks available for volunteers to accept.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No available tasks right now. Thank you for being on standby!</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {tasks.map(task => (
              <Card key={task.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Requester: {task.requesterName || 'Anonymous'} | Location: {task.location}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{task.type}</Badge>
                        {task.urgency && <Badge variant={task.urgency === 'Critical' ? 'destructive' : 'secondary'}>{task.urgency}</Badge>}
                    </div>
                  </div>
                  <Button onClick={() => handleAccept(task)} size="sm">Accept Task</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
