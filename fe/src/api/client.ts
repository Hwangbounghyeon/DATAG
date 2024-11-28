import { customFetch } from "@/app/actions/customFetch";

interface ApiOptions {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    headers?: HeadersInit;
    body?: BodyInit;
    cache?: "no-store" | null;
    ContentType?: "application/json" | "multipart/form-data";
    searchParams?: URLSearchParams | null;
}

async function apiClient<T>(endpoint: string, options: ApiOptions): Promise<T> {
    try {
        const response = await customFetch<T>({
            endpoint,
            method: options.method,
            cache: options.cache,
            body: options.body,
            ContentType:
                options.body instanceof FormData
                    ? undefined
                    : options.ContentType || "application/json",
            searchParams: options.searchParams,
        });

        if (response.error || !response.data) {
            throw new Error(response.error);
        }

        return response.data;
    } catch (error) {
        console.error("API client error:", {
            endpoint,
            error: error instanceof Error ? error.message : error,
        });
        throw error;
    }
}

export default apiClient;