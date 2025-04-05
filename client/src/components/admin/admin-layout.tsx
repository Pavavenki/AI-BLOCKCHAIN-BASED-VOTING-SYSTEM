import { useEffect } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  Shield,
  ChevronDown,
  Users,
  PieChart,
  UserPlus,
  Home
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const [isCandidatesRoute] = useRoute("/admin/candidates");
  const [isVotersRoute] = useRoute("/admin/voters");
  const [isResultsRoute] = useRoute("/admin/results");
  const [isAdminHome] = useRoute("/admin");

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/login");
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const getActiveTab = () => {
    if (isAdminHome || isCandidatesRoute) return "candidates";
    if (isVotersRoute) return "voters";
    if (isResultsRoute) return "results";
    return "candidates";
  };

  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-primary shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <a className="flex items-center flex-shrink-0 text-white">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span className="ml-2 text-white text-lg font-medium">Admin Panel</span>
                </a>
              </Link>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" className="text-white hover:bg-primary-light mr-2" asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Main Site
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-primary-light">
                    <Shield className="mr-2 h-4 w-4" />
                    Administrator
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Tabs */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex">
            <Link href="/admin/candidates">
              <a className={`px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'candidates' 
                  ? 'border-primary bg-primary text-white' 
                  : 'border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}>
                <UserPlus className="inline-block mr-2 h-4 w-4" />
                Candidates
              </a>
            </Link>
            <Link href="/admin/voters">
              <a className={`px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'voters' 
                  ? 'border-primary bg-primary text-white' 
                  : 'border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}>
                <Users className="inline-block mr-2 h-4 w-4" />
                Voters
              </a>
            </Link>
            <Link href="/admin/results">
              <a className={`px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'results' 
                  ? 'border-primary bg-primary text-white' 
                  : 'border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}>
                <PieChart className="inline-block mr-2 h-4 w-4" />
                Results
              </a>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
