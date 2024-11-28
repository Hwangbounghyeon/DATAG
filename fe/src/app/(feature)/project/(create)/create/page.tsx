"use client";

import React, { useCallback, useState, memo, useEffect } from "react";
import StepIndicator from "@/components/project/create/step-indicator";
import Step1 from "@/components/project/create/step1";
import Step2 from "@/components/project/create/step2";
import Step3 from "@/components/project/create/step3";
import Step4 from "@/components/project/create/step4";
import { useRouter } from "next/navigation";

// Memoize step components
const MemoizedStep1 = memo(Step1);
const MemoizedStep2 = memo(Step2);
const MemoizedStep3 = memo(Step3);
const MemoizedStep4 = memo(Step4);

const Page = () => {
  const router = useRouter();
  useEffect(() => {
    router.prefetch("/project");
  }, [router]);

  const [step, setStep] = useState(1);

  const handleMove = useCallback((stepNumber: number) => {
    setStep(stepNumber);
  }, []);

  // Memoize the step rendering logic
  const renderStep = useCallback(() => {
    // 공통 props

    // Step에 따라 다른 컴포넌트를 렌더링
    switch (step) {
      case 1:
        return <MemoizedStep1 handleMove={handleMove} />;
      case 2:
        return <MemoizedStep2 handleMove={handleMove} />;
      case 3:
        return <MemoizedStep3 handleMove={handleMove} />;
      case 4:
        return <MemoizedStep4 handleMove={handleMove} />;
      default:
        return null;
    }
  }, [step, handleMove]);

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="flex-1 w-full px-3">
        <header className="mt-5 mb-8 font-bold flex flex-col items-center">
          <h1 className="text-[30px]">Create New Project</h1>
          <div>
            <StepIndicator currentStep={step} handleMove={handleMove} />
          </div>
        </header>
        <div className="w-full flex justify-center items-center">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default memo(Page);
