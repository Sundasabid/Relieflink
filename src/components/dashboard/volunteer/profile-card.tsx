
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { updateUserProfile, getVolunteerData, setVolunteerData } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, Save, Download } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const profileSchema = z.object({
  skills: z.string().min(2, { message: "Please list at least one skill." }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function VolunteerProfileCard() {
  const { user, userProfile, loading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [cnicLink, setCnicLink] = useState<string | undefined>(undefined);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      skills: "",
    },
  });

  useEffect(() => {
    let isMounted = true;
    if (user && userProfile) {
      setIsAvailable(userProfile.availability ?? false);

      getVolunteerData(user.uid).then(volunteerData => {
        if (isMounted && volunteerData) {
          form.setValue('skills', volunteerData.skills || '');
          setCnicLink(volunteerData.cnicLink);
        }
      });
    }
    return () => { isMounted = false; };
  }, [userProfile, user, form]);
  
  const handleAvailabilityToggle = async (checked: boolean) => {
    if (!user) return;
    setIsAvailable(checked);
    updateUserProfile(user.uid, { availability: checked })
      .then(() => {
        toast({
          title: 'Availability Updated',
          description: `You are now marked as ${checked ? 'available' : 'unavailable'} for tasks.`,
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
        await setVolunteerData(user.uid, { skills: data.skills });
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

  const skillTypes = ["First Aid", "Driving", "Rescue", "Logistics", "Medical", "Other"];

  if (loading) return <Card><CardHeader><CardTitle>My Profile</CardTitle></CardHeader><CardContent>Loading Profile...</CardContent></Card>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Volunteer Profile</CardTitle>
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
                        name="skills"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Skill Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing || isSubmitting}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your primary skill" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {skillTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormItem>
                        <FormLabel>CNIC / ID Link</FormLabel>
                        {cnicLink ? (
                            <div className="flex items-center gap-2">
                                <Input value="ID document uploaded" disabled />
                                <Button asChild variant="outline" size="icon">
                                    <a href={cnicLink} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a>
                                </Button>
                            </div>
                        ) : (
                            <Input value="No ID uploaded" disabled />
                        )}
                    </FormItem>
                </div>
                <div className="flex items-center justify-between pt-4">
                    <Label htmlFor="availability-switch" className="font-medium">Available for Tasks</Label>
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
