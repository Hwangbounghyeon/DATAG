import {
    AddDepartmentAuthorityRequest,
    authorityApi,
    DeleteUserAuthorityRequest,
} from "@/api/detail/authApi";
import { AuthUser } from "@/types/auth";
import { useState } from "react";

export function useAuthorityManager(
    imageId: string,
    initialUserAuthorities: AuthUser[],
    initialDepartmentAuthorities: string[]
) {
    const [userAuthorities, setUserAuthorities] = useState<AuthUser[]>(
        initialUserAuthorities || []
    );
    const [departmentAuthorities, setDepartmentAuthorities] = useState<
        string[]
    >(initialDepartmentAuthorities || []);

    const addUserAuthorities = async (userIds: number[]) => {
        try {
            const request = {
                image_id: imageId,
                user_id_list: userIds,
            };
            const newUserAuthorities = await authorityApi.addUsers(request);
            setUserAuthorities(newUserAuthorities);
        } catch (error) {
            console.error("Failed to add user authorities:", error);
        }
    };

    const addDepartmentAuthorities = async (department_name: string[]) => {
        try {
            const request: AddDepartmentAuthorityRequest = {
                image_id: imageId,
                department_name_list: department_name,
            };
            const newDepartmentAuthorities = await authorityApi.addDepartments(
                request
            );
            setDepartmentAuthorities(newDepartmentAuthorities);
        } catch (error) {
            console.error("Failed to add authorities:", error);
        }
    };

    const removeUserAuthority = async (userId: number) => {
        try {
            const request: DeleteUserAuthorityRequest = {
                image_id: imageId,
                user_id_list: [userId],
            };
            const newUserAuthorities = await authorityApi.removeUser(request);
            setUserAuthorities(newUserAuthorities);
        } catch (error) {
            console.error("Failed to remove authority:", error);
        }
    };

    const removeDepartmentAuthority = async (departmentName: string) => {
        try {
            const request = {
                image_id: imageId,
                department_name_list: [departmentName],
            };
            const newDepartmentAuthorities =
                await authorityApi.removeDepartment(request);
            setDepartmentAuthorities(newDepartmentAuthorities);
        } catch (error) {
            console.error("Failed to remove department authority:", error);
        }
    };

    return {
        userAuthorities,
        departmentAuthorities,
        addUserAuthorities,
        addDepartmentAuthorities,
        removeUserAuthority,
        removeDepartmentAuthority,
    };
}
