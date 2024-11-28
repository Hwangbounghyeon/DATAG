import React from "react";
import Image from "next/image";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <div className="flex flex-row h-[100vh]">
        <section className="hidden lg:block lg:w-1/2 h-full relative">
          <Image
            src={"https://picsum.photos/1080/920"}
            alt={"auth-background"}
            fill
            priority
          />
        </section>
        <section className="w-full lg:w-1/2 h-full">{children}</section>
      </div>
    </div>
  );
};

export default Layout;
