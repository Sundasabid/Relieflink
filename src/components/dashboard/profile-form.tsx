
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/lib/firebase/firestore";
import { Loader2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { useState } from "react";

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm() {
  const { user, userProfile, loading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userProfile?.name || "",
      phone: userProfile?.phone || "",
    },
    values: {
        name: userProfile?.name || "",
        phone: userProfile?.phone || "",
    }
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    updateUserProfile(user.uid, data);
    toast({
      title: "Profile Update Submitted",
      description: "Your profile is being updated.",
    });
    // The UI is updated optimistically, so we can reset the submitting state.
    // Errors will be handled by the global error listener.
    setIsSubmitting(false);
  };

  if (loading) {
      return <div>Loading profile...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                    <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                    <Input placeholder="Your phone number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormItem>
                <FormLabel>Email</FormLabel>
                <Input value={userProfile?.email || ''} disabled />
            </FormItem>
            <FormItem>
                <FormLabel>Current Role</FormLabel>
                <div>
                 <Badge variant="secondary" className="capitalize text-lg">{userProfile?.role || 'Unassigned'}</Badge>
                </div>
            </FormItem>
        </div>
        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Profile
        </Button>
      </form>
    </Form>
  );
}
