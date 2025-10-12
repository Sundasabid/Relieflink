
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ProfileForm from "@/components/dashboard/profile-form";
import RequestForm from "@/components/dashboard/request-form";
import VolunteerForm from "@/components/dashboard/volunteer-form";
import DonorForm from "@/components/dashboard/donor-form";
import RoleSuggester from "@/components/dashboard/role-suggester";
import { User, MessageSquare, Shield, Heart, Sparkles } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4"/>Profile</TabsTrigger>
          <TabsTrigger value="requests"><MessageSquare className="mr-2 h-4 w-4"/>Submit Request</TabsTrigger>
          <TabsTrigger value="volunteer"><Shield className="mr-2 h-4 w-4"/>Volunteer</TabsTrigger>
          <TabsTrigger value="donor"><Heart className="mr-2 h-4 w-4"/>Donor</TabsTrigger>
          <TabsTrigger value="ai-role"><Sparkles className="mr-2 h-4 w-4"/>Role Suggestion</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>
                Manage your profile information and role.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <ProfileForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Request</CardTitle>
              <CardDescription>
                Need help? Post a request for medical aid, rescue, or supplies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <RequestForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="volunteer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Register as a Volunteer</CardTitle>
              <CardDescription>
                Join our response team. Tell us about your skills and availability.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <VolunteerForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="donor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Register as a Blood Donor</CardTitle>
              <CardDescription>
                Your donation can save a life. Provide your details below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <DonorForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ai-role" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Role Suggestion</CardTitle>
              <CardDescription>
                Let our AI analyze your information to suggest the most suitable role for you on ReliefLink.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <RoleSuggester />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
