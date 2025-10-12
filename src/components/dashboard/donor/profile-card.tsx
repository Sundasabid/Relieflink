
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { updateUserProfile, getDonorData } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function DonorProfileCard() {
  const { user, userProfile, loading } = useAuth();
  const { toast } = useToast();
  const [isFit, setIsFit] = useState(false);
  const [isAvailable, setIsAvailable] = useState(userProfile?.availability ?? false);
  const [bloodType, setBloodType] = useState('');

  useEffect(() => {
    if (userProfile) {
      setIsAvailable(userProfile.availability ?? false);
    }
    if (user) {
        getDonorData(user.uid).then(donorData => {
            if(donorData) {
                setBloodType(donorData.bloodType);
            }
        });
    }
  }, [userProfile, user]);

  const handleAvailabilityToggle = async (checked: boolean) => {
    if (!user) return;
    setIsAvailable(checked);
    updateUserProfile(user.uid, { availability: checked })
      .then(() => {
        toast({
          title: 'Availability Updated',
          description: `You are now marked as ${checked ? 'available' : 'unavailable'} to donate.`,
        });
      })
  };

  if (loading) return <div>Loading Profile...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-semibold text-lg">{userProfile?.name}</p>
          <p className="text-sm text-muted-foreground">{userProfile?.email}</p>
        </div>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-muted-foreground">Blood Type</p>
                <p className="font-bold text-2xl text-primary">{bloodType || 'N/A'}</p>
            </div>
            <div>
                <p className="text-sm text-muted-foreground">Last Donated</p>
                <p className="font-bold text-lg">
                    {userProfile?.lastDonationDate ? format(userProfile.lastDonationDate.toDate(), 'PPP') : 'N/A'}
                </p>
            </div>
        </div>
        <div className="flex items-center space-x-2 pt-4">
          <Checkbox id="fit-to-donate" checked={isFit} onCheckedChange={(checked) => setIsFit(Boolean(checked))} />
          <Label htmlFor="fit-to-donate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            I'm fit to donate.
          </Label>
        </div>
        <div className="flex items-center justify-between pt-2">
          <Label htmlFor="availability-switch" className="font-medium">Available to Donate</Label>
          <Switch
            id="availability-switch"
            checked={isAvailable}
            onCheckedChange={handleAvailabilityToggle}
            aria-readonly
          />
        </div>
      </CardContent>
    </Card>
  );
}
