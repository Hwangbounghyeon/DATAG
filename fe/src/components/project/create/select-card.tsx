// components/SelectCard.tsx
import React from "react";
import Image from "next/image";

interface SelectCardProps {
  imgUrl: string;
  imgAlt?: string;
  title: string;
  description: string;
  selected: boolean;
  onClick?: () => void;
}

const SelectCard = ({
  imgUrl,
  imgAlt,
  title,
  description,
  selected = false,
  onClick,
}: SelectCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`
        h-full
        w-full
        max-w-[350px]
        max-h-[370px]
        flex 
        flex-col 
        border-none
        rounded-lg
        shadow-sm
        transition-all
        cursor-pointer
      
        ${selected ? "bg-orange-400" : "bg-gray-100 dark:bg-slate-700"}
        hover:scale-[101%]
        active:scale-[99%]
      `}
    >
      <div className="relative w-full pt-[60%]">
        <Image
          src={imgUrl}
          alt={imgAlt || "img"}
          fill
          className="absolute rounded-md top-0 left-0 w-full h-full object-cover "
        />
      </div>

      <div className="flex flex-col flex-grow p-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-700">{description}</p>
      </div>
    </div>
  );
};

export default SelectCard;
