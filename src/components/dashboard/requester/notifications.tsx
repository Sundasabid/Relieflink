
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserNotifications } from '@/lib/firebase/firestore';
import type { Notification } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, BellRing } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function RequesterNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = getUserNotifications(user.uid, (newNotifications) => {
            setNotifications(newNotifications);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Latest updates on your requests.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center py-8"><Loader2 className="animate-spin" /></div>
                ) : notifications.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No new notifications.</p>
                ) : (
                    <div className="space-y-3">
                        {notifications.map(notif => (
                            <div key={notif.id} className="flex items-start gap-3">
                                <BellRing className="h-5 w-5 mt-1 text-primary" />
                                <div className='flex-1'>
                                    <p className="text-sm">{notif.message}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
