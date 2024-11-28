// pagination.tsx
import React from "react";
import Link from "next/link";

interface PaginationProps {
  totalPage: number;
  currentPage: number;
  queryStrings?: URLSearchParams;
  prefetch?: boolean | null;
}

const PaginationBar = ({
  totalPage,
  currentPage,
  queryStrings = new URLSearchParams(),
  prefetch = null,
}: PaginationProps) => {
  const createPageUrl = (pageNumber: number) => {
    const newQueryStrings = new URLSearchParams(queryStrings);
    newQueryStrings.set("page", pageNumber.toString());
    return `?${newQueryStrings.toString()}`;
  };

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          prefetch={prefetch}
          href={createPageUrl(currentPage - 1)}
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg
                   border border-divider hover:bg-content2 hover:border-primary/50
                   transition-all duration-200"
        >
          <span className="sr-only">이전 페이지</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      ) : (
        <div className="w-10 h-10 rounded-lg border border-divider/50 opacity-50
                      flex items-center justify-center cursor-not-allowed">
          <span className="sr-only">처음 페이지</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      )}

      {/* Page Numbers */}
      <div className="flex gap-1">
        {Array.from({ length: totalPage }, (_, i) => i + 1).map((page) => (
          <Link
            prefetch={prefetch}
            key={page}
            href={createPageUrl(page)}
            className={`inline-flex items-center justify-center w-10 h-10 rounded-lg
                      transition-all duration-200 ${
                        currentPage === page 
                          ? 'bg-primary text-white shadow-sm shadow-primary/50' 
                          : 'border border-divider hover:bg-content2 hover:border-primary/50'
                      }`}
          >
            {page}
          </Link>
        ))}
      </div>

      {/* Next Button */}
      {currentPage < totalPage ? (
        <Link
          prefetch={prefetch}
          href={createPageUrl(currentPage + 1)}
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg
                   border border-divider hover:bg-content2 hover:border-primary/50
                   transition-all duration-200"
        >
          <span className="sr-only">다음 페이지</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <div className="w-10 h-10 rounded-lg border border-divider/50 opacity-50
                      flex items-center justify-center cursor-not-allowed">
          <span className="sr-only">마지막 페이지</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </nav>
  );
};

export default PaginationBar;