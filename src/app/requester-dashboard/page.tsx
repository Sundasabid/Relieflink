
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import NewRequestForm from '@/components/dashboard/requester/new-request-form';
import RequesterStats from '@/components/dashboard/requester/stats-section';
import MyRequests from '@/components/dashboard/requester/my-requests';
import RequesterNotifications from '@/components/dashboard/requester/notifications';

export default function RequesterDashboard() {
  return (
    <div className="container mx-auto py-10 min-h-screen">
       <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline text-primary">
          Requester Dashboard
        </h1>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Create a New Request</CardTitle>
                    <CardDescription>Fill out the form below to ask for help.</CardDescription>
                </CardHeader>
                <CardContent>
                    <NewRequestForm />
                </CardContent>
            </Card>
            <MyRequests />
        </div>
        <div className="lg:col-span-1 space-y-8">
            <RequesterStats />
            <RequesterNotifications />
        </div>
      </main>
    </div>
  );
}
