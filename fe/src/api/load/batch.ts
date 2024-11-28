// import apiClient from "../client";

// export enum UploadState {
//     UPLOADING = "UPLOADING",
//     LOADED = "LOADED",
//     FAIL = "FAILED",
// }

// interface BatchesResponse {
//     batch_id: number;
//     date: Date;
//     image_count: number;
//     state: UploadState;
// }

// interface BatchDetailResponse {
//     status: UploadState;
//     imagesUrl: string[];
// }

// export const batchApi = {
//     getBatches: async (project_id: number): Promise<BatchesResponse[]> => {
//         return apiClient<BatchesResponse[]>(`/getBatches/${project_id}`, {
//             method: "GET",
//             headers: {},
//             cache: "no-store",
//         });
//     },

//     getBatchDetail: async (
//         batch_id: number,
//         project_id: number
//     ): Promise<BatchDetailResponse> => {
//         return apiClient<BatchDetailResponse>(
//             `/getBatch/${project_id}/${batch_id}`,
//             {
//                 method: "GET",
//                 headers: {},
//                 cache: "no-store",
//             }
//         );
//     },
// };
