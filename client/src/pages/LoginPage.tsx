import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

// Form schema
const loginSchema = z.object({
  voterId: z.string().min(1, "Voter ID is required"),
  password: z.string().min(1, "Password is required")
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Password must be in format DD/MM/YYYY")
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { login, adminLogin } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize the form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      voterId: "",
      password: ""
    }
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      // Special case for admin login
      if (data.voterId.toLowerCase() === "admin" && data.password === "admin") {
        await adminLogin("admin", "admin");
        return;
      }
      
      // Regular voter login
      await login(data.voterId, data.password);
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid voter ID or password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="h-12 w-12 mx-auto text-primary-600 mb-2">
              <Lock className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Voter Login</h2>
            <p className="text-gray-600">Please enter your credentials to continue</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="voterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Voter ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your voter ID" {...field} />
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
                    <FormLabel>Password (Date of Birth - DD/MM/YYYY)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="DD/MM/YYYY" {...field} />
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">Enter your date of birth in the format DD/MM/YYYY</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Alert variant="default" className="bg-blue-50 border-l-4 border-primary-500">
        <div className="flex">
          <InfoIcon className="h-5 w-5 text-primary-500" />
          <AlertDescription className="ml-3 text-sm text-blue-700">
            If you're facing any issues logging in, please contact your local election office.
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
};

export default LoginPage;
