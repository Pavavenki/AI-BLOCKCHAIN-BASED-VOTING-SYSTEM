import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface ProgressIndicatorProps {
  currentStep: "login" | "personal-details" | "biometric" | "voting" | "thank-you";
}

type Step = {
  id: string;
  label: string;
};

export default function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const [, navigate] = useLocation();
  const [steps, setSteps] = useState<Step[]>([
    { id: "login", label: "Login" },
    { id: "personal-details", label: "Verify Details" },
    { id: "biometric", label: "Biometric" },
    { id: "voting", label: "Vote" },
    { id: "thank-you", label: "Complete" },
  ]);

  const handleStepClick = (stepId: string) => {
    // Only allow navigation to previous steps or current step
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    const clickedIndex = steps.findIndex(step => step.id === stepId);
    
    if (clickedIndex <= currentIndex) {
      navigate(`/${stepId === 'login' ? '' : stepId}`);
    }
  };

  // Only show on relevant pages
  if (!["login", "personal-details", "biometric", "voting", "thank-you"].includes(currentStep)) {
    return null;
  }

  return (
    <div className="bg-white shadow-sm mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-center space-x-2 md:space-x-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => handleStepClick(step.id)}
                disabled={step.id === currentStep}
                className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium 
                  ${step.id === currentStep ? 'bg-primary text-white' : 
                    index < steps.findIndex(s => s.id === currentStep) ? 'bg-green-600 text-white' : 
                    'bg-gray-200 border border-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                {index + 1}
              </button>
              <span className="mt-2 text-xs text-gray-500">{step.label}</span>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute">
                  <div className="h-px bg-gray-300 w-14 md:w-20 translate-x-12 -translate-y-5"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
