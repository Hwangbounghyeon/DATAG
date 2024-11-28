import { Select, SelectItem } from "@nextui-org/react";
import { DEPARTMENTS } from "@/lib/constants/mockData";

interface DepartmentSelectProps {
    selectedDepartment: string | null;
    onSelect: (dept: string) => void;
}

export function DepartmentSelect({
    selectedDepartment,
    onSelect,
}: DepartmentSelectProps) {
    return (
        <Select
            label="Department"
            placeholder="Select a department"
            selectedKeys={
                selectedDepartment ? [selectedDepartment.toString()] : []
            }
            onChange={(e) => {
                const dept = DEPARTMENTS.find(
                    (d) => d.department_name.toString() === e.target.value
                );
                if (dept) onSelect(dept.department_name);
            }}
        >
            {DEPARTMENTS.map((dept) => (
                <SelectItem
                    key={dept.department_name}
                    value={dept.department_name}
                >
                    {dept.department_name}
                </SelectItem>
            ))}
        </Select>
    );
}
