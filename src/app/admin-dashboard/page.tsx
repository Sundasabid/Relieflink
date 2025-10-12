
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function AdminDashboard() {
    const { userProfile } = useAuth();
    return (
        <div className="min-h-screen text-foreground p-4 md:p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold font-headline text-primary">
                    Admin Dashboard
                </h1>
            </header>
            <main>
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome, {userProfile?.name || 'Admin'}</CardTitle>
                        <CardDescription>This is the central control panel for ReliefLink.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>From here, you can manage users, oversee requests, and ensure the platform runs smoothly.</p>
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Management</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>View, verify, and manage all users.</p>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle>Request Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>Monitor all incoming help requests.</p>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle>Platform Analytics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>Key metrics and operational insights.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
