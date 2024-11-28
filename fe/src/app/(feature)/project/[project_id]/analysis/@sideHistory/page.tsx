import PaginationBar from "@/components/common/pagination";
import HistoryCard from "@/components/project/analysis/history-card";
import { customFetch } from "@/app/actions/customFetch";
import { HistoryResponseType } from "@/types/historyType";
import { Suspense } from "react";

const GetHistories = async ({
  projectId,
  nowPage,
  searchParams,
}: {
  projectId: string;
  searchParams?: URLSearchParams;
  nowPage?: number;
}) => {
  const page = nowPage ? nowPage : 1;
  const requestParams = new URLSearchParams(searchParams);
  requestParams.set("page", page.toString());
  const response = await customFetch<HistoryResponseType>({
    method: "GET",
    cache: "no-store",
    ContentType: "application/json",
    endpoint: `/project/history/${projectId}/list`,
    searchParams: requestParams,
  });

  if (!response.data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="p-6 text-center rounded-lg">
          <p className="text-lg font-medium">데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  const result = response.data;
  return (
    // 전체 컨테이너를 flex로 설정하고 높이 지정
    <div className="flex flex-col w-full h-full justify-between">
      {/* 스크롤될 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-8 scrollbar-hide">
        <div className="space-y-4">
          {result.data.data.map((history) => (
            <HistoryCard
              key={history.history_id}
              project_id={projectId}
              {...history}
              queryStrings={requestParams}
            />
          ))}
        </div>
      </div>
      {/* 페이지네이션 영역 */}
      <div className="px-4 py-6 border-t border-divider">
        <PaginationBar
          prefetch={false}
          queryStrings={requestParams}
          totalPage={result.data.total_pages}
          currentPage={page > result.data.total_pages ? result.data.total_pages : page}
        />
      </div>
    </div>
  );
};

interface PageProps {
  params: {
    // 동적변수
    project_id: string;
  };
  searchParams: {
    // 쿼리스트링
    page?: string;
    history_id?: string;
  };
}

const Page = ({ params, searchParams }: PageProps) => {
  const projectId = params.project_id;
  const nowPage = searchParams.page ? parseInt(searchParams.page) : 1;
  const queryStrings = new URLSearchParams(searchParams);
  
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center h-[70vh] min-h-[40rem]">
          <div className="p-4 rounded-lg">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      }
    >
      <GetHistories
        projectId={projectId}
        nowPage={nowPage}
        searchParams={queryStrings}
      />
    </Suspense>
  );
};

export default Page;
