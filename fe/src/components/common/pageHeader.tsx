import { Button } from "@nextui-org/react";
import React from "react";

interface PageHeaderProps {
    title: string;
    onPrevious: () => void;
    rightButtonText: string;
    onRightButtonClick?: () => void;
    isLoading: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    onPrevious,
    rightButtonText,
    onRightButtonClick,
    isLoading,
}) => (
    <div className="flex justify-between items-center px-6 pb-8 pt-4 relative mx-2">
        <Button
            onClick={onPrevious}
            color="primary"
            className="font-semibold w-full md:w-auto"
            size="lg"
        >
            Previous
        </Button>

        <h1 className="text-4xl absolute left-1/2 -translate-x-1/2 font-bold">
            {title}
        </h1>

        <Button
            color="primary"
            className="font-semibold w-full md:w-auto"
            size="lg"
            onClick={onRightButtonClick}
            isLoading={isLoading}
        >
            {rightButtonText}
        </Button>
    </div>
);
