"use server";

import { ModelListResponseType } from "@/types/modelType";
import { DefaultResponseType, customFetch } from "./customFetch";

export const getModels = async () => {
  try {
    const response = await customFetch<
      DefaultResponseType<ModelListResponseType>
    >({
      endpoint: "/project/model/list",
      method: "GET",
      cache: "no-store",
    });

    if (response.data) {
      return response.data;
    } else {
      console.error(response.error);
      return undefined;
    }
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
