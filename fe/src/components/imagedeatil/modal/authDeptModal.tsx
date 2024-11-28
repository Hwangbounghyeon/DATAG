import { Select, SelectItem, Chip } from "@nextui-org/react";
import { useAuthoritySelect } from "@/hooks/imageDetail/useAuthoritySelect";
import { AuthUser } from "@/types/auth";
import AuthBaseModal from "./authBaseModal";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (departmentName: string[]) => void;
    existingAuthorities: AuthUser[];
}

export default function AuthDeptModal({
    isOpen,
    onClose,
    onAdd,
}: AuthModalProps) {
    const {
        departments,
        selectedDepartments,
        handleDepartmentSelect,
        handleRemoveDepartment,
        reset,
    } = useAuthoritySelect();

    const handleConfirm = () => {
        onAdd(selectedDepartments);
        reset();
        onClose();
    };

    const handleCancel = () => {
        reset();
        onClose();
    };

    return (
        <AuthBaseModal
            isOpen={isOpen}
            onClose={handleCancel}
            title="Add Authority"
            onConfirm={handleConfirm}
            isConfirmDisabled={selectedDepartments.length === 0}
        >
            <>
                {Array.isArray(departments) && departments.length > 0 ? (
                    <Select
                        label="Department"
                        placeholder="Select departments"
                        selectionMode="multiple"
                        selectedKeys={selectedDepartments}
                        onSelectionChange={(keys) => {
                            const selectedValues = Array.from(
                                keys as Set<string>
                            );
                            handleDepartmentSelect(selectedValues);
                        }}
                    >
                        {departments.map((dept) => (
                            <SelectItem
                                key={dept.department_name}
                                value={dept.department_name}
                            >
                                {dept.department_name}
                            </SelectItem>
                        ))}
                    </Select>
                ) : (
                    <div>No departments available</div>
                )}

                {selectedDepartments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selectedDepartments.map((deptName) => (
                            <Chip
                                key={deptName}
                                onClose={() => handleRemoveDepartment(deptName)}
                                variant="flat"
                            >
                                {deptName}
                            </Chip>
                        ))}
                    </div>
                )}
            </>
        </AuthBaseModal>
    );
}
