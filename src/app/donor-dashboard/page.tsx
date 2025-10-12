
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DonorForm from '@/components/dashboard/donor-form';

export default function DonorDashboard() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline">Donor Dashboard</CardTitle>
          <CardDescription>Welcome, Donor! Manage your blood donation information here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Your Donor Profile</h2>
            <DonorForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
