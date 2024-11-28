import React from "react";
import { Card, CardBody, Divider } from "@nextui-org/react";
import PaginationFooter from "./pagination-footer";
import { UploadBatch } from "@/types/ImagesType";

interface UploadBatchListProps {
  batches: UploadBatch[];
  currentPage: number;
  totalPage: number;
  setCurrentPage: (page: number) => void;
}

const UploadBatchList = ({
  batches,
  currentPage,
  totalPage,
  setCurrentPage,
}: UploadBatchListProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Upload Batches</h2>
      <div className="flex flex-col gap-2">
        {batches.map((batch, index) => (
          <Card key={index} className="w-full">
            <CardBody className="p-3">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Project: {batch.projectId}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    batch.isDone ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {batch.isDone ? 'Completed' : 'In Progress'}
                  </span>
                </div>
                <Divider className="my-2" />
                <div className="text-xs text-gray-500">
                  Created: {new Date(batch.createdAt).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  Updated: {new Date(batch.updatedAt).toLocaleString()}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      <PaginationFooter
        currentPage={currentPage}
        totalPage={totalPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default UploadBatchList;