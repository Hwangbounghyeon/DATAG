import React from "react";

interface Classes {
    classes: string[];
}

function ClassPanel({ classes }: Classes) {
    const uniqueClasses = Array.from(new Set(classes));
    const getClassColor = (index: number): string => {
        switch (index) {
            case 0:
                return "#FF0000";
            case 1:
                return "#9370DB";
            case 2:
                return "#00FFFF";
            case 3:
                return "#4169E1";
            case 4:
                return "#FFA500";
            case 5:
                return "#32CD32";
            case 6:
                return "#FF69B4";
            default:
                return "#808080";
        }
    };

    return (
        <div className="flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto px-2">
                <div className="flex flex-col gap-2">
                    {uniqueClasses.map((className, index) => (
                        <div
                            key={className}
                            className="flex items-center gap-2"
                        >
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                    backgroundColor: getClassColor(index),
                                }}
                            />
                            <span className="text-md">{className}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ClassPanel;
