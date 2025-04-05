import { useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ThankYouPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // Disable browser back button for this page
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    
    window.addEventListener("popstate", handlePopState);
    
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
  
  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p>You must be logged in to view this page.</p>
          <Link href="/">
            <Button className="mt-4">Go to Login</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <div className="rounded-full bg-green-500 w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You for Voting!</h2>
        <p className="text-gray-600 mb-6">
          Your vote has been successfully recorded on the blockchain. Your participation in the democratic process is vital for our nation.
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto mb-6">
          <p className="text-green-700 text-sm">
            A confirmation receipt has been sent to your registered email address. This receipt contains a unique transaction ID that you can use to verify your vote.
          </p>
        </div>
        
        <Link href="/">
          <Button>
            Return to Home
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ThankYouPage;
