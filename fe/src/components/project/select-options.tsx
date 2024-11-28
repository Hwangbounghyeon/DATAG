"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { Button, Select, SelectItem, Spinner } from "@nextui-org/react";
import { useQueryClient } from "@tanstack/react-query";

interface SelectOptionsProps {
  model_list: string[];
}

const SelectOptions = ({ model_list }: SelectOptionsProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [selectModel, setSelectModel] = useState<Set<string>>(new Set([]));

  // URL 쿼리 파라미터 변경 감지 및 상태 업데이트
  useEffect(() => {
    const modelParam = searchParams.get("model_name");
    if (modelParam) {
      console.log("modelParam", modelParam);
      const models = modelParam.split(",");
      setSelectModel(new Set(models));
    } else {
      setSelectModel(new Set([]));
    }

    setIsLoading(false);
  }, [searchParams]);

  // Select 변경 시 URL 업데이트
  const updateURL = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    if (selectModel.size > 0) {
      params.set("model_name", Array.from(selectModel).join(","));
    }

    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
    queryClient.invalidateQueries({
      queryKey: ["projects"],
    });
  };

  const handleModelChange = (keys: Set<string>) => {
    setSelectModel(keys);
  };

  const reset = () => {
    setSelectModel(new Set([]));
    router.push(pathname);
    queryClient.invalidateQueries({
      queryKey: ["projects"],
    });
  };

  return (
    <div className="flex flex-row flex-wrap items-center justify-between gap-4">
      {isLoading ? (
        <Spinner color="primary" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            size={"sm"}
            defaultSelectedKeys={selectModel}
            selectedKeys={selectModel}
            className="w-[200px]"
            label="Model"
            placeholder="Select a model"
            onSelectionChange={(keys) => {
              handleModelChange(keys as Set<string>);
            }}
          >
            {model_list.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </Select>
        </div>
      )}
      <div className="flex flex-row gap-3">
        <Button isLoading={isLoading} onClick={updateURL} color="primary">
          Search
        </Button>
        <Button isLoading={isLoading} onClick={reset} color="warning">
          Reset
        </Button>
      </div>
    </div>
  );
};

export default SelectOptions;
