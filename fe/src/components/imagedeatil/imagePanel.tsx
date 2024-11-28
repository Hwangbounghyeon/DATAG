import React, { useCallback, useEffect, useRef } from "react";
import { Detection } from "@/types/metadata";

interface ImagePanelProps {
    imageSrc: string;
    detections?: Detection[];
}

function ImagePanel({ imageSrc, detections }: ImagePanelProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const colorMapRef = useRef<Map<string, string>>(new Map());

    const colors = [
        "#FF0000",
        "#9370DB",
        "#00FFFF",
        "#4169E1",
        "#FFA500",
        "#32CD32",
        "#FF69B4",
        "#808080",
    ];

    const getClassColor = useCallback((className: string): string => {
        if (colorMapRef.current.has(className)) {
            return colorMapRef.current.get(className)!;
        }

        const nextColorIndex = colorMapRef.current.size % colors.length;
        const color = colors[nextColorIndex];
        colorMapRef.current.set(className, color);
        return color;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const image = new Image();
        image.src = imageSrc;

        image.onload = () => {
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;

            ctx.drawImage(image, 0, 0);

            console.log("width, height: ", canvas.width, ", ", canvas.height);
            console.log(detections);

            if (detections && detections.length > 0) {
                detections.forEach((detection) => {
                    const [x1, y1, x2, y2] = detection.bbox;
                    const color = getClassColor(detection.prediction);

                    ctx.beginPath();
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.rect(x1, y1, x2 - x1, y2 - y1);
                    ctx.stroke();

                    ctx.fillStyle = color;
                    ctx.font = "16px Arial";
                    const label = `${detection.prediction} ${(
                        detection.confidence * 100
                    ).toFixed(1)}%`;
                    ctx.fillText(label, x1, y1 - 5);
                });
            }
        };
    }, [imageSrc, detections, getClassColor]);

    return (
        <div className="h-full w-full flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800">
            <canvas
                ref={canvasRef}
                style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                }}
            />
        </div>
    );
}

export default ImagePanel;
