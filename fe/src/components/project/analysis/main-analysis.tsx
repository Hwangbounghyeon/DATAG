"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { DataPoint } from "@/types/chartType";
import {
  ClassificationPredictions,
  HistoryData,
  ObjectDetectionLabels,
  ObjectDetectionPredictions,
  ReductionResults,
} from "@/types/historyType";
import { Select, SelectItem, Pagination } from "@nextui-org/react";
import { getHistoryDetail } from "@/api/analysis/getHistoryDetail";
import Image from "next/image";
import SelectedPointsList from "./selected-points";
import CountUp from "react-countup";

const ScatterPlot = dynamic(
  () => import("@/components/project/analysis/scatter-plot"),
  { ssr: false }
);

const LabelBarChart = dynamic(
  () => import("@/components/project/analysis/label-bar-chart"),
  { ssr: false }
);

const PieChart = dynamic(
  () => import("@/components/project/analysis/pie-chart"),
  { ssr: false }
);

interface SelectedIndices {
  x: number;
  y: number;
}

interface MainAnalysisProps {
  selectedHistory: string | null | undefined;
}

export function MainAnalysis({ selectedHistory }: MainAnalysisProps) {
  const [selectedIndices, setSelectedIndices] = useState<SelectedIndices>({
    x: 0,
    y: 1,
  });
  const [selectedData, setSelectedData] = useState<HistoryData | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<ReductionResults[]>([]);

  const [displayMode, setDisplayMode] = useState<"prediction" | "real">(
    "prediction"
  );

  const [initialValues, setInitialValues] = useState({
    totalImages: 0,
    duration: 0,
  });

  // PieChart
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // BarChart
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  // ScatterPlot
  const [plotData, setPlotData] = useState<DataPoint[]>([]);

  // 페이지네이션 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(selectedPoints.length / itemsPerPage);

  // 현재 페이지에 표시할 아이템 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = selectedPoints.slice(indexOfFirstItem, indexOfLastItem);

  const isObjectDetectionLabels = (
    label: ObjectDetectionLabels | string | undefined
  ): label is ObjectDetectionLabels => {
    return (
      typeof label === "object" &&
      label !== null &&
      "label" in label &&
      "bbox" in label
    );
  };

  const isObjectDetectionPredictions = (
    predictions: ClassificationPredictions | ObjectDetectionPredictions | null
  ): predictions is ObjectDetectionPredictions => {
    return predictions !== null && "bbox" in predictions;
  };

  const getHistory = async () => {
    if (!selectedHistory) return;
    const response = await getHistoryDetail(selectedHistory);
    if (!response.data) return;
    setSelectedData(response.data);

    const duration =
      response.data?.createdAt && response.data?.updatedAt
        ? Math.round(
            new Date(response.data.updatedAt).getTime() -
              new Date(response.data.createdAt).getTime()
          )
        : 0;

    const uniqueImageIds = response.data.results?.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.imageId === item.imageId)
    );

    setInitialValues({
      totalImages: uniqueImageIds?.length || 0,
      duration: duration,
    });
  };

  const featureOptions = Array.from({ length: 10 }, (_, i) => ({
    value: i.toString(),
    label: `Dimension ${i}`,
  }));

  const handleIndexChange = (axis: "x" | "y", value: string) => {
    const numValue = parseInt(value);
    setSelectedIndices((prev) => {
      if (
        (axis === "x" && numValue === prev.y) ||
        (axis === "y" && numValue === prev.x)
      ) {
        return prev;
      }
      return { ...prev, [axis]: numValue };
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  function extractFeatureData(data: HistoryData): DataPoint[] {
    if (!data.results) return [];

    return data.results
      .filter((result) => result.features && Array.isArray(result.features))
      .filter((result) => {
        if (displayMode === "real") {
          return isObjectDetectionLabels(result.label) && result.label.label;
        }
        return true;
      })
      .map((result) => {
        const realValue = isObjectDetectionLabels(result.label)
          ? result.label.label
          : result.label || null;

        return {
          id: result.detailId,
          x: (result.features as number[])[selectedIndices.x],
          y: (result.features as number[])[selectedIndices.y],
          label:
            displayMode === "prediction"
              ? result.predictions?.prediction || "unknown"
              : realValue || "unknown",
        };
      });
  }

  const selectPoints = (imageIds: string[]) => {
    if (selectedData?.results) {
      const matchingResults = selectedData.results.filter((result) =>
        imageIds.includes(result.detailId)
      );
      setSelectedPoints(matchingResults);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    if (selectedData) {
      const extractedData = extractFeatureData(selectedData);
      setPlotData(extractedData);
    }
  }, [selectedData, selectedIndices, displayMode]);

  useEffect(() => {
    getHistory();
  }, [selectedHistory]);

  return (
    <div className="flex flex-col w-full min-w-[1000px] flex-grow bg-content1 dark:bg-gray-800 mx-4 rounded-xl shadow-medium">
      {selectedHistory && selectedData ? (
        <div className="flex flex-col p-6 space-y-6">
          {/* History Name Header */}
          <div className="w-full grid grid-cols-1">
            <div className="max-w-full overflow-hidden">
              <p className="text-[1.6rem] lg:text-[1.8rem] 2xl:text-[2rem] font-bold truncate">
                History Name: {selectedData?.historyName}
              </p>
            </div>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-gray-900 dark:text-gray-300">
            {/* Selected Algorithm Card */}
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow">
              <h2 className="font-semibold truncate">선택된 알고리즘</h2>
              <p className="truncate text-[2.8rem] lg:text-[3.3rem] 2xl:text-[3.8rem]">
                {selectedData.parameters?.selectedAlgorithm.toUpperCase()}
              </p>
            </div>
            {/* Total Images Card */}
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow">
              <h2 className="font-semibold truncate">총 이미지 갯수</h2>
              <p className="truncate text-[2.8rem] lg:text-[3.3rem] 2xl:text-[3.8rem]">
                <CountUp
                  end={initialValues.totalImages}
                  duration={2}
                  suffix=" 개"
                  redraw={false}
                />
              </p>
            </div>
            {/* Analysis Duration Card */}
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow">
              <h2 className="font-semibold truncate">분석에 소요된 시간</h2>
              <p className="truncate text-[2.8rem] lg:text-[3.3rem] 2xl:text-[3.8rem]">
                <CountUp
                  end={initialValues.duration}
                  duration={2.5}
                  suffix=" ms"
                  redraw={false}
                />
              </p>
            </div>
          </div>

          {/* Label Distribution Chart */}
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow mb-4 w-full">
            <div className="flex w-full gap-4">
              <div className="w-full lg:w-1/2 h-[30rem]">
                <LabelBarChart
                  data={selectedData}
                  selectedLabels={selectedLabels}
                  setSelectedLabels={(s: string[]) => setSelectedLabels(s)}
                  displayMode={displayMode}
                  onLabelsSelect={(points) => {
                    setSelectedIndex(null);
                    setSelectedPoints(points);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="w-full lg:w-1/2 h-[30rem]">
                {selectedData.results ? (
                  <PieChart
                    data={selectedData.results}
                    selectedIndex={selectedIndex}
                    setSelectedIndex={(n: number | null) => setSelectedIndex(n)}
                    onDataSelect={(points) => {
                      setSelectedLabels([]);
                      setSelectedPoints(points);
                      setCurrentPage(1);
                    }}
                  />
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>

          {/* Chart Container */}
          <div className="flex gap-6">
            <div className="w-[60%] bg-white  dark:bg-gray-700  rounded-xl shadow-sm p-4 border border-divider shrink-0">
              <h2 className="text-xl text-gray-900 dark:text-white font-semibold text-foreground">
                Feature 산점도
              </h2>
              <div className="h-[45rem]">
                <ScatterPlot
                  data={plotData}
                  selectedIndices={selectedIndices}
                  selectedPoints={selectedPoints}
                  onSelectPoints={selectPoints}
                  displayMode={displayMode}
                  setDisplayMode={() =>
                    setDisplayMode(
                      displayMode === "prediction" ? "real" : "prediction"
                    )
                  }
                  dragCallBack={() => {
                    setSelectedIndex(null);
                    setSelectedLabels([]);
                  }}
                />
              </div>
              <div className="mt-4 flex gap-4">
                <Select
                  label="X축 Dimension"
                  selectedKeys={[selectedIndices.x.toString()]}
                  onChange={(e) => handleIndexChange("x", e.target.value)}
                  classNames={{
                    base: "flex-1 bg-default-100",
                    trigger:
                      "h-12 rounded-lg border-2 border-divider data-[hover=true]:bg-default-200",
                    label: "text-foreground font-medium",
                    listbox: "rounded-lg border-2 border-divider",
                  }}
                >
                  {featureOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      isDisabled={parseInt(option.value) === selectedIndices.y}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Y축 Dimension"
                  selectedKeys={[selectedIndices.y.toString()]}
                  onChange={(e) => handleIndexChange("y", e.target.value)}
                  classNames={{
                    base: "flex-1 bg-default-100",
                    trigger:
                      "h-12 rounded-lg border-2 border-divider data-[hover=true]:bg-default-200",
                    label: "text-foreground font-medium",
                    listbox: "rounded-lg border-2 border-divider",
                  }}
                >
                  {featureOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      isDisabled={parseInt(option.value) === selectedIndices.x}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
            {/* Selected Points Panel */}
            <SelectedPointsList
              selectedPoints={selectedPoints}
              currentItems={currentItems}
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
              isObjectDetectionLabels={isObjectDetectionLabels}
            />
          </div>
          <div className="flex gap-6"></div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-[90vh]">
          기록을 선택해주세요.
        </div>
      )}
    </div>
  );
}

export default MainAnalysis;
