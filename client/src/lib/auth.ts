import { apiRequest } from "./queryClient";
import { Login } from "@shared/schema";

export const loginUser = async (voterId: string, password: string) => {
  const response = await apiRequest("POST", "/api/login", { voterId, password });
  return response.json();
};

export const loginAdmin = async (credentials: { username: string; password: string }) => {
  console.log("Sending admin login request with:", credentials);
  const response = await apiRequest("POST", "/api/admin/login", credentials);
  const data = await response.json();
  console.log("Admin login response:", data);
  return data;
};

export const logoutUser = async () => {
  const response = await apiRequest("GET", "/api/logout");
  return response.json();
};

export const getCurrentUser = async () => {
  try {
    // Try to fetch regular voter first
    const response = await fetch("/api/voter", {
      credentials: "include",
    });
    
    if (response.status === 401) {
      // If not a voter, check if admin
      console.log("Not authenticated as voter, checking admin status");
      try {
        const adminCheckResponse = await fetch("/api/admin/session", {
          credentials: "include",
        });
        
        if (adminCheckResponse.ok) {
          console.log("Admin session found");
          return await adminCheckResponse.json();
        }
        
        return null;
      } catch (adminError) {
        console.error("Admin check error:", adminError);
        return null;
      }
    }
    
    if (!response.ok) {
      throw new Error("Failed to fetch current user");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Auth check error:", error);
    return null;
  }
};
