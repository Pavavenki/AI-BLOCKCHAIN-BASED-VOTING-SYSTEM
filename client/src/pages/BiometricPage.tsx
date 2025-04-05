import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { 
  Camera, 
  Fingerprint, 
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BiometricPage: React.FC = () => {
  const { isAuthenticated, token, voter } = useAuth();
  const [, setLocation] = useLocation();
  const [faceScanComplete, setFaceScanComplete] = useState(false);
  const [fingerprintComplete, setFingerprintComplete] = useState(false);
  const [aadharNumber, setAadharNumber] = useState("");
  const { toast } = useToast();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);
  
  // Fetch voter details to get aadhar number
  const { data: voterDetails } = useQuery({
    queryKey: ["/api/voters/me"],
    enabled: !!token,
    onSuccess: (data) => {
      if (data?.aadharNumber) {
        setAadharNumber(data.aadharNumber);
      }
    }
  });
  
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
  
  // Handle face recognition (mock implementation)
  const handleFaceScan = () => {
    // In a real implementation, this would capture an image and send it to a face recognition API
    if (videoRef.current && canvasRef.current) {
      try {
        // Simulate face recognition with a delay
        setTimeout(() => {
          setFaceScanComplete(true);
          toast({
            title: "Face Recognition Successful",
            description: "Your face has been verified successfully.",
            variant: "default"
          });
        }, 1500);
      } catch (error) {
        toast({
          title: "Face Recognition Failed",
          description: "Please try again with better lighting.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Handle fingerprint scan (mock implementation)
  const handleFingerprintScan = () => {
    // In a real implementation, this would interface with a fingerprint scanner
    // Simulate fingerprint recognition with a delay
    setTimeout(() => {
      setFingerprintComplete(true);
      toast({
        title: "Fingerprint Verification Successful",
        description: "Your fingerprint has been verified successfully.",
        variant: "default"
      });
    }, 1500);
  };
  
  // Handle proceed to voting
  const handleProceedToVoting = () => {
    if (!faceScanComplete || !fingerprintComplete) {
      toast({
        title: "Verification Incomplete",
        description: "Please complete both face and fingerprint verification.",
        variant: "destructive"
      });
      return;
    }
    
    setLocation("/voting");
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          <Camera className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-800">Biometric Verification</h2>
        </div>
        <p className="text-gray-600 mb-6">Please complete the following biometric verification steps to proceed with voting.</p>
        
        <div className="mb-6">
          <label htmlFor="aadhar-number" className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
          <Input 
            id="aadhar-number" 
            value={aadharNumber} 
            onChange={(e) => setAadharNumber(e.target.value)}
            className="w-full" 
            readOnly
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Face Recognition Panel */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-800">Face Recognition</h3>
              <Camera className={`h-6 w-6 ${faceScanComplete ? 'text-green-500' : 'text-gray-400'}`} />
            </div>
            
            <div className="bg-gray-100 rounded-lg mb-3 flex items-center justify-center" style={{ height: "200px" }}>
              {/* Hidden canvas for capturing image */}
              <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
              
              {/* Video element for camera feed (in real implementation) */}
              <div className="text-center relative w-full h-full">
                <video 
                  ref={videoRef} 
                  style={{ display: 'none', width: '100%', height: '100%', objectFit: 'cover' }}
                ></video>
                
                {/* Mockup camera interface */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Camera className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">Camera feed (simulated)</p>
                  {faceScanComplete && (
                    <div className="absolute inset-0 bg-green-100 bg-opacity-70 flex items-center justify-center rounded-lg">
                      <CheckCircle2 className="h-16 w-16 text-green-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <p className={`text-sm ${faceScanComplete ? 'text-green-500' : 'text-gray-500'} mb-3`}>
              {faceScanComplete ? 'Face scan successful' : 'Please align your face in the frame'}
            </p>
            
            <Button 
              className="w-full" 
              variant={faceScanComplete ? "outline" : "default"}
              onClick={handleFaceScan}
            >
              {faceScanComplete ? "Scan Again" : "Capture Photo"}
            </Button>
          </div>
          
          {/* Fingerprint Panel */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-800">Fingerprint Verification</h3>
              <Fingerprint className={`h-6 w-6 ${fingerprintComplete ? 'text-green-500' : 'text-gray-400'}`} />
            </div>
            
            <div className="bg-gray-100 rounded-lg mb-3 flex items-center justify-center" style={{ height: "200px" }}>
              {/* Mockup fingerprint interface */}
              <div className="text-center relative w-full h-full">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Fingerprint className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">Fingerprint scanner (simulated)</p>
                  {fingerprintComplete && (
                    <div className="absolute inset-0 bg-green-100 bg-opacity-70 flex items-center justify-center rounded-lg">
                      <CheckCircle2 className="h-16 w-16 text-green-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <p className={`text-sm ${fingerprintComplete ? 'text-green-500' : 'text-gray-500'} mb-3`}>
              {fingerprintComplete ? 'Fingerprint verified' : 'Please place your finger on the scanner'}
            </p>
            
            <Button 
              className="w-full" 
              variant={fingerprintComplete ? "outline" : "default"}
              onClick={handleFingerprintScan}
            >
              {fingerprintComplete ? "Scan Again" : "Scan Fingerprint"}
            </Button>
          </div>
        </div>
        
        <Alert variant="warning" className="bg-yellow-50 border-l-4 border-yellow-400 mb-6">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <AlertDescription className="ml-3 text-sm text-yellow-700">
              Please ensure proper lighting for face recognition and clean your finger for fingerprint scanning.
            </AlertDescription>
          </div>
        </Alert>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setLocation("/verification")}>
            Back
          </Button>
          <Button 
            onClick={handleProceedToVoting}
            disabled={!faceScanComplete || !fingerprintComplete}
          >
            Proceed to Voting
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BiometricPage;
