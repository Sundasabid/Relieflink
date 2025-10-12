
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import VolunteerForm from '@/components/dashboard/volunteer-form';

export default function VolunteerDashboard() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline">Volunteer Dashboard</CardTitle>
          <CardDescription>Welcome, Volunteer! Thank you for your commitment. Manage your details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Your Volunteer Profile</h2>
            <VolunteerForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
