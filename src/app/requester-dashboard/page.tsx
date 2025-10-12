
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import RequestForm from '@/components/dashboard/request-form';

export default function RequesterDashboard() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline">Requester Dashboard</CardTitle>
          <CardDescription>Welcome! Here you can submit and manage your help requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Submit a New Request</h2>
            <RequestForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
