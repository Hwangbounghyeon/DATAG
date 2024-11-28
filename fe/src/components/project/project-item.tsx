"use client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { PiNotebookFill } from "react-icons/pi"; // description logo
import { BsPersonLinesFill } from "react-icons/bs"; //department logo
import { IoIosCube } from "react-icons/io"; // model logo
import ProjectItemInfoCard from "./project-item-infocard";
import { ProjectType } from "@/types/projectType";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/react";
import { customFetch } from "@/app/actions/customFetch";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

dayjs.extend(relativeTime);

interface ProjectCardProps {
  project: ProjectType;
}

export function ProjectItem({ project }: ProjectCardProps) {
  const router = useRouter();
  const timeAgo = dayjs(project.updated_at).fromNow();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  return (
    <div
      onClick={() => router.push(`/project/${project.project_id}`)}
      className="
      hover:shadow-md cursor-pointer hover:scale-[101%] transition-all active:scale-[99%] duration-100
      rounded-lg w-[95%] bg-gray-200 dark:bg-gray-900 my-3 p-6 shadow-sm "
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">{project.project_name}</h2>
          <span
            className={`rounded-full px-3 py-1 text-sm ${
              project.is_private
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            } font-bold`}
          >
            {project.is_private ? "Private" : "Public"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Edit on {timeAgo}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <ProjectItemInfoCard
          title={"Description"}
          description={project.description}
          Icon={PiNotebookFill}
        />

        <ProjectItemInfoCard
          title={"Department"}
          description={`${project.department}`}
          Icon={BsPersonLinesFill}
        />

        <ProjectItemInfoCard
          title={"Model"}
          description={project.model_name}
          Icon={IoIosCube}
        />
      </div>
      {project.is_editor && (
        <Button
          disabled={isDeleting}
          isLoading={isDeleting}
          color="danger"
          onClick={() => {
            if (
              window.confirm("Are you sure you want to delete this project?")
            ) {
              setIsDeleting(true);
              customFetch({
                endpoint: `/project/delete/${project.project_id}`,
                method: "DELETE",
              })
                .then(() => {
                  queryClient.invalidateQueries({
                    queryKey: ["projects"],
                  });
                })
                .catch((err) => {
                  setIsDeleting(false);
                  console.error(err);
                  window.alert("Failed to delete the project.");
                });
            }
          }}
          className="mt-2"
        >
          Delete This Project
        </Button>
      )}
    </div>
  );
}

export default ProjectItem;
