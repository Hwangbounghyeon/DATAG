import { DefaultResponseType } from "@/types/default";
import { HistoryData } from "@/types/historyType";
import { AnalysisRequestType, AutoAnalysisRequestType } from "@/types/analysisType";
import apiClient from "../client";

export const postAnalysis = async (
  bodyData: AnalysisRequestType
) => {
  
  const response = await apiClient<DefaultResponseType<HistoryData>>(
    `/project/analysis/manual`,
    {
      method: "POST",
      body: JSON.stringify(bodyData),
      cache: "no-store",
    }
  );

  if (response.data) {
    console.log(response)
  } else {
    console.log(response)
  };
};

export const postAutoAnalysis = async (
  bodyData: AutoAnalysisRequestType
) => {
  
  const response = await apiClient<DefaultResponseType<HistoryData>>(
    `/project/analysis/auto`,
    {
      method: "POST",
      body: JSON.stringify(bodyData),
      cache: "no-store",
    }
  );

  if (response.data) {
    console.log(response)
  } else {
    console.log(response)
  };
};