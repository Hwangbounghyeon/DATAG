import { ProjectType, ProjectRequest } from "@/types/projectType";
import { DefaultPaginationType } from "@/types/default";
import { customFetch } from "@/app/actions/customFetch";

export const getProjects = async (
  searchParams?: ProjectRequest
): Promise<DefaultPaginationType<ProjectType[] | null>> => {
  // Remove the unused variable declaration and assignment
  const queryStrings = new URLSearchParams();
  if (searchParams?.model_name) {
    queryStrings.set("model_name", searchParams.model_name);
  }
  if (searchParams?.page) {
    queryStrings.set("page", searchParams.page);
  }
  try {
    const response = await customFetch<DefaultPaginationType<ProjectType[]>>({
      endpoint: "/project/list",
      method: "GET",
      searchParams: queryStrings,
    });

    if (!response.data || !response.data.data) {
      console.error(response.error);
      return {
        status: response.status,
        error: response.error || "Bad Request",
      };
    } else {
      return {
        status: response.status,
        data: response.data.data,
      };
    }
  } catch (error) {
    console.error(error);
    return { status: 500, error: "Internal Server Error" };
  }
};
