import { useAuth } from "@/lib/auth";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header: React.FC = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="bg-primary-600 text-white p-4 shadow">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center">
          <CheckCircle className="h-6 w-6 mr-2" />
          AI & Blockchain Based Voting System
        </h1>
        <div className="flex items-center">
          <div className="text-sm mr-4">Elections Commission of India</div>
          {isAuthenticated && (
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-transparent border-white text-white hover:bg-white hover:text-primary-600" 
              onClick={logout}
            >
              {isAdmin ? "Admin Logout" : "Logout"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
