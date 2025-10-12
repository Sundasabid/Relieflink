
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { updateUserProfile } from '@/lib/firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, LifeBuoy, Send, Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type Role = 'requester' | 'donor' | 'volunteer';

export default function RoleSelectPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<Role | null>(null);

  const handleRoleSelect = async (role: Role) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }
    setIsLoading(role);

    const updatedProfile: Partial<UserProfile> = { role };
    
    try {
        await updateUserProfile(user.uid, updatedProfile);
        toast({
            title: 'Role Selected!',
            description: `You are now a ${role}. Redirecting...`,
        });
        router.push(`/${role}-dashboard`);
    } catch (error) {
        console.error('Failed to update role', error);
        toast({
            title: 'Update Failed',
            description: 'Could not update your role. Please try again.',
            variant: 'destructive',
        });
        setIsLoading(null);
    }
  };

  const roles = [
    {
      name: 'requester',
      title: 'I Need Help',
      icon: <Send className="h-12 w-12 text-primary" />,
      description: 'Post requests for medical aid, rescue, or supplies.',
    },
    {
      name: 'volunteer',
      title: 'I Want to Volunteer',
      icon: <LifeBuoy className="h-12 w-12 text-primary" />,
      description: 'Join our response team and offer your skills.',
    },
    {
      name: 'donor',
      title: 'I Want to Donate Blood',
      icon: <Heart className="h-12 w-12 text-primary" />,
      description: 'Register as a blood donor and save lives.',
    },
  ];

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Choose Your Role</h1>
        <p className="text-muted-foreground mt-2 text-lg">How would you like to contribute to ReliefLink?</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {roles.map((role) => (
          <Card
            key={role.name}
            className="flex flex-col items-center text-center p-6 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
            onClick={() => handleRoleSelect(role.name as Role)}
          >
            <CardHeader className="p-0">
              {role.icon}
              <CardTitle className="text-2xl font-bold font-headline mt-4">{role.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <CardDescription>{role.description}</CardDescription>
              <Button className="mt-6" variant="default" disabled={!!isLoading}>
                {isLoading === role.name ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Selecting...
                  </>
                ) : (
                  `Become a ${role.name.charAt(0).toUpperCase() + role.name.slice(1)}`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
