"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  ScatterDataPoint,
  Chart,
  ScriptableTooltipContext,
  TooltipItem,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import zoomPlugin from "chartjs-plugin-zoom";
import { DataPoint } from "@/types/chartType";
import { Button } from "@nextui-org/button";
import { Card } from "@nextui-org/card";
import { LABEL_COLORS, LabelColors } from "@/lib/constants/labelColors";
import { HistoryData, ReductionResults } from "@/types/historyType";
import { useTheme } from "next-themes";

interface SelectedIndices {
  x: number;
  y: number;
}

interface ScatterPlotProps {
  data: DataPoint[];
  selectedIndices: SelectedIndices;
  selectedPoints: ReductionResults[];
  onSelectPoints?: (points: string[]) => void;
  displayMode: "prediction" | "real";
  setDisplayMode: () => void;
  dragCallBack: () => void;
}

interface DragStatus {
  isDragging: boolean;
}

interface CustomChart extends Chart<"scatter", ScatterDataPoint[], unknown> {
  dragStatus?: DragStatus;
}

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  zoomPlugin
);

const ScatterPlot = ({
  data,
  selectedIndices,
  selectedPoints,
  onSelectPoints,
  displayMode,
  setDisplayMode,
  dragCallBack,
}: ScatterPlotProps) => {
  const { theme, systemTheme } = useTheme();

  const chartRef = useRef<CustomChart | null>(null);
  const [isDragMode, setIsDragMode] = useState(false);
  const [selectedPointsId, setSelectedPointsId] = useState<string[]>([]);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const animationFrameRef = useRef<number>();

  // 현재 적용되어야 할 실제 테마 계산
  const currentTheme = useMemo(() => {
    if (theme === "system") {
      return systemTheme;
    }
    return theme;
  }, [theme, systemTheme]);

  const groupedData = useMemo(() => {
    return data.reduce((acc, point) => {
      if (!acc[point.label]) {
        acc[point.label] = [];
      }
      acc[point.label].push(point);
      return acc;
    }, {} as Record<string, DataPoint[]>);
  }, [data]);

  const chartData: ChartData<"scatter"> = useMemo(
    () => ({
      datasets: Object.entries(groupedData).map(([label, points]) => ({
        label,
        data: points.map((p) => ({
          x: p.x,
          y: p.y,
          id: p.id,
        })),
        backgroundColor: LABEL_COLORS[label] || "rgba(0, 0, 0, 0.6)",
        pointBackgroundColor: LABEL_COLORS[label] || "rgba(0, 0, 0, 0.6)",
        titleColor: theme === "dark" ? "#fff" : "#334155",
        bodyColor: theme === "dark" ? "#fff" : "#334155",
        // 선택된 점의 테두리 스타일
        pointBorderWidth: points.map((p) =>
          selectedPointsId.includes(p.id) ? 3 : 1
        ),
        pointBorderColor: points.map((p) =>
          selectedPointsId.includes(p.id)
            ? "#FF4500" // 테두리 색상
            : LABEL_COLORS[label] || "rgba(0, 0, 0, 0.6)"
        ),
        // 선택된 점의 크기를 좀 더 크게
        pointRadius: points.map((p) =>
          selectedPointsId.includes(p.id) ? 12 : 8
        ),
        pointHoverRadius: 12,
        // 선택된 점에 그림자 효과
        pointShadowOffsetX: points.map((p) =>
          selectedPointsId.includes(p.id) ? 3 : 0
        ),
        pointShadowOffsetY: points.map((p) =>
          selectedPointsId.includes(p.id) ? 3 : 0
        ),
        pointShadowBlur: points.map((p) =>
          selectedPointsId.includes(p.id) ? 10 : 0
        ),
        pointShadowColor: "rgba(0, 0, 0, 0.5)",
      })),
    }),
    [groupedData, selectedPointsId]
  );

  const options: ChartOptions<"scatter"> = useMemo(
    () => ({
      animation: { duration: 150 },
      scales: {
        x: {
          grid: {
            color:
              currentTheme === "dark"
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.06)",
            drawBorder: false,
          },
          type: "linear",
          position: "bottom",
          title: {
            display: true,
            text: `Dimension ${selectedIndices.x}`,
            color: currentTheme === "dark" ? "#fff" : "#000",
            font: {
              size: 14,
              weight: "bold",
            },
            padding: { top: 10, bottom: 0 },
          },
          ticks: {
            font: {
              size: 12,
            },
            color: currentTheme === "dark" ? "#9ca3af" : "#64748b",
            padding: 8,
          },
        },
        y: {
          grid: {
            color:
              currentTheme === "dark"
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.06)",

            drawBorder: false,
          },
          type: "linear",
          position: "left",
          title: {
            display: true,
            text: `Dimension ${selectedIndices.y}`,
            color: currentTheme === "dark" ? "#fff" : "#000",
            font: {
              size: 14,
              weight: "bold",
            },
            padding: { top: 0, bottom: 10 },
          },
          ticks: {
            font: {
              size: 12,
            },
            color: currentTheme === "dark" ? "#9ca3af" : "#64748b",
            padding: 8,
          },
        },
      },
      plugins: {
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
              speed: 0.1,
            },
            pinch: {
              enabled: false,
            },
            mode: "xy",
          },
          pan: {
            enabled: true,
            mode: "xy",
            threshold: 10,
          },
        },
        tooltip: {
          backgroundColor:
            currentTheme === "dark"
              ? "rgba(0, 0, 0, 0.85)"
              : "rgba(255, 255, 255, 0.95)",
          titleColor: currentTheme === "dark" ? "#fff" : "#334155",
          bodyColor: currentTheme === "dark" ? "#fff" : "#334155",
          borderColor:
            currentTheme === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
          bodyFont: {
            size: 12,
          },
          padding: 12,
          borderWidth: 1,
          displayColors: true,
          enabled: (ctx: ScriptableTooltipContext<"scatter">) => {
            const chart = ctx.chart as CustomChart;
            return !chart.dragStatus?.isDragging;
          },
          callbacks: {
            label: (context: TooltipItem<"scatter">) => {
              const point = data.find(
                (p) => p.x === context.parsed.x && p.y === context.parsed.y
              );
              return `ID: ${point?.id}, Label: ${point?.label}`;
            },
          },
        },
        legend: {
          position: "top" as const,
          align: "end" as const,
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            padding: 20,
            font: {
              size: 14,
            },
            color: currentTheme === "dark" ? "#fff" : "#334155",
            generateLabels: (chart: Chart) => {
              const datasets = chart.data.datasets;
              return datasets.map((dataset, index) => ({
                text: dataset.label || "",
                fillStyle: dataset.backgroundColor as string,
                strokeStyle: dataset.borderColor as string,
                lineWidth: 2,
                hidden: !chart.isDatasetVisible(index),
              }));
            },
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      events: [
        "mousemove",
        "mouseout",
        "click",
        "touchstart",
        "touchmove",
        "mousedown",
        "mouseup",
      ],
      hover: {
        mode: "nearest",
        intersect: true,
      },
      interaction: {
        mode: "nearest",
        intersect: true,
        axis: "xy",
      },
    }),
    [selectedIndices, data, currentTheme]
  );

  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      const zoomState = {
        x:
          chart.scales.x.options.min !== undefined
            ? {
                min: chart.scales.x.options.min,
                max: chart.scales.x.options.max,
              }
            : null,
        y:
          chart.scales.y.options.min !== undefined
            ? {
                min: chart.scales.y.options.min,
                max: chart.scales.y.options.max,
              }
            : null,
      };

      if (zoomState.x) {
        chart.scales.x.options.min = zoomState.x.min;
        chart.scales.x.options.max = zoomState.x.max;
      }
      if (zoomState.y) {
        chart.scales.y.options.min = zoomState.y.min;
        chart.scales.y.options.max = zoomState.y.max;
      }
      chart.update("none");
    }
  }, [data, selectedIndices]);

  useEffect(() => {
    const dragSelectPlugin = {
      id: "dragSelect",
      beforeEvent: function (
        chart: CustomChart,
        args: {
          event: { type: string; x: number; y: number; native: MouseEvent };
        }
      ) {
        const event = args.event;

        // 마우스 버튼이 눌린 상태인지 확인
        const isMouseButtonDown = event.native.buttons === 1;

        if (event.type === "mousedown" && isDragMode) {
          requestAnimationFrame(() => {
            dragCallBack();
            setDragStart({ x: event.x, y: event.y });
            setIsDragging(true);
            chart.dragStatus = { isDragging: true };
            chart.options.hover = { mode: undefined };
            chart.options.interaction = { mode: undefined };
          });
        }

        if (
          event.type === "mousemove" &&
          isDragging &&
          dragStart &&
          isDragMode &&
          isMouseButtonDown
        ) {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }

          animationFrameRef.current = requestAnimationFrame(() => {
            const canvas = chart.canvas;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            chart.draw();
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = "rgba(0, 123, 255, 0.2)";
            ctx.strokeStyle = "rgba(0, 123, 255, 0.8)";
            ctx.lineWidth = 1;

            const rect = {
              x: Math.min(dragStart.x, event.x),
              y: Math.min(dragStart.y, event.y),
              width: Math.abs(event.x - dragStart.x),
              height: Math.abs(event.y - dragStart.y),
            };

            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
            ctx.restore();
          });
        }

        // 마우스 버튼이 떼어졌을 때나 마우스가 캔버스를 벗어났을 때도 드래그 상태를 초기화
        if (
          (event.type === "mouseup" ||
            event.type === "mouseout" ||
            !isMouseButtonDown) &&
          isDragging
        ) {
          if (event.type === "mouseup" && dragStart) {
            const xScale = chart.scales.x;
            const yScale = chart.scales.y;

            if (!xScale || !yScale) return;

            const startDataX = xScale.getValueForPixel(dragStart.x);
            const endDataX = xScale.getValueForPixel(event.x);
            const startDataY = yScale.getValueForPixel(dragStart.y);
            const endDataY = yScale.getValueForPixel(event.y);

            if (
              startDataX === undefined ||
              endDataX === undefined ||
              startDataY === undefined ||
              endDataY === undefined
            )
              return;

            const newSelectedPoints = data
              .filter(
                (point) =>
                  point.x >= Math.min(startDataX, endDataX) &&
                  point.x <= Math.max(startDataX, endDataX) &&
                  point.y >= Math.min(startDataY, endDataY) &&
                  point.y <= Math.max(startDataY, endDataY)
              )
              .map((p) => p.id);

            onSelectPoints?.(newSelectedPoints);
          }

          setIsDragging(false);
          setDragStart(null);
          chart.dragStatus = { isDragging: false };
          chart.options.hover = { mode: "point" };
          chart.options.interaction = { mode: "point" };

          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          chart.draw();
        }

        if (!isDragMode && isDragging) {
          setIsDragging(false);
          setDragStart(null);
          chart.dragStatus = { isDragging: false };
          chart.options.hover = { mode: "point" };
          chart.options.interaction = { mode: "point" };
          chart.draw();
        }
      },
    };

    ChartJS.register(dragSelectPlugin);

    return () => {
      ChartJS.unregister(dragSelectPlugin);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging, dragStart, data, onSelectPoints, isDragMode]);

  useEffect(() => {
    console.log(isDragMode);
    const chart = chartRef.current;
    if (chart && chart.options.plugins?.zoom?.pan) {
      chart.options.plugins.zoom.pan.enabled = !isDragMode;
      chart.update("none");
    }
  }, [isDragMode]);

  useEffect(() => {
    const pointIds = selectedPoints.map((point) => point.detailId);
    setSelectedPointsId(pointIds);
  }, [selectedPoints]);

  return (
    <Card className="w-full h-full p-6 bg-white dark:bg-zinc-800 shadow-md">
      <div className="relative w-full h-full">
        <div className="h-[calc(100%-48px)]">
          <Scatter ref={chartRef} data={chartData} options={options} />
        </div>

        <div className="absolute bottom-2 flex w-full justify-between">
          <div className="flex gap-2">
            <Button
              color="primary"
              variant="flat"
              size="sm"
              radius="full"
              className="text-xs font-medium"
              onClick={() => {
                setIsDragMode(!isDragMode);
              }}
            >
              {isDragMode ? "Drag Mode" : "Move Mode"}
            </Button>
            <Button
              color="primary"
              variant="flat"
              size="sm"
              radius="full"
              className="text-xs font-medium"
              onClick={() => {
                onSelectPoints?.([]);
                setIsDragMode(false);
                setDisplayMode();
              }}
            >
              {displayMode === "prediction" ? "Prediction" : "Real"}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              color="primary"
              variant="flat"
              size="sm"
              radius="full"
              className="text-xs font-medium"
              onClick={() => {
                if (chartRef.current) {
                  chartRef.current.resetZoom();
                }
              }}
            >
              Reset Zoom
            </Button>

            <Button
              color="danger"
              variant="light"
              size="sm"
              radius="full"
              className="text-xs font-medium"
              onClick={() => {
                onSelectPoints?.([]);
              }}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ScatterPlot;
