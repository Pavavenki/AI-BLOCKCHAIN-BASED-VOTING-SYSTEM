import { useState, useEffect, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Camera, Fingerprint } from "lucide-react";

export default function BiometricVerification() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [aadharNumber, setAadharNumber] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [fingerprintScanning, setFingerprintScanning] = useState(false);
  const [fingerprintVerified, setFingerprintVerified] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch voter details to check if authorized
  const { isLoading, error } = useQuery({
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

  const activateCamera = () => {
    setCameraActive(true);
    
    // Mock camera activation
    setTimeout(() => {
      setFaceVerified(true);
      toast({
        title: "Face Verification Complete",
        description: "Your face has been verified successfully.",
      });
    }, 2000);
  };

  const scanFingerprint = () => {
    setFingerprintScanning(true);
    
    // Mock fingerprint scanning
    setTimeout(() => {
      setFingerprintScanning(false);
      setFingerprintVerified(true);
      toast({
        title: "Fingerprint Verification Complete",
        description: "Your fingerprint has been verified successfully.",
      });
    }, 2000);
  };

  const handleContinue = () => {
    if (!faceVerified || !fingerprintVerified) {
      toast({
        title: "Verification Required",
        description: "Please complete both face and fingerprint verification",
        variant: "destructive",
      });
      return;
    }
    navigate("/voting");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <ProgressIndicator currentStep="biometric" />
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Biometric Verification</CardTitle>
          <CardDescription className="text-center">
            Please complete both biometric verification steps to proceed to voting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-gray-500">Loading verification details...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Facial Recognition */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Facial Recognition</h2>
                
                <div className="mb-4">
                  <Label htmlFor="aadhar-number">Aadhar Number</Label>
                  <Input
                    id="aadhar-number"
                    placeholder="XXXX-XXXX-XXXX"
                    value={aadharNumber}
                    onChange={(e) => setAadharNumber(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="mb-4">
                  <div 
                    className="bg-gray-200 rounded-lg h-48 flex items-center justify-center overflow-hidden"
                  >
                    {cameraActive ? (
                      <video
                        ref={videoRef}
                        className="h-full w-full object-cover"
                        autoPlay
                        playsInline
                        muted
                      />
                    ) : (
                      <p className="text-gray-500 text-center">Camera feed will appear here</p>
                    )}
                  </div>
                </div>
                
                <Button
                  className="w-full"
                  onClick={activateCamera}
                  disabled={cameraActive}
                  variant={cameraActive ? (faceVerified ? "success" : "default") : "default"}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {cameraActive ? (faceVerified ? "Camera Active" : "Analyzing...") : "Activate Camera"}
                </Button>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium">Verification Status:</span>
                  <span className={`font-medium ${faceVerified ? "text-green-600" : "text-red-600"}`}>
                    {faceVerified ? "Verified" : "Not Verified"}
                  </span>
                </div>
              </div>
              
              {/* Fingerprint Verification */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Fingerprint Verification</h2>
                
                <div className="mb-4 flex justify-center">
                  <div className="bg-gray-200 w-32 h-32 rounded-lg flex items-center justify-center">
                    <Fingerprint className="h-20 w-20 text-gray-400" />
                  </div>
                </div>
                
                <Button
                  className="w-full"
                  onClick={scanFingerprint}
                  disabled={fingerprintScanning || fingerprintVerified}
                  variant={fingerprintVerified ? "success" : "default"}
                >
                  {fingerprintScanning ? (
                    <span className="animate-pulse">Scanning...</span>
                  ) : fingerprintVerified ? (
                    "Scan Complete"
                  ) : (
                    <>
                      <Fingerprint className="mr-2 h-4 w-4" />
                      Scan Fingerprint
                    </>
                  )}
                </Button>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium">Verification Status:</span>
                  <span className={`font-medium ${fingerprintVerified ? "text-green-600" : "text-red-600"}`}>
                    {fingerprintVerified ? "Verified" : "Not Verified"}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate("/personal-details")}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={handleContinue} 
              className="flex items-center"
              disabled={!faceVerified || !fingerprintVerified}
            >
              Continue to Voting
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
