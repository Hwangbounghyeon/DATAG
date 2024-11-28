const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, title: "주제 선택" },
    { id: 2, title: "모델 선택" },
    { id: 3, title: "프로젝트 정보 입력" },
    { id: 4, title: "권한 설정" },
  ];

  return (
    <div className="flex justify-between w-full max-w-3xl mx-auto mb-8">
      {steps.map((step) => (
        <div key={step.id} className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center
              ${
                currentStep === step.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
          >
            {step.id}
          </div>
          <span className="mt-2 text-sm">{step.title}</span>
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
