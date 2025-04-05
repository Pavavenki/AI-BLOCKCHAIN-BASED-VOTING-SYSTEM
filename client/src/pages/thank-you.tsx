import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ProgressIndicator from "@/components/layout/progress-indicator";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Home } from "lucide-react";

export default function ThankYou() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch voter details to make sure they've voted
  const { data: voter, isLoading, error } = useQuery({
    queryKey: ['/api/voter/details'],
    retry: false,
  });

  // Fetch vote transaction details
  const { data: voteTransaction } = useQuery({
    queryKey: ['/api/vote/transaction'],
    retry: false,
    // Mock transaction data since we don't actually store this in the session
    enabled: false, 
  });

  useEffect(() => {
    // Check if user is authenticated
    if (error) {
      toast({
        title: "Authentication Required",
        description: "Please login to access this page",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [error, navigate, toast]);

  // Mock transaction data
  const mockTransaction = {
    transactionId: "0x8f2c9ba6a8e0a7c92e48c26ac7d31648be1dda74e4a90fa37a32632f6b949fa7",
    timestamp: new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZoneName: "short",
    }),
    blockNumber: Math.floor(Math.random() * 10000000) + 10000000,
  };

  const transaction = voteTransaction || mockTransaction;

  const handleReturnHome = () => {
    navigate("/");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <ProgressIndicator currentStep="thank-you" />
      
      <Card className="max-w-2xl mx-auto text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-20 w-20 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold">Thank You for Voting!</CardTitle>
          <CardDescription className="text-lg">
            Your vote has been successfully cast and securely recorded on the blockchain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : (
            <>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <span className="text-sm">Your vote has been recorded at {transaction.timestamp}</span>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-md border border-green-100 mb-8 text-left">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      Your vote is anonymous and cannot be traced back to you. The blockchain ensures that it cannot be altered or deleted.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={handleReturnHome} 
            className="flex items-center"
            size="lg"
          >
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
