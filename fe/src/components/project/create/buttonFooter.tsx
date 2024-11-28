import { Button } from "@nextui-org/react";
import React from "react";

interface ButtonFooterProps {
  beforeButtonFunction?: () => void;
  nextButtonFunction?: () => void;
  beforeButtonDisabled?: boolean;
  nextButtonDisabled?: boolean;
  beforeButtonText: string;
  nextButtonText: string;
}

// ButtonFooter 컴포넌트 수정
const ButtonFooter = ({
  beforeButtonFunction,
  nextButtonFunction,
  beforeButtonDisabled = false,
  nextButtonDisabled = false,
  beforeButtonText,
  nextButtonText,
}: ButtonFooterProps) => {
  return (
    <footer className="w-full mt-5 flex flex-row justify-between">
      <Button
        onClick={beforeButtonFunction}
        color="primary"
        variant="ghost"
        disabled={beforeButtonDisabled}
      >
        {beforeButtonText}
      </Button>
      <Button
        onClick={() => {
          if (nextButtonFunction) {
            nextButtonFunction();
          }
        }}
        color="primary"
        variant="ghost"
        disabled={nextButtonDisabled}
      >
        {nextButtonText}
      </Button>
    </footer>
  );
};

export default ButtonFooter;
