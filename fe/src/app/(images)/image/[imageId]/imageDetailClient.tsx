"use client";

import React, { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/image/ImageHeader";
import ClassPanel from "@/components/imagedeatil/classPanel";
import TagPanel from "@/components/imagedeatil/tagPanel";
import ImagePanel from "@/components/imagedeatil/imagePanel";
import { usePanelState } from "@/hooks/imageDetail/usePanelState";
import MetadataPanel from "@/components/imagedeatil/metadataPanel";
import AuthPanel from "@/components/imagedeatil/authPanel";
import { useAuthorityManager } from "@/hooks/imageDetail/useAuthorityManager";
import { useTagManager } from "@/hooks/imageDetail/useTagManager";
import { AuthUser } from "@/types/auth";
import { Detection } from "@/types/metadata";
import { TagBySearchRequest } from "@/types/tag";

interface ImageDetailClientProps {
    imageId: string;
    imageIdx: number;
    initialUserAuthorities: AuthUser[];
    initialDepartmentAuthorities: string[];
    initialTags: string[];
    classes: string[];
    imageSrc: string;
    metadata: {
        branch: string;
        process: string;
        location: string;
        equipmentId: string;
        createdAt: string;
    };
    detections: Detection[];
    totalItem: number;
    nextId: string | null;
    prevId: string | null;
    conditions?: TagBySearchRequest;
}

function ImageDetailClient({
    imageId,
    imageIdx,
    initialUserAuthorities,
    initialDepartmentAuthorities,
    initialTags,
    classes,
    imageSrc,
    metadata,
    detections,
    totalItem,
    nextId,
    prevId,
    conditions,
}: ImageDetailClientProps) {
    const router = useRouter();

    const {
        userAuthorities,
        departmentAuthorities,
        addUserAuthorities,
        addDepartmentAuthorities,
        removeUserAuthority,
        removeDepartmentAuthority,
    } = useAuthorityManager(
        imageId,
        initialUserAuthorities,
        initialDepartmentAuthorities
    );

    const searchParams = conditions
        ? `?conditions=${encodeURIComponent(JSON.stringify(conditions))}`
        : "";

    const { tags, addTag, removeTag } = useTagManager(imageId, initialTags);

    const handleNavigate = useCallback(
        (direction: "prev" | "next") => {
            const searchParams = conditions
                ? `?conditions=${encodeURIComponent(
                      JSON.stringify(conditions)
                  )}`
                : "";

            if (direction === "prev" && prevId) {
                router.push(
                    `/image/${prevId}${searchParams}`
                );
            } else if (direction === "next" && nextId) {
                router.push(
                    `/image/${nextId}${searchParams}`
                );
            }
        },
        [nextId, prevId, router, conditions]
    );

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowLeft") {
                handleNavigate("prev");
            } else if (event.key === "ArrowRight") {
                handleNavigate("next");
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleNavigate]);

    const { activePanel, setActivePanel } = usePanelState();

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-500">
            <Header
                fileName={imageSrc.split("/").pop() || "Unknown"}
                currentNumber={imageIdx}
                totalCount={totalItem}
                prevLink={
                    prevId
                        ? `/image/${prevId}${searchParams}`
                        : null
                }
                nextLink={
                    nextId
                        ? `/image/${nextId}${searchParams}`
                        : null
                }
            />

            <div className="w-full h-[1px] bg-gray-400 " />
            <div className="flex flex-1 overflow-hidden">
                <div className="w-[20%]">
                    <div className="flex flex-col h-full">
                        <div className="h-1/3 border-b border-gray-700 dark:border-gray-50">
                            <div className="flex px-2 py-2 pb-2 bg-gray-50 dark:bg-gray-500">
                                <div className="flex px-2 py-2 pb-2 bg-gray-50 dark:bg-gray-500">
                                    <div
                                        className={`cursor-pointer px-4 py-1 ${
                                            activePanel === "class"
                                                ? "text-blue-400 border-b-2 border-blue-400"
                                                : "text-gray-400"
                                        }`}
                                        onClick={() => setActivePanel("class")}
                                    >
                                        ClassName
                                    </div>
                                    <div
                                        className={`cursor-pointer px-4 py-1 ${
                                            activePanel === "metadata"
                                                ? "text-blue-400 border-b-2 border-blue-400"
                                                : "text-gray-400"
                                        }`}
                                        onClick={() =>
                                            setActivePanel("metadata")
                                        }
                                    >
                                        MetaData
                                    </div>
                                </div>
                            </div>
                            {activePanel === "class" ? (
                                <ClassPanel classes={classes} />
                            ) : (
                                <MetadataPanel metadata={metadata} />
                            )}
                        </div>
                        <div className="h-1/3 border-b border-gray-700 dark:border-gray-50">
                            <AuthPanel
                                userAuthorities={userAuthorities}
                                departmentAuthorities={departmentAuthorities}
                                onUserAuthorityAdd={addUserAuthorities}
                                onUserAuthorityRemove={removeUserAuthority}
                                onDepartmentAuthorityAdd={
                                    addDepartmentAuthorities
                                }
                                onDepartmentAuthorityRemove={
                                    removeDepartmentAuthority
                                }
                            />
                        </div>
                        <div className="h-1/3">
                            <TagPanel
                                tags={tags}
                                onRemoveTag={removeTag}
                                onAddTag={addTag}
                            />
                        </div>
                    </div>
                </div>

                <div className="w-[80%]">
                    <ImagePanel imageSrc={imageSrc} detections={detections} />
                </div>
            </div>
        </div>
    );
}

export default ImageDetailClient;
