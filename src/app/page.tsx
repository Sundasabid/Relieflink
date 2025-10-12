
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, LifeBuoy, Send } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero');
  const requestImage = PlaceHolderImages.find(img => img.id === 'feature-request');
  const volunteerImage = PlaceHolderImages.find(img => img.id === 'feature-volunteer');
  const donateImage = PlaceHolderImages.find(img => img.id === 'feature-donate');

  const features = [
    {
      icon: <Send className="h-8 w-8 text-primary" />,
      title: "Request Help",
      description: "Quickly post requests for medical aid, rescue, or other essential supplies during emergencies.",
      image: requestImage,
    },
    {
      icon: <LifeBuoy className="h-8 w-8 text-primary" />,
      title: "Become a Volunteer",
      description: "Join our network of dedicated volunteers and make a direct impact in your community.",
      image: volunteerImage,
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Donate Blood",
      description: "Register as a blood donor and help save lives when it's needed most.",
      image: donateImage,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-6 lg:grid-cols-1 items-center">
              <div className="flex flex-col justify-center space-y-4 text-center text-white">
                <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl xl:text-6xl/none">
                  ReliefLink: Connecting Communities in Crisis
                </h1>
                <p className="max-w-[600px] mx-auto text-lg md:text-xl">
                  Your trusted platform for disaster relief, volunteer coordination, and life-saving blood donations.
                </p>
                <div className="w-full max-w-sm mx-auto space-x-4">
                  <Button size="lg" asChild>
                    <Link href="/signup">
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">How You Can Help</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  ReliefLink provides multiple ways for you to contribute to relief efforts and support your community.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3 pt-12">
              {features.map((feature) => (
                <Card key={feature.title} className="transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                  <CardHeader className="flex flex-col items-center text-center">
                    {feature.icon}
                    <CardTitle className="text-2xl font-bold font-headline mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-muted-foreground">
                    {feature.description}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 ReliefLink. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
