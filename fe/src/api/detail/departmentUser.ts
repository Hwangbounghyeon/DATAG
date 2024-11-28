import { Department, UserListResponse } from "@/types/auth";
import apiClient from "../client";
import { DefaultPaginationType } from "@/types/default";

export const departmentApi = async () => {
    const response = await apiClient<{ status: number; data: Department[] }>(
        "/department/list",
        {
            method: "GET",
            cache: "no-store",
        }
    );

    if (!response.data) {
        throw new Error("No data received");
    }

    return response.data;
};

export const getUserByDepartment = async (
    page: number,
    limit: number
): Promise<UserListResponse> => {
    const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });
    const response = await apiClient<DefaultPaginationType<UserListResponse>>(
        `/user/search?${searchParams.toString()}`,
        {
            method: "GET",
            cache: "no-store",
        }
    );

    if (!response?.data?.data) {
        throw new Error("No data received");
    }

    return response.data.data;
};
