"use client";

import { Tabs, Tab } from "@nextui-org/react";
import { PageContainer } from "@/components/common/pageContainer";
import { UploadContent } from "@/components/upload/uploadContent";
import { useImageState } from "@/hooks/useImageState";
import { useNavigation } from "@/hooks/useNavigation";
import { useFileValidation } from "@/hooks/filecheck/useFileValidation";
import { PageHeader } from "@/components/common/pageHeader";
import { useLoadContentState } from "@/hooks/useLoadContentState";
import { LoadContent } from "@/components/loadimage/LoadContent";
import { TagBySearchRequest } from "@/types/tag";
import { useState } from "react";
import { FilterSection } from "@/components/loadimage/FilterSection";
import { useParams } from "next/navigation";

export default function ImageManage() {
    const params = useParams();
    const ProjectId = params.project_id as string;
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState("upload");
    const { images, addImages, deleteImage, deleteAllImages } = useImageState();
    const { goBack, goToLoadImages } = useNavigation(ProjectId);
    const { handleFileValidation } = useFileValidation({
        images,
        onValidFiles: addImages,
    });

    const loadContentState = useLoadContentState(ProjectId);
    const { tags, currentFilter, searchByFilter, setPage } = loadContentState;

    const handleMoveToDataset = async () => {
        setIsLoading(true);
        try {
            await goToLoadImages(images, currentFilter);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterApply = (filterData: TagBySearchRequest) => {
        setPage(1);
        searchByFilter(filterData, 1);
    };

    return (
        <PageContainer>
            <PageHeader
                title="Image Management"
                rightButtonText="Upload&Load"
                onRightButtonClick={handleMoveToDataset}
                onPrevious={goBack}
                isLoading={isLoading}
            />

            <div className="w-full">
                <div className="mx-8 flex justify-between items-center">
                    <Tabs
                        aria-label="For Image Management"
                        variant="bordered"
                        size="lg"
                        radius="sm"
                        selectedKey={selectedTab}
                        color="primary"
                        onSelectionChange={(key) =>
                            setSelectedTab(key.toString())
                        }
                        classNames={{
                            tabList: "border-primary",
                            cursor: "bg-primary",
                            tab: "border-primary data-[hover=true]:border-primary",
                            tabContent: "group-data-[selected=true]:text-white",
                        }}
                    >
                        <Tab key="upload" title="Upload" />
                        <Tab key="load" title="Load" />
                    </Tabs>
                    {selectedTab === "load" && (
                        <FilterSection
                            tags={tags}
                            currentFilter={currentFilter}
                            onFilterApply={handleFilterApply}
                        />
                    )}
                </div>

                <div className="mt-4">
                    {selectedTab === "upload" ? (
                        <UploadContent
                            images={images}
                            onFileUpload={handleFileValidation}
                            onDeleteImage={deleteImage}
                            onDeleteAllImages={deleteAllImages}
                        />
                    ) : (
                        <LoadContent {...loadContentState} />
                    )}
                </div>
            </div>
        </PageContainer>
    );
}
