import { DefaultResponseType } from "@/types/default";
import { HistoryData } from "@/types/historyType";
import apiClient from "../client";

export const getHistoryDetail = async (
  historyId: string,
): Promise<DefaultResponseType<HistoryData>> => {
  const response = await apiClient<DefaultResponseType<HistoryData>>(
    `/project/history/detail/${historyId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.data) {
    throw new Error("No data received");
  }

  console.log(response)

  return response;
};
