"use server";

import { DepartmentType } from "@/types/departmentType";
import { DefaultResponseType } from "./customFetch";

export const getDepartments = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/department/list`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: {
          tags: ["Department"],
        },
      }
    );

    if (response.ok) {
      const data: DefaultResponseType<DepartmentType[]> = await response.json();
      return data;
    } else {
      return {
        error: "부서를 불러오는 중 오류가 발생했습니다.",
        status: response.status,
      };
    }
  } catch (error) {
    console.error("부서 목록 가져오기", error);
    return {
      error: (error as string) || "부서를 불러오는 중 오류가 발생했습니다.",
      status: 500,
    };
  }
};
