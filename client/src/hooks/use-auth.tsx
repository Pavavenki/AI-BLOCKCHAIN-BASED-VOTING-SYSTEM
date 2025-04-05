import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { loginUser, loginAdmin, logoutUser, getCurrentUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: any | null;
  login: (voterId: string, password: string) => Promise<void>;
  adminLogin: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  login: async () => {},
  adminLogin: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getCurrentUser();
        
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          setIsAdmin(!!userData.username); // Admin has username property
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (voterId: string, password: string) => {
    try {
      console.log("Logging in regular voter:", voterId);
      const response = await loginUser(voterId, password);
      
      if (response.success) {
        console.log("Voter login successful:", response.user);
        setUser(response.user);
        setIsAuthenticated(true);
        setIsAdmin(false);
        setLocation("/personal-details");
        
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const adminLogin = async (username: string, password: string) => {
    try {
      console.log("Logging in admin:", username);
      const response = await loginAdmin({ username, password });
      
      if (response.success) {
        console.log("Admin login successful:", response.user);
        
        // Make sure to set isAdmin flag
        const adminUser = {
          ...response.user,
          isAdmin: true
        };
        
        setUser(adminUser);
        setIsAuthenticated(true);
        setIsAdmin(true);
        
        // Clear any existing queries to prevent data leakage
        queryClient.clear();
        
        // Redirect to admin panel
        setLocation("/admin");
        
        toast({
          title: "Admin Login Successful",
          description: "Welcome to the admin panel!",
        });
      } else {
        throw new Error(response.message || "Admin login failed");
      }
    } catch (error: any) {
      console.error("Admin login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid admin credentials. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      queryClient.clear();
      setLocation("/login");
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: error.message || "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        isAdmin,
        user,
        login,
        adminLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);