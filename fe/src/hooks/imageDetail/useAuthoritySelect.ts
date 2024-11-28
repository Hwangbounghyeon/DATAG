import { useEffect, useState } from "react";
import {
    departmentApi,
    getUserByDepartment,
} from "@/api/detail/departmentUser";
import { DepartmentType } from "@/types/departmentType";
import { AuthUser } from "@/types/auth";

export function useAuthoritySelect() {
    const [departments, setDepartments] = useState<DepartmentType[]>([]);
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>(
        []
    );
    const [selectedDepartment, setSelectedDepartment] = useState<string>("");
    const [allUsers, setAllUsers] = useState<AuthUser[]>([]);
    const [users, setUsers] = useState<AuthUser[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const departmentList = await departmentApi();
                setDepartments(departmentList);

                const response = await getUserByDepartment(1, 100);
                if (response) {
                    const userList = response.map((user) => ({
                        user_id: user.user_id,
                        user_name: user.name,
                        department_name: user.department_name,
                    }));
                    setAllUsers(userList);
                }
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
                setDepartments([]);
                setAllUsers([]);
            }
        };
        fetchInitialData();
    }, []);

    const handleDepartmentSelect = (deptNames: string[]) => {
        setSelectedDepartments(deptNames);
    };

    const handleRemoveDepartment = (deptName: string) => {
        setSelectedDepartments(
            selectedDepartments.filter((name) => name !== deptName)
        );
    };

    const handleSingleDepartmentSelect = (deptName: string) => {
        setSelectedDepartment(deptName);
        const filteredUsers = allUsers.filter(
            (user) => user.department_name === deptName
        );
        setUsers(filteredUsers);
    };

    const handleUserSelect = (userIds: number[]) => {
        setSelectedUsers(userIds);
    };

    const handleRemoveUser = (userId: number) => {
        setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    };

    const reset = () => {
        setSelectedDepartments([]);
        setSelectedDepartment("");
        setSelectedUsers([]);
    };

    return {
        departments,
        selectedDepartments,
        handleDepartmentSelect,
        handleRemoveDepartment,
        reset,
        selectedDepartment,
        users,
        allUsers,
        selectedUsers,
        handleSingleDepartmentSelect,
        handleUserSelect,
        handleRemoveUser,
    };
}
