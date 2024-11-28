import { Spinner } from "@nextui-org/react";
import { Suspense, lazy } from "react";
const ProjectList = lazy(() => import("@/components/project/project-list"));

export const dynamic = "force-dynamic";

const Page = () => {
  return (
    <div className="bg-gray-100 h-full overflow-hidden dark:bg-gray-800 py-2 px-2 my-3 rounded-md w-full  flex flex-col items-center flex-grow remove_scrollbar ">
      <Suspense fallback={<Spinner size="lg" />}>
        <ProjectList />
      </Suspense>
    </div>
  );
};

export default Page;
