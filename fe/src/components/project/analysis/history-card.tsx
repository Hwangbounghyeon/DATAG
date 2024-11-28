// history-card.tsx
import { HistoryListData } from "@/types/historyType";
import Link from "next/link";

interface HistoryCardProps extends HistoryListData {
  project_id: string;
  queryStrings?: URLSearchParams;
  prefetch?: boolean | null;
}

const HistoryCard = ({
  project_id,
  history_id,
  history_name,
  is_done,
  created_at,
  updated_at,
  prefetch = null,
  queryStrings,
}: HistoryCardProps) => {
  const searchParams = new URLSearchParams(queryStrings);
  searchParams.set("history_id", history_id);

  const statusConfig = {
    0: { color: "bg-warning-100 text-warning-700", text: "진행" },
    1: { color: "bg-success-100 text-success-700", text: "완료" },
    2: { color: "bg-danger-100 text-danger-700", text: "실패" },
  };

  const status =
    statusConfig[is_done as keyof typeof statusConfig] || statusConfig[0];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const CardContent = () => (
    <div
      className={`p-4 rounded-lg bg-content2 shadow-sm transition-all duration-200 
                    border border-transparent 
                    ${
                      is_done === 1
                        ? "hover:shadow-md hover:translate-x-1 hover:border-primary/20 cursor-pointer"
                        : "opacity-60 cursor-not-allowed"
                    }`}
    >
      <div className="space-y-3">
        <h3
          className={`text-lg text-gray-900 dark:text-gray-300 font-semibold text-foreground line-clamp-1 
                      ${is_done === 1 ? "group-hover:text-primary" : ""}`}
        >
          {history_name}
        </h3>
        <div className="flex justify-between items-center">
          <time className="text-sm text-foreground-500 truncate">
            {formatDate(created_at)}
          </time>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap inline-flex items-center justify-center ${status.color}`}
          >
            {status.text}
          </span>
        </div>
      </div>
    </div>
  );

  return is_done === 1 ? (
    <Link
      prefetch={prefetch}
      href={`/project/${project_id}/analysis?${searchParams.toString()}`}
      className="block group"
    >
      <CardContent />
    </Link>
  ) : (
    <div className="block">
      <CardContent />
    </div>
  );
};

export default HistoryCard;
