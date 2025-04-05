import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Clipboard, Party } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Party logos as SVG components
const PartyLogos: Record<string, React.ReactNode> = {
  lotus: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-full w-full text-primary-600">
      <path fill="currentColor" d="M12,2C7.03,2,3,6.03,3,11c0,2.1,0.73,4.03,1.94,5.56c1.41-2.39,3.93-4,6.81-4s5.4,1.61,6.81,4 C20.27,15.03,21,13.1,21,11C21,6.03,16.97,2,12,2z M12,8c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,8,12,8z"/>
      <path fill="currentColor" d="M12,14c-3.03,0-5.78,1.23-7.76,3.22C5.51,19.2,8.53,21,12,21s6.49-1.8,7.76-3.78C17.78,15.23,15.03,14,12,14z"/>
    </svg>
  ),
  hand: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-full w-full text-primary-600">
      <path fill="currentColor" d="M18,2c1.1,0,2,0.9,2,2v8c0,3.31-2.69,6-6,6h-2c-0.59,0-1.14-0.16-1.62-0.42C9.82,18.17,9.38,18.7,9.17,19.3 C9.69,19.75,10.33,20,11,20h5v2H6v-2c0-1.66,1.34-3,3-3h0.17c0.41-1.16,0.57-2.21,0.43-3.06C8.22,14.61,7,13.45,7,12 c0-1.66,1.34-3,3-3s3,1.34,3,3h2c1.1,0,2-0.9,2-2V4C17,2.9,17.9,2,19,2H18z"/>
    </svg>
  ),
  elephant: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-full w-full text-primary-600">
      <path fill="currentColor" d="M19.5,14.5c0,0.79-0.29,1.51-0.76,2.06c0.63,0.78,1.64,1.65,1.64,3.69c0,1.66-1.34,3-3,3c-0.5,0-0.97-0.13-1.41-0.41 C13.42,21.94,11.5,21,7,21c-2.21,0-4-1.79-4-4c0-2.21,1.79-4,4-4c0.36,0,0.71,0.05,1.06,0.15c0.28-0.95,0.91-1.87,1.94-2.66 c1.97-1.51,5-3.49,7-3.49h1c2.35,0,4.25,1.9,4.25,4.25c0,0.8-0.23,1.54-0.61,2.18C19.39,13.73,19.5,14.1,19.5,14.5z"/>
    </svg>
  ),
  cycle: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-full w-full text-primary-600">
      <path fill="currentColor" d="M15.5,5.5c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S14.4,5.5,15.5,5.5z M5,12c-2.8,0-5,2.2-5,5s2.2,5,5,5s5-2.2,5-5 S7.8,12,5,12z M5,20.5c-1.9,0-3.5-1.6-3.5-3.5s1.6-3.5,3.5-3.5s3.5,1.6,3.5,3.5S6.9,20.5,5,20.5z M19,12c-2.8,0-5,2.2-5,5 s2.2,5,5,5s5-2.2,5-5S21.8,12,19,12z M19,20.5c-1.9,0-3.5-1.6-3.5-3.5s1.6-3.5,3.5-3.5s3.5,1.6,3.5,3.5S20.9,20.5,19,20.5z M12,14l3.2-3.8l-3.2-4.2v3h-4v2h4V14z"/>
    </svg>
  )
};

const VotingPage: React.FC = () => {
  const { isAuthenticated, token, voter } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [confirmDetails, setConfirmDetails] = useState(false);
  const { toast } = useToast();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);
  
  // Check if voter has already voted
  useEffect(() => {
    if (voter?.hasVoted) {
      toast({
        title: "Already Voted",
        description: "You have already cast your vote and cannot vote again.",
        variant: "destructive"
      });
      setLocation("/");
    }
  }, [voter, toast, setLocation]);
  
  // Fetch voter details
  const { data: voterDetails, isLoading: isVoterLoading } = useQuery({
    queryKey: ["/api/voters/me"],
    enabled: !!token
  });
  
  // Fetch candidates for the voter's constituency
  const { data: candidates, isLoading: isCandidatesLoading } = useQuery({
    queryKey: ["/api/candidates"],
    enabled: !!token
  });
  
  // Cast vote mutation
  const castVoteMutation = useMutation({
    mutationFn: async (candidateId: number) => {
      const response = await apiRequest('POST', '/api/votes', {
        voterId: voter?.voterId,
        candidateId
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries that might have changed
      queryClient.invalidateQueries({ queryKey: ["/api/voters/me"] });
      
      // Navigate to thank you page
      setLocation("/thank-you");
    },
    onError: (error) => {
      toast({
        title: "Voting Failed",
        description: error instanceof Error ? error.message : "Failed to cast your vote. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCandidate) {
      toast({
        title: "No Candidate Selected",
        description: "Please select a candidate to vote.",
        variant: "destructive"
      });
      return;
    }
    
    if (!confirmDetails) {
      toast({
        title: "Confirmation Required",
        description: "Please confirm your details before casting your vote.",
        variant: "destructive"
      });
      return;
    }
    
    // Cast the vote
    castVoteMutation.mutate(selectedCandidate);
  };
  
  // Loading state
  if (isVoterLoading || isCandidatesLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4">
            <Clipboard className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Cast Your Vote</h2>
          </div>
          <p className="text-gray-600 mb-6">Loading candidate information...</p>
          
          <div className="space-y-4 mb-6">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          <Clipboard className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-800">Cast Your Vote</h2>
        </div>
        <p className="text-gray-600 mb-6">Please select your preferred candidate and confirm your vote. Remember, you can vote only once.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Constituency: {voterDetails?.constituency || "Mumbai South"}</h3>
            
            <RadioGroup value={selectedCandidate?.toString()} onValueChange={(value) => setSelectedCandidate(parseInt(value))}>
              {candidates?.map((candidate: any) => (
                <div key={candidate.id} className="border border-gray-200 rounded-lg p-4 mb-3">
                  <div className="flex items-start">
                    <RadioGroupItem value={candidate.id.toString()} id={`candidate-${candidate.id}`} className="mt-1" />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`candidate-${candidate.id}`} className="font-medium text-gray-800">
                          {candidate.partyName}
                        </Label>
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          {PartyLogos[candidate.partyLogo] || <Party className="h-6 w-6 text-primary-600" />}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">Candidate: {candidate.candidateName}</p>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-md font-medium text-gray-800 mb-3">Voter Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Voter ID:</span>
                <span className="font-medium ml-1">{voterDetails?.voterId}</span>
              </div>
              <div>
                <span className="text-gray-500">Name:</span>
                <span className="font-medium ml-1">{voterDetails?.name}</span>
              </div>
              <div>
                <span className="text-gray-500">District:</span>
                <span className="font-medium ml-1">{voterDetails?.district}</span>
              </div>
              <div>
                <span className="text-gray-500">State:</span>
                <span className="font-medium ml-1">{voterDetails?.state}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center mb-6">
            <Checkbox 
              id="confirm-details" 
              checked={confirmDetails}
              onCheckedChange={(checked) => setConfirmDetails(checked as boolean)}
            />
            <Label htmlFor="confirm-details" className="ml-2 text-sm text-gray-700">
              I confirm that I am the registered voter and I am casting my vote with my own free will without any influence.
            </Label>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setLocation("/biometric")} type="button">
              Back
            </Button>
            <Button type="submit" disabled={castVoteMutation.isPending}>
              {castVoteMutation.isPending ? "Processing..." : "Cast My Vote"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default VotingPage;
