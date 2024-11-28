"use client";

import React, { useEffect, useState } from "react";
import { UploadBatchResponse } from "@/types/upload";
import { getUploadBatch } from "@/api/upload/uploadBatch";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { Pagination } from "@nextui-org/react";

interface BaseImage {
    projectId: string;
}

const BatchList = ({ projectId }: BaseImage) => {
    const [batches, setBatches] = useState<UploadBatchResponse[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(1);
    const rowsPerPage = 10;

    const getUploadBatches = async (page: number) => {
        const searchParams = {
            project_id: projectId,
            page: page.toString(),
            limit: rowsPerPage.toString()
        }
        const response = await getUploadBatch(searchParams);

        if (!response.data) {
            return;
        }
        setBatches(response.data.data);
        // API 응답에서 total pages를 받아온다고 가정
        setTotal(Math.ceil(response.data.total_count / rowsPerPage));
    }

    useEffect(() => {
        setBatches([])
        getUploadBatches(currentPage);
    }, [currentPage, projectId]);

    return (
        <div className="flex flex-col space-y-4">
            <div className="space-y-4">
                {batches.map((batch) => (
                    <div key={batch.batch_id} className={`p-4 border rounded-lg`}>
                        <h2 className="text-lg font-bold truncate">{batch.created_at}</h2>
                        <div className="flex justify-end items-end">
                            {batch.is_done ? (
                                <FaRegCheckCircle className="text-green-500 size-6" />
                            ) : (
                                <IoMdCloseCircleOutline className="text-red-500 size-6" />
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-center mt-4">
                <Pagination
                    total={total}
                    page={currentPage}
                    onChange={setCurrentPage}
                    showControls
                    variant="bordered"
                />
            </div>
        </div>
    );
};

export default BatchList;