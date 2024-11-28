import Link from "next/link";
import React from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

interface HeaderProps {
    fileName: string;
    currentNumber: number;
    totalCount: number;
    prevLink: string | null;
    nextLink: string | null;
    project_id: string;
}

function Header({
    fileName,
    currentNumber,
    totalCount,
    prevLink,
    nextLink,
    project_id,
}: HeaderProps) {
    const isFirstPage = currentNumber === 1;
    const isLastPage = currentNumber === totalCount;

    return (
        <div className="w-full flex items-center relative pt-1 pb-2 bg-white dark:bg-gray-900">
            <div className="flex flex-col px-2">
                <p className="pb-1">
                    <Link
                        href={`/project/${project_id}`}
                        className="cursor-pointer"
                    >
                        <FaArrowLeftLong />
                    </Link>
                </p>
                <span>{fileName}</span>
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2 flex justify-center items-center">
                <div className="flex items-center justify-center w-40">
                    {isFirstPage || !prevLink ? (
                        <div className="w-8" />
                    ) : (
                        <Link
                            href={prevLink}
                            className="w-8 p-1 hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <IoIosArrowBack size={24} />
                        </Link>
                    )}
                    <span className="mx-2 w-16 text-center">{`${currentNumber} / ${totalCount}`}</span>
                    {isLastPage || !nextLink ? (
                        <div className="w-8" />
                    ) : (
                        <Link
                            href={nextLink}
                            className="w-8 p-1 hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <IoIosArrowForward size={24} />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Header;
