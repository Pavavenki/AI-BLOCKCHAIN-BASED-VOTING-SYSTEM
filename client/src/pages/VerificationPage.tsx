import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const VerificationPage: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const [, setLocation] = useLocation();
  const [confirmed, setConfirmed] = useState(false);
  const { toast } = useToast();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);
  
  // Fetch voter details
  const { data: voter, isLoading } = useQuery({
    queryKey: ["/api/voters/me"],
    enabled: !!token,
  });
  
  const handleProceed = () => {
    if (!confirmed) {
      toast({
        title: "Confirmation Required",
        description: "Please confirm that all details are correct before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    setLocation("/biometric");
  };
  
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Personal Details Verification</h2>
          </div>
          <p className="text-gray-600 mb-6">Loading your information...</p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {Array(12).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
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
          <Shield className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-800">Personal Details Verification</h2>
        </div>
        <p className="text-gray-600 mb-6">Please verify your information before proceeding. If any details are incorrect, contact your local election office.</p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Voter ID</p>
            <p className="font-medium">{voter?.voterId}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{voter?.name}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Date of Birth</p>
            <p className="font-medium">{voter?.dob}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Age</p>
            <p className="font-medium">{voter?.age}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{voter?.email}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Gender</p>
            <p className="font-medium">{voter?.gender}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium">{voter?.address}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">State</p>
            <p className="font-medium">{voter?.state}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">District</p>
            <p className="font-medium">{voter?.district}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Pincode</p>
            <p className="font-medium">{voter?.pincode}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Marital Status</p>
            <p className="font-medium">{voter?.maritalStatus}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Aadhar Number</p>
            <p className="font-medium">{voter?.aadharNumber}</p>
          </div>
        </div>
        
        <div className="flex items-center mb-4">
          <Checkbox 
            id="confirm-verification" 
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked as boolean)}
          />
          <Label htmlFor="confirm-verification" className="ml-2 text-sm text-gray-700">
            I confirm that all the details are correct
          </Label>
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setLocation("/")}>
            Back
          </Button>
          <Button onClick={handleProceed}>
            Proceed to Biometric Verification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationPage;
