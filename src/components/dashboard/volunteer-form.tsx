
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getVolunteerData, setVolunteerData } from "@/lib/firebase/firestore";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const volunteerSchema = z.object({
  skills: z.string().min(10, "Please describe your skills."),
  availability: z.string().min(5, "Please describe your availability."),
  location: z.string().min(3, "Location is required."),
});

type VolunteerFormValues = z.infer<typeof volunteerSchema>;

export default function VolunteerForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VolunteerFormValues>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: {
      skills: "",
      availability: "",
      location: "",
    },
  });

  useEffect(() => {
    if (user) {
      getVolunteerData(user.uid).then((data) => {
        if (data) {
          form.reset(data);
        }
      });
    }
  }, [user, form]);

  const onSubmit = async (data: VolunteerFormValues) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    setVolunteerData(user.uid, { userId: user.uid, ...data });
    toast({
      title: "Registration Submitted",
      description: "Thank you for registering as a volunteer! Your information is being saved.",
    });
    // The UI is updated optimistically, so we can reset the submitting state.
    // Errors will be handled by the global error listener.
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., First Aid, Search and Rescue, Logistics, etc."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>List any relevant skills you have.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="availability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Availability</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Weekends, Evenings, 24/7 for the next week" {...field} />
              </FormControl>
              <FormDescription>When are you available to help?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Location</FormLabel>
              <FormControl>
                <Input placeholder="City, State" {...field} />
              </FormControl>
              <FormDescription>
                The area where you can volunteer.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Volunteer Info
        </Button>
      </form>
    </Form>
  );
}
