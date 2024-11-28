import React from "react";

interface StepIndicatorProps {
  currentStep: number;
  handleMove: (stepNumber: number) => void;
}

const StepIndicator = ({ currentStep, handleMove }: StepIndicatorProps) => {
  const steps = [
    { id: 1, title: "주제 선택" },
    { id: 2, title: "정보 입력" },
    { id: 3, title: "권한 설정" },
    { id: 4, title: "최종 확인" },
  ];

  return (
    <div className="w-full px-6 py-2 ">
      <div className="grid grid-cols-4 gap-[40px]">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex flex-col w-full justify-center items-center ${
              currentStep < step.id ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            onClick={() => {
              if (currentStep < step.id) return;
              handleMove(step.id);
            }}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center
                ${
                  currentStep === step.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                } mb-2`}
            >
              <span className="text-sm font-medium">STEP</span>
              <span className="ml-1">{step.id}</span>
            </div>
            <div>
              <span
                className={`text-sm ${
                  currentStep === step.id
                    ? "text-blue-600 font-bold"
                    : "text-gray-500 "
                }`}
              >
                {step.title}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(StepIndicator);
