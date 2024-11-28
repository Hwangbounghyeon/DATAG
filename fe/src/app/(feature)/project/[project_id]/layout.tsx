
import React from "react";
import FloatingButton from "@/components/project/floating-button";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="w-full">
      {children}
      <FloatingButton />
    </div>
  );
};

export default Layout;
