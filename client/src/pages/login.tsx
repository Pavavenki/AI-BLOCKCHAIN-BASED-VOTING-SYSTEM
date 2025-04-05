import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Unified login schema
const unifiedLoginSchema = z.object({
  identifier: z.string().min(1, "Username or Voter ID is required"),
  password: z.string().min(1, "Password is required"),
});

type UnifiedLoginFormValues = z.infer<typeof unifiedLoginSchema>;

export default function Login() {
  const [, navigate] = useLocation();
  const { login, adminLogin, isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle redirection using useEffect instead of conditional return
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/personal-details");
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const form = useForm<UnifiedLoginFormValues>({
    resolver: zodResolver(unifiedLoginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: UnifiedLoginFormValues) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const identifier = data.identifier.trim();
      
      // Check if it's an admin login (simple username format) or voter login (VOT prefix)
      if (identifier.startsWith("VOT") || identifier.match(/^VOT\d+$/)) {
        // Attempt voter login
        console.log("Attempting voter login with:", identifier);
        await login(identifier, data.password);
        
        toast({
          title: "Voter Login Successful",
          description: "Welcome to the Voting System",
        });
      } else {
        // Attempt admin login
        console.log("Attempting admin login with username:", identifier);
        await adminLogin(identifier, data.password);
        
        toast({
          title: "Admin Login Successful",
          description: "Welcome to the Admin Panel",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Secure Login</CardTitle>
          <CardDescription className="text-center">
            Access the AI Blockchain-based Voting System
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username / Voter ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your ID or username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full mt-2" 
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-100">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Test Credentials:</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-medium text-blue-800">Example 1:</h4>
                <p className="text-xs text-blue-800">ID: VOT123456</p>
                <p className="text-xs text-blue-800">Password: 01/01/1990</p>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-blue-800">Example 2:</h4>
                <p className="text-xs text-blue-800">Username: admin</p>
                <p className="text-xs text-blue-800">Password: admin123</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
