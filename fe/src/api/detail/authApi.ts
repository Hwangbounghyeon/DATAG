import apiClient from "../client";
import { AuthDepartmentResponse, AuthResponse, AuthUser } from "@/types/auth";

export interface AddUserAuthorityRequest {
    image_id: string;
    user_id_list: number[];
}

export interface AddDepartmentAuthorityRequest {
    image_id: string;
    department_name_list: string[];
}

export interface DeleteUserAuthorityRequest {
    image_id: string;
    user_id_list: number[];
}

export interface DeleteDepartmentAuthorityRequest {
    image_id: string;
    department_name_list: string[];
}

export const authorityApi = {
    addUsers: async (request: AddUserAuthorityRequest): Promise<AuthUser[]> => {
        const response = await apiClient<AuthResponse>(
            "/image/permission/addUser",
            {
                method: "POST",
                body: JSON.stringify(request),
                cache: "no-store",
            }
        );

        if (!response.data) {
            throw new Error("No data received");
        }

        return response.data.auth_list;
    },

    addDepartments: async (
        request: AddDepartmentAuthorityRequest
    ): Promise<string[]> => {
        const response = await apiClient<AuthDepartmentResponse>(
            "/image/permission/addDepartment",
            {
                method: "POST",
                body: JSON.stringify(request),
                cache: "no-store",
            }
        );

        if (!response.data) {
            throw new Error("No data received");
        }

        return response.data.department_list;
    },

    removeUser: async (
        request: DeleteUserAuthorityRequest
    ): Promise<AuthUser[]> => {
        const response = await apiClient<AuthResponse>(
            "/image/permission/removeUser",
            {
                method: "POST",
                body: JSON.stringify(request),
                cache: "no-store",
            }
        );

        if (!response.data) {
            throw new Error("No data received");
        }

        return response.data.auth_list;
    },

    removeDepartment: async (
        request: DeleteDepartmentAuthorityRequest
    ): Promise<string[]> => {
        const response = await apiClient<AuthDepartmentResponse>(
            "/image/permission/removeDepartment",
            {
                method: "POST",
                body: JSON.stringify(request),
                cache: "no-store",
            }
        );

        if (!response.data) {
            throw new Error("No data received");
        }

        return response.data.department_list;
    },
};
