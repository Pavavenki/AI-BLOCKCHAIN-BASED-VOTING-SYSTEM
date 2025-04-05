import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ProgressIndicator from "@/components/layout/progress-indicator";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function PersonalDetails() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [detailsConfirmed, setDetailsConfirmed] = useState(false);

  // Fetch voter details
  const { data: voter, isLoading, error } = useQuery({
    queryKey: ['/api/voter/details'],
    retry: false,
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

  const handleContinue = () => {
    if (!detailsConfirmed) {
      toast({
        title: "Confirmation Required",
        description: "Please confirm that your details are correct",
        variant: "destructive",
      });
      return;
    }
    navigate("/biometric-verification");
  };

  const handleReportIncorrect = () => {
    toast({
      title: "Report Submitted",
      description: "An administrator will review your information shortly.",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <ProgressIndicator currentStep="personal-details" />
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Personal Details Verification</CardTitle>
          <CardDescription className="text-center">
            Please verify your personal information before proceeding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array(12).fill(0).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : voter ? (
            <>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Voter ID</p>
                    <p className="font-medium">{voter.voterId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{voter.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">{voter.dob}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-medium">{voter.age}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email ID</p>
                    <p className="font-medium">{voter.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium">{voter.gender}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{voter.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">State</p>
                    <p className="font-medium">{voter.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">District</p>
                    <p className="font-medium">{voter.district}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pincode</p>
                    <p className="font-medium">{voter.pincode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Marital Status</p>
                    <p className="font-medium">{voter.maritalStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Aadhar Number</p>
                    <p className="font-medium">{voter.aadharNumber}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center mb-6">
                <Checkbox 
                  id="details-correct" 
                  checked={detailsConfirmed}
                  onCheckedChange={(checked) => setDetailsConfirmed(checked as boolean)}
                />
                <Label htmlFor="details-correct" className="ml-2">
                  I confirm that all the above details are correct
                </Label>
              </div>
              
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/login")}
                  className="flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <div>
                  <Button 
                    variant="link" 
                    className="mr-4 text-secondary" 
                    onClick={handleReportIncorrect}
                  >
                    Report Incorrect Details
                  </Button>
                  <Button onClick={handleContinue} className="flex items-center">
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">No voter details found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
