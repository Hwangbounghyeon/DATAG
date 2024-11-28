import React from "react";

interface LayoutProps {
  sideHistory: React.ReactNode;
  children: React.ReactNode;
}

const Layout = ({ sideHistory, children }: LayoutProps) => {
  return (
    <div className="w-full min-h-screen flex flex-col dark:bg-gray-900 ">
      {/* Main Content */}
      <div className="flex flex-row flex-grow p-6 gap-6">
        {/* Sidebar */}
        <div className="w-[17%] min-w-[15rem] h-[85vh] sticky top-[4rem]">
          <div className="w-full h-full rounded-xl bg-content1 dark:bg-gray-800 shadow-medium overflow-hidden">
            <div className="w-full h-12 flex items-center px-4 bg-content2 border-b border-divider">
              <h2 className="text-lg font-semibold">History</h2>
            </div>
            <div className="p-4 h-[calc(85vh-3rem)]">{sideHistory}</div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow ">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
