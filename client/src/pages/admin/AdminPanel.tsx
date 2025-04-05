import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CandidatesTab from "./CandidatesTab";
import VotersTab from "./VotersTab";
import ResultsTab from "./ResultsTab";

type TabType = "candidates" | "voters" | "results";

const AdminPanel: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>("candidates");
  
  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      setLocation("/");
    }
  }, [isAuthenticated, isAdmin, setLocation]);
  
  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "candidates":
        return <CandidatesTab />;
      case "voters":
        return <VotersTab />;
      case "results":
        return <ResultsTab />;
      default:
        return <CandidatesTab />;
    }
  };
  
  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect in the useEffect
  }
  
  return (
    <Card className="mb-4 overflow-hidden">
      <div className="flex border-b border-gray-200">
        <Button
          variant={activeTab === "candidates" ? "default" : "ghost"}
          className={`rounded-none px-4 py-3 text-sm font-medium h-auto ${
            activeTab === "candidates" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setActiveTab("candidates")}
        >
          Candidates Management
        </Button>
        <Button
          variant={activeTab === "voters" ? "default" : "ghost"}
          className={`rounded-none px-4 py-3 text-sm font-medium h-auto ${
            activeTab === "voters" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setActiveTab("voters")}
        >
          Voter Registration
        </Button>
        <Button
          variant={activeTab === "results" ? "default" : "ghost"}
          className={`rounded-none px-4 py-3 text-sm font-medium h-auto ${
            activeTab === "results" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setActiveTab("results")}
        >
          Election Results
        </Button>
      </div>
      
      {renderTabContent()}
      
      <div className="mt-4 text-center p-4">
        <Button variant="link" onClick={() => setLocation("/")}>
          Logout from Admin Panel
        </Button>
      </div>
    </Card>
  );
};

export default AdminPanel;
