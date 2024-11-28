// BarChart.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Card } from "@nextui-org/card";
import {
  HistoryData,
  ObjectDetectionLabels,
  ReductionResults,
} from "@/types/historyType";
import { LABEL_COLORS } from "@/lib/constants/labelColors";
import { useTheme } from "next-themes";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: HistoryData;
  selectedLabels: string[];
  setSelectedLabels: (s: string[]) => void;
  displayMode: "prediction" | "real";
  onLabelsSelect?: (points: ReductionResults[]) => void;
}

const BarChart = ({
  data,
  selectedLabels,
  setSelectedLabels,
  displayMode,
  onLabelsSelect,
}: BarChartProps) => {
  // const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const { theme } = useTheme();
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

  const distributionData = useMemo(() => {
    const distribution: { [key: string]: number } = {};

    data.results?.forEach((result) => {
      if (result.predictions?.prediction) {
        const label = result.predictions.prediction;
        distribution[label] = (distribution[label] || 0) + 1;
      }
    });

    return distribution;
  }, [data]);

  const chartData = {
    labels: Object.keys(distributionData),
    datasets: [
      {
        label: "Label Distribution",
        data: Object.values(distributionData),
        backgroundColor: Object.keys(distributionData).map(
          (label) => LABEL_COLORS[label] || "rgba(0, 0, 0, 0.6)"
        ),
        borderWidth: Object.keys(distributionData).map((label) =>
          selectedLabels.includes(label) ? 5 : 1
        ),
        borderColor: Object.keys(distributionData).map((label) =>
          selectedLabels.includes(label)
            ? "#FF4500"
            : LABEL_COLORS[label] || "rgba(0, 0, 0, 0.6)"
        ),
        hoverBackgroundColor: Object.keys(distributionData).map((label) =>
          selectedLabels.includes(label)
            ? LABEL_COLORS[label]
            : "rgba(0, 0, 0, 0.6)"
        ),
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#334155",
        bodyColor: "#334155",
        bodyFont: {
          size: 12,
        },
        padding: 12,
        borderColor: "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            return `Count: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: "#64748b",
          padding: 8,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.06)",
        },
        ticks: {
          font: {
            size: 12,
          },
          color: "#64748b",
          padding: 8,
          stepSize: 1,
        },
      },
    },
    datasets: {
      bar: {
        barPercentage: 0.8,
        categoryPercentage: 0.9,
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const clickedIndex = elements[0].index;
        const clickedLabel = Object.keys(distributionData)[clickedIndex];

        // 선택된 라벨 토글
        const newSelectedLabels = selectedLabels.includes(clickedLabel)
          ? selectedLabels.filter((label) => label !== clickedLabel)
          : [...selectedLabels, clickedLabel];

        setSelectedLabels(newSelectedLabels);

        console.log(newSelectedLabels);

        const selectedPoints =
          data.results?.filter((result) => {
            if (displayMode === "prediction") {
              return newSelectedLabels.includes(
                result.predictions?.prediction || ""
              );
            } else {
              if (isObjectDetectionLabels(result.label)) {
                return newSelectedLabels.includes(result.label.label);
              }
              return newSelectedLabels.includes(result.label || "");
            }
          }) || [];

        onLabelsSelect?.(selectedPoints);
      }
    },
  };

  return (
    <Card className="w-full h-full p-6 bg-white dark:bg-zinc-800 shadow-md">
      <div className="relative w-full h-full">
        <div className="absolute inset-0">
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </Card>
  );
};

export default BarChart;
