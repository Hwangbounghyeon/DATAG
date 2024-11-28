import React from "react";

interface MetadataPanelProps {
    metadata: {
        branch: string;
        process: string;
        location: string;
        equipmentId: string;
        createdAt: string;
    };
}

function MetadataPanel({ metadata }: MetadataPanelProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        })
            .format(date)
            .replace(/\./g, "-");
    };

    return (
        <div className="flex flex-col px-4 max-h-[calc(100%-5.5rem)]">
            <div className="flex flex-col gap-2 overflow-y-auto">
                <div>Branch: {metadata.branch}</div>
                <div>Process: {metadata.process}</div>
                <div>Location: {metadata.location}</div>
                <div>Equipment ID: {metadata.equipmentId}</div>
                <div>Created At: {formatDate(metadata.createdAt)}</div>
            </div>
        </div>
    );
}

export default MetadataPanel;
