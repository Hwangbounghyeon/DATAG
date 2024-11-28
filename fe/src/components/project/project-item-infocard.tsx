import React from "react";
import { IconType } from "react-icons";

interface ProjectItemInfoCardProps {
  title: string;
  description: string;
  Icon: IconType;
}

const ProjectItemInfoCard = ({
  title,
  description,
  Icon,
}: ProjectItemInfoCardProps) => {
  return (
    <div className="rounded-lg bg-gray-50 dark:bg-zinc-700 p-4">
      <h3 className="mb-2 flex items-center gap-2 font-medium">
        <Icon />
        {title}
      </h3>
      <p className="text-gray-700 dark:text-gray-200">{description}</p>
    </div>
  );
};

export default ProjectItemInfoCard;
