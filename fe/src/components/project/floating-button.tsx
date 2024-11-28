"use client";
import React, { useState } from "react";
import { Button } from "@nextui-org/react";
import { useRouter, usePathname } from "next/navigation";
import { IoMdMove } from "react-icons/io";
import { FaCloudUploadAlt, FaHistory } from "react-icons/fa";
import { BiSolidData } from "react-icons/bi";

export function FloatingButton() {
    const router = useRouter();
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);

    const projectId = pathname.split("/")[2];

    const toggleVisibility = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsVisible(!isVisible);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <div className="relative">
                {/* Main Button */}
                <Button
                    className="w-14 h-14 rounded-full p-0 min-w-0 shadow-lg hover:scale-110 transition-transform duration-200"
                    color="primary"
                    size="lg"
                    onClick={toggleVisibility}
                >
                    <IoMdMove className="w-6 h-6 text-white" />
                </Button>

                {/* Sub Buttons */}
                <div
                    className={`absolute right-0 flex flex-col gap-4 transition-all duration-300 ease-in-out ${
                        isVisible
                            ? "-top-[13.5rem] opacity-100"
                            : "top-0 opacity-0 pointer-events-none"
                    }`}
                >
                    <Button
                        className="w-14 h-14 rounded-full p-0 min-w-0 shadow-lg hover:scale-110 transition-transform duration-200"
                        color="primary"
                        variant="shadow"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/project/${projectId}/analysis`);
                        }}
                    >
                        <FaHistory className="w-5 h-5 text-white" />
                    </Button>
                    <Button
                        className="w-14 h-14 rounded-full p-0 min-w-0 shadow-lg hover:scale-110 transition-transform duration-200"
                        color="primary"
                        variant="shadow"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/project/${projectId}`);
                        }}
                    >
                        <BiSolidData className="w-6 h-6 text-white" />
                    </Button>
                    <Button
                        className="w-14 h-14 rounded-full p-0 min-w-0 shadow-lg hover:scale-110 transition-transform duration-200"
                        color="primary"
                        variant="shadow"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/project/${projectId}/image_manage`);
                        }}
                    >
                        <FaCloudUploadAlt className="w-6 h-6 text-white" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default FloatingButton;
