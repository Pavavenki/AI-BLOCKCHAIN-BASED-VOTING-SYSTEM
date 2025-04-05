interface ProgressBarProps {
  currentStep: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, name: "Login" },
    { number: 2, name: "Verification" },
    { number: 3, name: "Biometric" },
    { number: 4, name: "Voting" },
    { number: 5, name: "Confirmation" }
  ];

  return (
    <div className="container mx-auto py-4 px-4 hidden md:block">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  step.number < currentStep 
                    ? "bg-green-500" // completed step
                    : step.number === currentStep 
                      ? "bg-primary-600" // current step
                      : "bg-gray-300" // upcoming step
                }`}
              >
                {step.number}
              </div>
              <div className="text-xs mt-1">{step.name}</div>
            </div>
            
            {index < steps.length - 1 && (
              <div 
                className={`flex-1 h-1 ${
                  step.number < currentStep 
                    ? "bg-green-500" // completed connector
                    : "bg-gray-300" // upcoming connector
                } mx-2`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
