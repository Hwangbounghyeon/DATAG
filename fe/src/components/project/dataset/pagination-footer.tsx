import React from "react";
import { Button, Pagination } from "@nextui-org/react";

interface PaginationFooterProps {
  currentPage: number;
  totalPage: number;
  setCurrentPage: (targetPage: number) => void;
}

const PaginationFooter = ({ currentPage, totalPage, setCurrentPage }: PaginationFooterProps) => {
  return (
    <div className="flex justify-center mt-8 overflow-x-auto py-4">
      <Pagination
        total={totalPage}
        page={currentPage}
        onChange={setCurrentPage}
        color="primary"
        showControls
        size="lg"
        className="gap-1 sm:gap-2"
        radius="lg"
        classNames={{
          wrapper: "overflow-visible",
          item: "w-8 h-8 sm:w-10 sm:h-10",
        }}
      />
    </div>
  );
};

export default PaginationFooter;
