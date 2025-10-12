
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getDonorData, setDonorData } from "@/lib/firebase/firestore";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const donorSchema = z.object({
  bloodType: z.string().min(1, "Blood type is required."),
  availability: z.string().min(5, "Please describe your availability."),
  location: z.string().min(3, "Location is required."),
});

type DonorFormValues = z.infer<typeof donorSchema>;

export default function DonorForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DonorFormValues>({
    resolver: zodResolver(donorSchema),
    defaultValues: {
      bloodType: "",
      availability: "",
      location: "",
    },
  });

  useEffect(() => {
    if (user) {
      getDonorData(user.uid).then((data) => {
        if (data) {
          form.reset(data);
        }
      });
    }
  }, [user, form]);

  const onSubmit = async (data: DonorFormValues) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    setDonorData(user.uid, { userId: user.uid, ...data });
    toast({
      title: "Registration Submitted",
      description: "Thank you for registering as a blood donor! Your information is being saved.",
    });
    // The UI is updated optimistically, so we can reset the submitting state.
    // Errors will be handled by the global error listener.
    setIsSubmitting(false);
  };
  
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <FormField
          control={form.control}
          name="bloodType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Blood Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
        <FormField
          control={form.control}
          name="availability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Availability</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Any time, Next Tuesday" {...field} />
              </FormControl>
              <FormDescription>When are you available to donate?</FormDescription>
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
                The area where you can donate.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Donor Info
        </Button>
      </form>
    </Form>
  );
}
