import React from "react";
import Link from "next/link";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">SignUp</h2>
          <p className="mt-2 text-center text-sm 0">
            Already have an account?{" "}
            <Link
              className="font-bold hover:text-red-400 transition-colors"
              href="/login"
            >
              Login
            </Link>
          </p>
        </div>

        {children}
      </div>
    </div>
  );
};

export default Layout;
