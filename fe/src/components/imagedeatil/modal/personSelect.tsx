import { Select, SelectItem } from "@nextui-org/react";
import { AuthUser, User } from "@/types/auth";
import { USERS } from "@/lib/constants/mockData";

interface PersonSelectProps {
    selectedDepartment: string;
    onSelect: (users: User[]) => void;
    selectedPeople: AuthUser[];
    existingAuthorities: AuthUser[];
}

export function PersonSelect({
    selectedDepartment,
    onSelect,
    selectedPeople,
    existingAuthorities,
}: PersonSelectProps) {
    const availableUsers = USERS.filter(
        (user) =>
            user.department_name === selectedDepartment &&
            !existingAuthorities.some(
                (existing) => existing.user_id === user.uid
            )
    );

    return (
        <Select
            label="People"
            placeholder="Select people"
            selectionMode="multiple"
            selectedKeys={selectedPeople.map((p) => p.user_id.toString())}
            onChange={(e) => {
                const selectedIds = Array.from(e.target.value);
                const users = availableUsers.filter((user) =>
                    selectedIds.includes(user.uid.toString())
                );
                onSelect(users);
            }}
        >
            {availableUsers.map((user) => (
                <SelectItem key={user.uid} value={user.uid}>
                    {user.name}
                </SelectItem>
            ))}
        </Select>
    );
}
