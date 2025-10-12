
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { updateUserProfile, getDonorData, setDonorData } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, Save } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  bloodType: z.string().min(1, "Blood type is required."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function DonorProfileCard() {
  const { user, userProfile, loading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      bloodType: "",
    },
  });

  useEffect(() => {
    let isMounted = true;
    if (user && userProfile) {
      // Set basic profile data first
      form.setValue('name', userProfile.name || '');
      setIsAvailable(userProfile.availability ?? false);

      // Then fetch and set donor-specific data
      getDonorData(user.uid).then(donorData => {
        if (isMounted && donorData?.bloodType) {
          form.setValue('bloodType', donorData.bloodType);
        }
      });
    }
    return () => { isMounted = false; };
  }, [userProfile, user, form]);
  

  const handleAvailabilityToggle = async (checked: boolean) => {
    if (!user) return;
    if (!form.getValues('bloodType')) {
        toast({
            variant: 'destructive',
            title: 'Blood Type Required',
            description: 'Please set your blood type before becoming available.'
        });
        return;
    }
    setIsAvailable(checked);
    updateUserProfile(user.uid, { availability: checked })
      .then(() => {
        toast({
          title: 'Availability Updated',
          description: `You are now marked as ${checked ? 'available' : 'unavailable'} to donate.`,
        });
      })
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
        toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
        return;
    }
    setIsSubmitting(true);
    
    try {
        await Promise.all([
            updateUserProfile(user.uid, { name: data.name }),
            setDonorData(user.uid, {
                userId: user.uid,
                bloodType: data.bloodType,
                availability: isAvailable.toString(),
                location: userProfile?.phone || ''
            })
        ]);
        toast({
            title: 'Profile Updated',
            description: 'Your profile has been saved successfully.'
        });
        setIsEditing(false);
    } catch (error) {
        // Errors are handled by the global handler
    } finally {
        setIsSubmitting(false);
    }
  }
  
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  if (loading) return <Card><CardHeader><CardTitle>My Profile</CardTitle></CardHeader><CardContent>Loading Profile...</CardContent></Card>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Profile</CardTitle>
        {!isEditing && (
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                <Edit className="h-5 w-5" />
            </Button>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={!isEditing || isSubmitting} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormItem>
                        <FormLabel>Email</FormLabel>
                        <Input value={userProfile?.email || ''} disabled />
                    </FormItem>
                     <FormField
                        control={form.control}
                        name="bloodType"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Blood Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing || isSubmitting}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your blood type" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {bloodTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                <div className="flex items-center justify-between pt-4">
                    <Label htmlFor="availability-switch" className="font-medium">Available to Donate</Label>
                    <Switch
                        id="availability-switch"
                        checked={isAvailable}
                        onCheckedChange={handleAvailabilityToggle}
                        disabled={isSubmitting}
                    />
                </div>

                {isEditing && (
                    <div className="flex justify-end gap-2">
                         <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                )}
            </form>
        </Form>
      </CardContent>
    </Card>
  );
}
