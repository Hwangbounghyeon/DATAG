"use server";

import { customFetch } from "./customFetch";
import { DefaultPaginationType, DefaultResponseType } from "@/types/default";

export type SearchUserType = {
  user_id: number;
  name: string;
  email: string;
};

export const getUsers = async (pageNumber: number, searchName?: string) => {
  const searchParams = new URLSearchParams();
  searchParams.append("page", pageNumber.toString());
  if (typeof searchName === "string" && searchName.length > 0) {
    searchParams.append("user_name", searchName);
  }
  try {
    const response: DefaultResponseType<
      DefaultPaginationType<SearchUserType[]>
    > = await customFetch({
      method: "GET",
      endpoint: "/user/search",
      searchParams,
    });
    if (response.data) {
      return {
        status: response.status,
        data: response.data,
      };
    } else {
      console.error("response.error", response.error);
      return {
        error: response.error || "사용자를 불러오는 중 오류가 발생했습니다.",
        status: response.status,
      };
    }
  } catch (error) {
    console.error("error 요기", error);
    return {
      error: (error as string) || "사용자를 불러오는 중 오류가 발생했습니다.",
      status: 500,
    };
  }
};
