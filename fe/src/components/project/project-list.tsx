"use client";

import { customFetch } from "@/app/actions/customFetch";
import { DefaultPaginationType, PaginationType } from "@/types/default";
import { ProjectType } from "@/types/projectType";
import { Pagination, Spinner } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProjectItem from "./project-item";

const ProjectList = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentModelName = searchParams.get("model_name");

  const { data, isPending, isLoading, isError } = useQuery<
    PaginationType<ProjectType[]>,
    string,
    PaginationType<ProjectType[]>,
    [string, number, string | null]
  >({
    queryKey: ["projects", currentPage, currentModelName],
    queryFn: async () => {
      const response = await customFetch<DefaultPaginationType<ProjectType[]>>({
        endpoint: `/project/list?page=${currentPage}${
          currentModelName ? `&model_name=${currentModelName}` : ""
        }`,
        method: "GET",
      });

      if (!response.data) {
        throw new Error("No data received from server");
      }
      if (response.error) {
        throw new Error(`Server error: ${response.error}`);
      }
      if (!response.data.data) {
        throw new Error("Invalid data structure received");
      }

      return response.data.data;
    },
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    if (currentModelName) params.set("model_name", currentModelName);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (isPending || isLoading)
    return (
      <div>
        <Spinner size="lg" />
      </div>
    );
  if (isError) return <div>Error loading projects</div>;
  if (!data || !data.data) return <div>No projects found</div>;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between pb-2 overflow-y-auto">
      <div className="w-full flex flex-col items-center justify-center">
        {data.data.map((project) => (
          <ProjectItem key={project.project_id} project={project} />
        ))}
      </div>
      <div className="flex flex-col mt-2">
        <Pagination
          showControls
          size="lg"
          onChange={handlePageChange}
          total={data.total_pages}
          initialPage={currentPage}
        />
      </div>
    </div>
  );
};

export default ProjectList;
