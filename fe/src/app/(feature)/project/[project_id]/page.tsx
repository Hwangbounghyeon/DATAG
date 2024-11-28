"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalContent,
  useDisclosure,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
} from "@nextui-org/react";
import Image from "next/image";

import { TagBySearchRequest } from "@/types/tag";
import { createInitialRow, FilterRow } from "@/components/loadimage/filterBox";
import { ImagesType, ProjectImageListResponse } from "@/types/ImagesType";
import ImageList from "@/components/project/dataset/image-list";
import PaginationFooter from "@/components/project/dataset/pagination-footer";
import { FilterModal } from "@/components/project/dataset/filter-modal";
import AnalysisModal from "@/components/project/dataset/analysis-modal";
import AutoAnalysisModal from "@/components/project/dataset/auto-analysis-modal";
import Filter from "@/public/filter.svg";
import { tagApi } from "@/api/detail/tagApi";

import { getProjectImages } from "@/api/project/getProjectImages";
import { DefaultPaginationType } from "@/types/default";

type SizeType =
  | "md"
  | "xs"
  | "sm"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "full";

const Page = ({ params }: { params: { project_id: string } }) => {
  const [images, setImages] = useState<ImagesType[]>([]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [size, setSize] = useState<SizeType>("3xl");
  const [selectedModal, setSelectedModal] = useState<string | null>(null);

  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);

  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [limit, setLimit] = useState(30);

  const [tags, setTags] = useState<string[]>([]);
  const [filterRows, setFilterRows] = useState<FilterRow[]>([
    createInitialRow(),
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const selectImage = (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    const currentImage = images.find((image) => image.id === targetId);
    if (currentImage?.checked) {
      setSelectedCount((prev) => prev - 1);
      setSelectedImageIds((prev) => prev.filter((id) => id !== targetId));
    } else {
      setSelectedCount((prev) => prev + 1);
      setSelectedImageIds((prev) => [...prev, targetId]);
    }
    setImages((prevImages) =>
      prevImages.map((image) =>
        image.id === targetId ? { ...image, checked: !image.checked } : image
      )
    );
  };

  const selectImageAll = () => {
    const uncheckedImages = images.filter((image) => !image.checked);

    setImages((prevImages) =>
      prevImages.map((image) => ({ ...image, checked: true }))
    );

    setSelectedImageIds((prev) => [
      ...prev,
      ...uncheckedImages.map((image) => image.id),
    ]);
    setSelectedCount((prev) => prev + uncheckedImages.length);
  };

  const unSelectImageAll = () => {
    const checkedImages = images.filter((image) => image.checked);

    setImages((prevImages) =>
      prevImages.map((image) => ({ ...image, checked: false }))
    );

    setSelectedImageIds((prev) =>
      prev.filter((id) => !checkedImages.find((image) => image.id === id))
    );
    setSelectedCount((prev) => prev - checkedImages.length);
  };

  const clearAllSelection = () => {
    setImages((prevImages) =>
      prevImages.map((image) => ({ ...image, checked: false }))
    );
    setSelectedImageIds([]);
    setSelectedCount(0);
  };

  const getImages = async () => {
    setIsLoading(true);

    const conditions = filterRows
      .filter(
        (row) => row.AND.length > 0 || row.OR.length > 0 || row.NOT.length > 0
      )
      .map((row) => ({
        and_condition: row.AND,
        or_condition: row.OR,
        not_condition: row.NOT,
      }));

    const searchParams = {
      page: page,
      limit: limit,
      ...(conditions.length > 0 && { conditions }),
    };

    const response: DefaultPaginationType<ProjectImageListResponse> =
      await getProjectImages(params.project_id, searchParams);

    if (response.data) {
      const transformedImages: ImagesType[] = Object.entries(
        response.data.data.images
      ).map(([id, imageUrl]) => ({
        id: id,
        imageUrl: imageUrl,
        checked: selectedImageIds.includes(id),
      }));

      setTotalPage(response.data.total_pages);
      setImages(transformedImages);
    } else {
      setPage(1);
      setTotalPage(1);
      setImages([]);
    }

    setIsLoading(false);
  };

  const getTags = async () => {
    try {
      setIsLoading(true);
      const response = await tagApi.getTag();
      if (response.data) {
        setTags(response.data.tags);
      }
    } catch (error) {
      console.error("Failed to fetch images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getTags();
  }, []);

  useEffect(() => {
    setImages([]);
    getImages();
  }, [page, filterRows]);

  const handleModalOpen = (componentName: string) => {
    setSelectedModal(componentName);
    onOpen();
  };

  const handleAnalysisSelect = (key: string) => {
    switch (key) {
      case "manual":
        handleModalOpen("analysis");
        break;
      case "auto":
        handleModalOpen("autoAnalysis");
        break;
    }
  };

  const getModalBody = () => {
    switch (selectedModal) {
      case "analysis":
        return (
          <AnalysisModal
            onClose={onClose}
            selectedImageIds={selectedImageIds}
            projectId={params.project_id}
            conditions={filterRows}
          />
        );
      case "autoAnalysis":
        return (
          <AutoAnalysisModal onClose={onClose} projectId={params.project_id} />
        );
      case "filter":
        return (
          <FilterModal
            isOpen={selectedModal === "filter"}
            onClose={onClose}
            tags={tags}
            filterRows={filterRows}
            setFilterRows={setFilterRows}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
          Dataset
        </h1>
        <Dropdown>
          <DropdownTrigger>
            <Button
              color="primary"
              className="font-semibold w-full md:w-auto"
              size="lg"
            >
              Analysis
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Analysis options"
            onAction={(key) => handleAnalysisSelect(key as string)}
          >
            <DropdownItem key="manual">Manual Analysis</DropdownItem>
            <DropdownItem key="auto">Auto Analysis</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="flex items-center mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
        <Button
          isIconOnly
          className="m-2 shrink-0"
          variant="light"
          onPress={() => handleModalOpen("filter")}
        >
          <Image src={Filter} alt="filter" className="w-5 h-5" />
        </Button>
        <div className="flex gap-2 items-center flex-wrap p-3">
          {filterRows
            .filter(
              (row) =>
                row.AND.length > 0 || row.OR.length > 0 || row.NOT.length > 0
            )
            .map((row, index) => (
              <div key={row.id} className="flex gap-2 items-center">
                {row.AND.length > 0 && (
                  <Chip variant="flat" color="primary" className="text-xs">
                    AND: {row.AND.join(", ")}
                  </Chip>
                )}
                {row.OR.length > 0 && (
                  <Chip variant="flat" color="success" className="text-xs">
                    OR: {row.OR.join(", ")}
                  </Chip>
                )}
                {row.NOT.length > 0 && (
                  <Chip variant="flat" color="danger" className="text-xs">
                    NOT: {row.NOT.join(", ")}
                  </Chip>
                )}
                {index < filterRows.length - 1 && (
                  <span className="text-gray-400 dark:text-gray-500">|</span>
                )}
              </div>
            ))}
          {!filterRows.some(
            (row) =>
              row.AND.length > 0 || row.OR.length > 0 || row.NOT.length > 0
          ) && (
            <span className="text-gray-400 dark:text-gray-500">
              No active filters
            </span>
          )}
        </div>
      </div>

      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6">
        <ImageList
          images={images}
          selectImage={selectImage}
          selectedCount={selectedCount}
          selectedImageIds={selectedImageIds}
          selectImageAll={selectImageAll}
          unSelectImageAll={unSelectImageAll}
          clearAllSelection={clearAllSelection}
          filterRows={filterRows}
          projectId={params.project_id}
        />
        <PaginationFooter
          currentPage={page}
          totalPage={totalPage}
          setCurrentPage={setPage}
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg z-[20]">
            <Spinner size="lg" color="white" />
          </div>
        )}
      </div>

      <Modal
        size={size}
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        classNames={{
          base: "max-w-full m-0",
          wrapper: "max-w-full p-0 md:p-4",
          body: "p-0",
        }}
      >
        <ModalContent>{getModalBody}</ModalContent>
      </Modal>
    </div>
  );
};

export default Page;
