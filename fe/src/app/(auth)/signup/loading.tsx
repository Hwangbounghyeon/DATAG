import { Spinner } from "@nextui-org/react";
import React from "react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <Spinner color="primary" />
    </div>
  );
};

export default Loading;
