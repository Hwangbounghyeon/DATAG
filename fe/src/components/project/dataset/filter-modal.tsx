import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import FilterContainer, { FilterRow, createInitialRow } from "./filter-container";
import { TagBySearchRequest } from "@/types/tag";
import { useState, useEffect, useCallback } from "react";

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    tags: string[];
    filterRows: FilterRow[];
    setFilterRows: (rows: FilterRow[]) => void;
}

export const FilterModal = ({
  isOpen,
  onClose,
  tags,
  filterRows,
  setFilterRows,
}: FilterModalProps) => {
  const [tempFilterRows, setTempFilterRows] = useState<FilterRow[]>([]);

  useEffect(() => {
      if (isOpen) {
          setTempFilterRows([...filterRows]);
      }
  }, [isOpen, filterRows]);

  const handleDone = (filterData: TagBySearchRequest) => {
      setFilterRows(tempFilterRows);
      onClose();
  };

  const handleReset = useCallback(() => {
      const initialRow = createInitialRow();
      setTempFilterRows([initialRow]);
      setFilterRows([initialRow]);
      onClose();
  }, [setFilterRows]);

  return (
      <Modal
          size="3xl"
          isOpen={isOpen}
          onClose={onClose}
          classNames={{
              base: "bg-content1",
              body: "py-6",
              wrapper: "z-[100]",
          }}
      >
          <ModalContent>
              {() => (
                  <>
                      <ModalHeader className="flex justify-between items-center">
                          <span className="text-lg font-semibold">
                              필터 설정
                          </span>
                      </ModalHeader>

                      <ModalBody>
                          <FilterContainer
                              onDone={handleDone}
                              onReset={handleReset}
                              tags={tags}
                              filterRows={tempFilterRows}
                              setFilterRows={setTempFilterRows}
                          />
                      </ModalBody>
                  </>
              )}
          </ModalContent>
      </Modal>
  );
};