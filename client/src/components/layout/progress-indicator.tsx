
import { Check } from "lucide-react";

interface Props {
  currentStep: "login" | "personal-details" | "biometric" | "voting" | "thank-you";
}

export default function ProgressIndicator({ currentStep }: Props) {
  const steps = [
    { id: "login", label: "Login" },
    { id: "personal-details", label: "Details" },
    { id: "biometric", label: "Verify" },
    { id: "voting", label: "Vote" },
    { id: "thank-you", label: "Complete" },
  ];

  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = step.id === currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className="relative w-full">
                {index > 0 && (
                  <div
                    className={`absolute h-1 w-full right-1/2 top-4 -translate-y-1/2 ${
                      isCompleted ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    isCompleted
                      ? "bg-blue-600 border-blue-600"
                      : isCurrent
                      ? "bg-white border-blue-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : (
                    <span
                      className={
                        isCurrent ? "text-blue-600" : "text-gray-400"
                      }
                    >
                      {index + 1}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`mt-2 text-sm ${
                  isCurrent ? "text-blue-600 font-medium" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
