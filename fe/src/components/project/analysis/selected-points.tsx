import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@nextui-org/react";
import { Pagination } from "@nextui-org/react";
import { ReductionResults } from "@/types/historyType";
import { ObjectDetectionLabels } from "@/types/historyType";
import { downloadImages, startDownload } from "@/api/image/imageDownload";

interface SelectedPointsListProps {
  selectedPoints: ReductionResults[];
  currentItems: ReductionResults[];
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  isObjectDetectionLabels: (
    label: ObjectDetectionLabels | string | undefined
  ) => label is ObjectDetectionLabels;
}

export function SelectedPointsList({
  selectedPoints,
  currentItems,
  currentPage,
  totalPages,
  handlePageChange,
  isObjectDetectionLabels,
}: SelectedPointsListProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      const imageIds = selectedPoints
        .map((point) => point.imageId)
        .filter((id, index, self) => self.indexOf(id) === index);

      console.log(imageIds);

      const blob = await downloadImages(imageIds);

      console.log(blob);
      startDownload(blob);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-[40%] bg-white dark:bg-gray-700  text-gray-900 dark:text-gray-300 rounded-xl shadow-sm p-6 border border-divider">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            선택된 이미지
          </h2>
          <span className="text-sm text-default-500">
            {selectedPoints.length}개 선택됨
          </span>
        </div>
        <Button
          onClick={handleDownload}
          isDisabled={selectedPoints.length === 0 || isDownloading}
          size="sm"
          color="primary"
          variant="solid"
          radius="full"
          isLoading={isDownloading}
          spinner={
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          }
        >
          {isDownloading ? "다운로드 중..." : "다운로드"}
        </Button>
      </div>
      <div className="max-h-[44rem] flex-grow overflow-y-auto scrollbar-hide">
        {selectedPoints.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4">
              {currentItems.map((point, index) => (
                <div
                  key={index}
                  className="flex flex-col bg-default-50 rounded-lg border border-divider overflow-hidden hover:border-primary transition-colors"
                >
                  <div className="flex">
                    <div className="relative flex-grow bg-default-200">
                      <Image
                        src={point.imageUrl}
                        alt={`Selected point ${index + 1}`}
                        fill={true}
                        sizes="100%"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="w-[70%] p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-sm text-default-500 truncate">
                            ID: {point.imageId}
                          </span>
                          <span className="text-sm text-default-500 truncate">
                            Detail ID: {point.detailId}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {point.predictions && (
                            <>
                              <span className="text-sm text-default-600">
                                예측:
                              </span>
                              <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                                {point.predictions.prediction}
                              </span>
                            </>
                          )}
                          {point.label && (
                            <>
                              <span className="text-sm text-default-600">
                                실제:
                              </span>
                              <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                                {isObjectDetectionLabels(point.label)
                                  ? point.label.label
                                  : point.label}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  showControls
                  classNames={{
                    wrapper: "gap-2",
                    item: "w-8 h-8",
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12  text-gray-600 dark:text-gray-200">
            <svg
              className="w-12 h-12 mb-4 text-default-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                className="text-gray-600 dark:text-gray-300"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-center">선택된 포인트가 없습니다</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              차트에서 포인트를 선택해주세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SelectedPointsList;
