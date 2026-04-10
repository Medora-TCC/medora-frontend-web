
interface FormStepperProps {
    currentStep: number;
    totalSteps?: number;
}

export function FormStepper({ currentStep, totalSteps = 2 }: FormStepperProps) {
    return (
        <div className="flex items-center justify-center gap-2 mb-8 w-full max-w-xs mx-auto">
            {Array.from({ length: totalSteps }).map((_, index) => {
                const stepNumber = index + 1;
                const isActive = currentStep >= stepNumber;
                return (
                    <div 
                        key={stepNumber}
                        className={`h-2 rounded-full transition-all duration-500 ease-in-out ${
                            isActive ? 'bg-primary-color w-full' : 'bg-surface-overlay w-1/3'
                        }`}
                    />
                );
            })}
        </div>
    );
};