
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getSuggestedRole } from "@/lib/actions";
import { getDonorData, getVolunteerData, getUserRequests } from "@/lib/firebase/firestore";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import type { SuggestUserRoleOutput } from "@/ai/flows/suggest-user-role";

export default function RoleSuggester() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestUserRoleOutput | null>(null);

  const handleSuggestion = async () => {
    if (!user || !userProfile) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setSuggestion(null);

    try {
      // Fetch all relevant data for the user
      const [volunteerData, donorData, requestsData] = await Promise.all([
        getVolunteerData(user.uid),
        getDonorData(user.uid),
        getUserRequests(user.uid),
      ]);

      const result = await getSuggestedRole({
        profile: JSON.stringify(userProfile),
        volunteerData: JSON.stringify(volunteerData || {}),
        donorInfo: JSON.stringify(donorData || {}),
        requests: requestsData,
      });

      setSuggestion(result);
      toast({
        title: "Suggestion Ready!",
        description: "Our AI has suggested a role for you.",
      });
    } catch (error: any) {
      toast({
        title: "Suggestion Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center text-center p-6 border-2 border-dashed rounded-lg">
        <Wand2 className="h-12 w-12 text-accent mb-4" />
        <p className="text-muted-foreground mb-4">
          Click the button below to analyze your profile and contributions to get a personalized role suggestion.
        </p>
        <Button onClick={handleSuggestion} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Suggest My Role
            </>
          )}
        </Button>
      </div>
      
      {suggestion && (
        <Card className="bg-secondary/50 animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="text-center">AI Suggestion Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
             <div>
                <p className="text-sm font-medium text-muted-foreground">Suggested Role</p>
                <Badge className="text-xl capitalize mt-1 py-1 px-4">{suggestion.suggestedRole}</Badge>
             </div>
             <div>
                <p className="text-sm font-medium text-muted-foreground">Confidence Score</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <Progress value={suggestion.confidence * 100} className="w-1/2" />
                    <span className="font-bold font-mono text-primary">{(suggestion.confidence * 100).toFixed(0)}%</span>
                </div>
             </div>
             <div>
                <p className="text-sm font-medium text-muted-foreground">Reasoning</p>
                <p className="mt-1 text-sm bg-background/50 p-3 rounded-md border">{suggestion.reasoning}</p>
             </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
