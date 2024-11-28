import { Select, SelectItem, Chip } from "@nextui-org/react";
import { useAuthoritySelect } from "@/hooks/imageDetail/useAuthoritySelect";
import { AuthUser } from "@/types/auth";
import AuthBaseModal from "./authBaseModal";

interface UserAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (userIds: number[]) => void;
    existingAuthorities: AuthUser[];
}

export default function AuthUserModal({
    isOpen,
    onClose,
    onAdd,
}: UserAuthModalProps) {
    const {
        departments,
        selectedDepartment,
        users,
        allUsers,
        selectedUsers,
        handleSingleDepartmentSelect,
        handleUserSelect,
        handleRemoveUser,
        reset,
    } = useAuthoritySelect();

    const handleConfirm = () => {
        onAdd(selectedUsers);
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
            title="Add User Authority"
            onConfirm={handleConfirm}
            isConfirmDisabled={selectedUsers.length === 0}
        >
            <>
                {Array.isArray(departments) && departments.length > 0 ? (
                    <Select
                        label="Department"
                        placeholder="Select department"
                        selectedKeys={
                            selectedDepartment ? [selectedDepartment] : []
                        }
                        onSelectionChange={(keys) => {
                            const selectedValue = Array.from(
                                keys as Set<string>
                            )[0];
                            handleSingleDepartmentSelect(selectedValue);
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

                {selectedDepartment && (
                    <Select
                        label="Users"
                        placeholder="Select users"
                        selectionMode="multiple"
                        selectedKeys={selectedUsers.map((id) => id.toString())}
                        onSelectionChange={(keys) => {
                            const selectedValues = Array.from(
                                keys as Set<string>
                            );
                            handleUserSelect(
                                selectedValues.map((id) => parseInt(id))
                            );
                        }}
                    >
                        {users?.map((user) => (
                            <SelectItem
                                key={user.user_id.toString()}
                                value={user.user_id.toString()}
                            >
                                {user.user_name}
                            </SelectItem>
                        ))}
                    </Select>
                )}

                {selectedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selectedUsers.map((userId) => {
                            const user = allUsers?.find(
                                (u) => u.user_id === userId
                            );
                            return (
                                <Chip
                                    key={userId}
                                    onClose={() => handleRemoveUser(userId)}
                                    variant="flat"
                                >
                                    {user?.user_name}
                                </Chip>
                            );
                        })}
                    </div>
                )}
            </>
        </AuthBaseModal>
    );
}
