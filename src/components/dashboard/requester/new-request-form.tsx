
'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { addHelpRequest } from '@/lib/firebase/firestore';
import { uploadRequestPhoto } from '@/lib/firebase/storage';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, Paperclip, X } from 'lucide-react';
import type { HelpRequest } from '@/lib/types';

const requestSchema = z.object({
  type: z.enum(['Blood', 'Rescue', 'Supplies', 'Medical', 'Other']),
  urgency: z.enum(['Urgent', 'Critical']),
  notes: z.string().optional(),
  location: z.string().min(3, "Location is required."),
  bloodType: z.string().optional(),
});

type RequestFormValues = z.infer<typeof requestSchema>;

export default function NewRequestForm() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      notes: '',
      location: '',
      bloodType: '',
    },
  });

  const requestType = form.watch('type');

  const onSubmit = async (data: RequestFormValues) => {
    if (!user || !userProfile) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);

    let photoURL = '';
    if (photo) {
      try {
        photoURL = await uploadRequestPhoto(user.uid, photo);
      } catch (error) {
        toast({ title: 'Photo Upload Failed', description: 'Could not upload the image, please try again.', variant: 'destructive' });
        setIsSubmitting(false);
        return;
      }
    }
    
    const newRequest: Partial<HelpRequest> = {
      userId: user.uid,
      requesterName: userProfile.name,
      type: data.type,
      urgency: data.urgency,
      description: data.notes,
      location: data.location,
      photoURL: photoURL,
      status: 'pending',
      title: `${data.urgency} ${data.type} request`
    };

    if (data.type === 'Blood') {
      if (!data.bloodType) {
        form.setError('bloodType', { message: 'Blood type is required for blood requests.' });
        setIsSubmitting(false);
        return;
      }
      newRequest.bloodType = data.bloodType;
    }

    addHelpRequest(newRequest as HelpRequest);
    
    toast({
      title: 'Request Sent',
      description: 'Your request for help has been successfully submitted.',
    });
    
    form.reset();
    setPhoto(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
    setIsSubmitting(false);
  };

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Help Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select type of help" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Blood">Blood</SelectItem>
                      <SelectItem value="Rescue">Rescue</SelectItem>
                      <SelectItem value="Supplies">Supplies</SelectItem>
                       <SelectItem value="Medical">Medical</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="urgency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urgency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select urgency level" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        {requestType === 'Blood' && (
            <FormField
                control={form.control}
                name="bloodType"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Blood Type Needed</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select blood type" /></SelectTrigger>
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
        )}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., City, Address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add any extra details about your request." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
            <FormLabel>Photo (Optional)</FormLabel>
            <FormControl>
                <div>
                    <Input 
                        type="file" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                        accept="image/*"
                    />
                    {!photo ? (
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                           <Upload className="mr-2" /> Upload Photo
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2 text-sm p-2 border rounded-md">
                            <Paperclip className="h-4 w-4" />
                            <span className="flex-grow truncate">{photo.name}</span>
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => {setPhoto(null); if(fileInputRef.current) fileInputRef.current.value = '';}}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </FormControl>
        </FormItem>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <><Loader2 className="mr-2 animate-spin" /> Sending...</>
          ) : (
            'Send Request'
          )}
        </Button>
      </form>
    </Form>
  );
}
