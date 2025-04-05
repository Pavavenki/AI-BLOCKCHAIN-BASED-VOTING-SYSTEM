import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ProgressIndicator from "@/components/layout/progress-indicator";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertTriangle, Check } from "lucide-react";

export default function Voting() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [identityConfirmed, setIdentityConfirmed] = useState(false);

  // Fetch voter details
  const { data: voter, isLoading: voterLoading, error: voterError } = useQuery({
    queryKey: ['/api/voter/details'],
    retry: false,
  });

  // Fetch candidates
  const { data: candidates, isLoading: candidatesLoading, error: candidatesError } = useQuery({
    queryKey: ['/api/candidates', voter?.constituency],
    retry: 1,
    enabled: !!voter?.constituency,
  });

  // Vote submission mutation
  const voteMutation = useMutation({
    mutationFn: (candidateId: number) => 
      apiRequest("POST", "/api/vote", { candidateId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/voter/details'] });
      navigate("/thank-you");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit your vote. Please try again.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    // Check if user is authenticated
    if (voterError) {
      toast({
        title: "Authentication Required",
        description: "Please login to access this page",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [voterError, navigate, toast]);

  // Check if voter has already voted
  useEffect(() => {
    if (voter && voter.hasVoted) {
      toast({
        title: "Already Voted",
        description: "You have already cast your vote",
        variant: "destructive",
      });
      navigate("/thank-you");
    }
  }, [voter, navigate, toast]);

  const handleSubmitVote = () => {
    if (!selectedCandidate) {
      toast({
        title: "Selection Required",
        description: "Please select a candidate to vote",
        variant: "destructive",
      });
      return;
    }

    if (!identityConfirmed) {
      toast({
        title: "Confirmation Required",
        description: "Please confirm your identity before voting",
        variant: "destructive",
      });
      return;
    }

    voteMutation.mutate(selectedCandidate);
  };

  const isLoading = voterLoading || candidatesLoading;
  const error = voterError || candidatesError;

  return (
    <div className="container mx-auto py-8 px-4">
      <ProgressIndicator currentStep="voting" />
      
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Cast Your Vote</CardTitle>
          <CardDescription className="text-center">
            Please select one candidate to cast your vote.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load voting information. Please try again.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {voter && (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
                  <h3 className="text-sm font-medium text-blue-800">Voter Information:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    <div>
                      <p className="text-xs text-blue-500">Voter ID:</p>
                      <p className="text-sm text-blue-800 font-medium">{voter.voterId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-500">Name:</p>
                      <p className="text-sm text-blue-800 font-medium">{voter.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-500">Constituency:</p>
                      <p className="text-sm text-blue-800 font-medium">{voter.constituency}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {candidates && candidates.length > 0 ? (
                <RadioGroup value={selectedCandidate?.toString()} onValueChange={(value) => setSelectedCandidate(parseInt(value))}>
                  <div className="space-y-4 mb-8">
                    {candidates.map((candidate) => (
                      <div key={candidate.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                          <RadioGroupItem 
                            value={candidate.id.toString()} 
                            id={`candidate-${candidate.id}`}
                          />
                          <div className="ml-4 flex-1 flex items-center">
                            <div 
                              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${candidate.partyColor}25` }}
                            >
                              <span style={{ color: candidate.partyColor }} className="font-bold text-sm">
                                {candidate.partyShortName}
                              </span>
                            </div>
                            <div className="ml-4">
                              <p className="font-medium">{candidate.name}</p>
                              <p className="text-sm text-gray-500">{candidate.partyName}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <p className="text-center text-gray-500 my-8">No candidates found for your constituency</p>
              )}
              
              <div className="flex items-center mb-6">
                <Checkbox 
                  id="identity-confirmed" 
                  checked={identityConfirmed}
                  onCheckedChange={(checked) => setIdentityConfirmed(checked as boolean)}
                />
                <Label htmlFor="identity-confirmed" className="ml-2">
                  I confirm my identity and that I am casting this vote of my own free will
                </Label>
              </div>
              
              <Alert variant="warning" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important Notice:</AlertTitle>
                <AlertDescription>
                  You can only vote once. Once submitted, your vote cannot be changed.
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate("/biometric-verification")}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleSubmitVote} 
            className="flex items-center"
            disabled={isLoading || voteMutation.isPending}
            variant="default"
            size="lg"
          >
            {voteMutation.isPending ? (
              "Processing..."
            ) : (
              <>
                Submit Vote
                <Check className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
