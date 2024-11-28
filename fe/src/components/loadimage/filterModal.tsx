import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import FilterComponent, { FilterRow } from "./filterBox";
import { TagBySearchRequest } from "@/types/tag";

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDone: (filterData: TagBySearchRequest) => void;
    tags: string[];
    filterRows: FilterRow[];
    setFilterRows: (rows: FilterRow[]) => void;
}

export const FilterModal = ({
    isOpen,
    onClose,
    onDone,
    tags,
    filterRows,
    setFilterRows,
}: FilterModalProps) => {
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
                            <FilterComponent
                                onDone={(filterData) => {
                                    onDone(filterData);
                                    onClose();
                                }}
                                tags={tags}
                                filterRows={filterRows}
                                setFilterRows={setFilterRows}
                            />
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
