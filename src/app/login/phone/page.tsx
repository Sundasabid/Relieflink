
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult: ConfirmationResult;
  }
}

const phoneSchema = z.object({
  phone: z.string().min(10, { message: "Please enter a valid phone number with country code." }),
});
const codeSchema = z.object({
  code: z.string().length(6, { message: "Verification code must be 6 digits." }),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type CodeFormValues = z.infer<typeof codeSchema>;

export default function PhoneLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"phone" | "code">("phone");

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
  });
  const codeForm = useForm<CodeFormValues>({
    resolver: zodResolver(codeSchema),
  });

  useEffect(() => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: (response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log("reCAPTCHA solved");
      },
    });
  }, []);

  const onSendCode = async (data: PhoneFormValues) => {
    setIsLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, data.phone, appVerifier);
      window.confirmationResult = confirmationResult;
      console.log("OTP sent to", data.phone);
      toast({
        title: "Code Sent",
        description: `An OTP has been sent to ${data.phone}.`,
      });
      setStep("code");
    } catch (error: any) {
      console.error("Phone sign-in error:", error.message);
      toast({
        title: "Failed to Send Code",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyCode = async (data: CodeFormValues) => {
    setIsLoading(true);
    try {
      const result = await window.confirmationResult.confirm(data.code);
      console.log("Phone number verified:", result.user.uid);
      toast({
        title: "Signed In",
        description: "Welcome! Redirecting you to the dashboard.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("OTP verification error:", error.message);
      toast({
        title: "Invalid Code",
        description: "The code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-[calc(100vh-4rem)] items-center justify-center">
      <div id="recaptcha-container"></div>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Icons.logo className="mx-auto h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold font-headline tracking-tight">
            Sign In with Phone
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === 'phone' 
              ? "Enter your phone number to receive a verification code."
              : "Enter the 6-digit code sent to your phone."}
          </p>
        </div>
        <div className="grid gap-6">
          {step === 'phone' ? (
            <form onSubmit={phoneForm.handleSubmit(onSendCode)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 123 456 7890"
                    type="tel"
                    autoComplete="tel"
                    disabled={isLoading}
                    {...phoneForm.register("phone")}
                  />
                  {phoneForm.formState.errors.phone && (
                    <p className="px-1 text-xs text-destructive">
                      {phoneForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>
                <Button disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Verification Code
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={codeForm.handleSubmit(onVerifyCode)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    placeholder="123456"
                    type="text"
                    autoComplete="one-time-code"
                    disabled={isLoading}
                    {...codeForm.register("code")}
                  />
                  {codeForm.formState.errors.code && (
                    <p className="px-1 text-xs text-destructive">
                      {codeForm.formState.errors.code.message}
                    </p>
                  )}
                </div>
                <Button disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify and Sign In
                </Button>
              </div>
            </form>
          )}
        </div>
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Back to other login methods
          </Link>
        </p>
      </div>
    </div>
  );
}
