import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, User, CheckCircle2, Shield } from "lucide-react";

export default function Navbar() {
  const [, navigate] = useLocation();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-primary shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div onClick={() => navigate("/")} className="flex items-center flex-shrink-0 text-white cursor-pointer">
              <CheckCircle2 className="h-8 w-8" />
              <span className="ml-2 text-white text-lg font-medium">
                AI & Blockchain Voting System
              </span>
            </div>
          </div>
          
          <div className="flex items-center">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-primary-light">
                    {isAdmin ? (
                      <Shield className="mr-2 h-4 w-4" />
                    ) : (
                      <User className="mr-2 h-4 w-4" />
                    )}
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Shield className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-primary-light"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
