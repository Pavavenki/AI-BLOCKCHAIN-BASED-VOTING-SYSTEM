import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";

// Layout components
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

// Pages
import Login from "@/pages/login";
import PersonalDetails from "@/pages/personal-details";
import BiometricVerification from "@/pages/biometric-verification";
import Voting from "@/pages/voting";
import ThankYou from "@/pages/thank-you";
import AdminCandidates from "@/pages/admin/candidates";
import AdminVoters from "@/pages/admin/voters";
import AdminResults from "@/pages/admin/results";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow">
          <Switch>
            <Route path="/" component={Login} />
            <Route path="/login" component={Login} />
            <Route path="/personal-details" component={PersonalDetails} />
            <Route path="/biometric-verification" component={BiometricVerification} />
            <Route path="/voting" component={Voting} />
            <Route path="/thank-you" component={ThankYou} />
            <Route path="/admin" component={AdminCandidates} />
            <Route path="/admin/candidates" component={AdminCandidates} />
            <Route path="/admin/voters" component={AdminVoters} />
            <Route path="/admin/results" component={AdminResults} />
            <Route component={NotFound} />
          </Switch>
        </div>
        <Footer />
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;
