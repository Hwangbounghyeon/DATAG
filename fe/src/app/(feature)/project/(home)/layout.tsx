import React from "react";
import Link from "next/link";

interface LayoutProps {
  options: React.ReactNode;
  children: React.ReactNode;
}

const Layout = ({ options, children }: LayoutProps) => {
  return (
    <div className="w-full h-[100vh] flex flex-col items-center bg-gray-50 dark:bg-gray-900 pt-4 px-2">
      <header className="w-full flex flex-row justify-between align-middle items-center flex-wrap">
        <h1 className="text-[30px] font-bold p-0">Projects</h1>

        <Link
          href={"/project/create"}
          className="bg-primary hover:bg-primary/90 font-bold text-[18px] text-white border-none rounded-md px-5 py-3"
        >
          + Create Project
        </Link>
      </header>
      <div className="w-full mt-5">{options}</div>
      {children}
    </div>
  );
};

export default Layout;
