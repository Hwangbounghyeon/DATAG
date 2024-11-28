"use client";
import React, { useState, useEffect } from "react";
import { HistoryListData } from "@/types/historyType";

interface SideHistoriesProps {
  projectId: string;
  setSelectedHistory: (hid: string) => void;
}

export function SideHistories({
  projectId,
  setSelectedHistory,
}: SideHistoriesProps) {
  const [histories, setHistories] = useState<HistoryListData[] | null>(null);

  const [isError, setIsError] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const getHistories = async () => {
    try {
      const requestParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/history/${projectId}?${requestParams.toString()}`,
        {
          headers: {
            Authorization: `bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2LCJlbWFpbCI6IjU1MTYyMzdAa211LmtyIiwiZGVwYXJ0bWVudF9pZCI6MSwiaXNfc3VwZXJ2aXNlZCI6dHJ1ZSwidG9rZW5fdHlwZSI6ImFjY2VzcyIsImV4cCI6MTczMDg5MzkzOX0.asRcUQvBAr5NoLSXnu7kxabQL4mW5uiNKvtvj2gMHi0`,
          },
          cache: "no-store",
        }
      );

      console.log(response);

      if (!response.ok) {
        setIsError(true);
        setHistories(null);
        throw new Error("Network response was not ok");
      }

      const result = await response.json();

      setIsError(false);
      setHistories(result.data.data);
    } catch (error) {
      console.error("Error fetching histories:", error);
      setIsError(true);
      setHistories(null);
    }
  };

  useEffect(() => {
    getHistories();
  }, []);

  useEffect(() => {
    console.log(histories);
  }, [histories]);

  return (
    <div className="w-[17%] min-w-[15rem] me-[3%] h-[85vh] min-h-[40rem] sticky top-[3rem] flex flex-col bg-gray-300">
      <div className="w-full h-[3rem] bg-yellow-300">title</div>
      <div className="flex-grow flex flex-col bg-red-500 overflow-auto">
        {histories ? (
          histories.map((history: HistoryListData) => (
            <div
              key={history.history_id}
              className="flex flex-col bg-gray-300 mb-[1rem] cursor-pointer"
              onClick={() => setSelectedHistory(history.history_id)}
            >
              <div>{history.history_name}</div>
              <div className="flex justify-between">
                <div className="truncate w-[60%]">{history.updated_at}</div>
                <div className="w-[25%]">
                  {history.is_done ? "완료됨" : "분석중"}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-4">
            {isError ? "데이터를 불러오는데 실패했습니다." : "로딩중..."}
          </div>
        )}
      </div>
    </div>
  );
}

export default SideHistories;
