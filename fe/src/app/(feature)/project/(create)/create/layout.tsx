"use client";

import React from "react";
import { CreateProjectReduxProvider } from "@/components/common/redux-provider";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="w-full">
      <CreateProjectReduxProvider>{children}</CreateProjectReduxProvider>
    </div>
  );
};

export default Layout;
