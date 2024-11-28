import React, { Suspense } from "react";
import SelectOptions from "@/components/project/select-options";
import { Spinner } from "@nextui-org/react";
import { getModels } from "@/app/actions/model";

const Page = async ({
  searchParams,
}: {
  searchParams: {
    page?: string;
    model_name?: string;
  };
}) => {
  const modelResponse = await getModels();
  const modelData = modelResponse?.data
    ? Object.values(modelResponse.data).flat()
    : [];

  return (
    <Suspense
      key={searchParams.model_name || ""}
      fallback={<Spinner size="lg" />}
    >
      <SelectOptions model_list={modelData} />
    </Suspense>
  );
};

export default Page;
