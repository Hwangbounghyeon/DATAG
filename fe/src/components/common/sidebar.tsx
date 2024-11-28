"use client";

import { AiFillDatabase, AiFillFileImage } from "react-icons/ai";

import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import SidebarItem from "./sidebar-item";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { userState } from "@/store/store";
import { useSelector } from "react-redux";
import { Button, Spinner } from "@nextui-org/react";
import { clearUserProfile, fetchUserProfile } from "@/store/user";
import { useUserDispatch } from "@/hooks/userProfileHook";
import { logout } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ThemeSelect = dynamic(() => import("@/components/common/theme-select"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const dummyItemList = [
  {
    title: "Image",
    icon: AiFillFileImage,
    link: "/image",
  },
  {
    title: "Project",
    icon: AiFillDatabase,
    link: "/project",
  },
];

const Sidebar = () => {
  const dispatch = useUserDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  const isLoading = useSelector((state: userState) => state.user.loading);
  const profile = useSelector((state: userState) => state.user.profile);
  const error = useSelector((state: userState) => state.user.error);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!profile) {
          dispatch(fetchUserProfile());
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };

    fetchData();
  }, []);

  // 디버깅을 위한 로그
  useEffect(() => {
    console.log("Current state:", { isLoading, profile, error });
  }, [isLoading, profile, error]);
  return (
    <>
      {/* Hover trigger area */}
      <div
        className="fixed left-0 top-0 w-2 h-screen z-40"
        onMouseEnter={() => setIsExpanded(true)}
      />

      {/* Sidebar */}
      <aside
        className={`z-50  fixed top-0 left-0 h-screen px-3 py-3 bg-slate-100 dark:bg-zinc-950 border-r-2 border-r-slate-300 dark:border-r-[#1e1e1e] flex flex-col items-center transition-all duration-300 ease-in-out
          ${isExpanded ? "w-64 translate-x-0" : "w-64 -translate-x-64"}`}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="p-3 dark:bg-zinc-600 flex flex-col items-center rounded-md cursor-pointer hover:scale-[105%] active:scale-[95%]  transform transition duration-100">
          <Image
            className="rounded-md"
            src="/images/logo.png"
            alt="logo"
            width={160}
            height={50}
            onClick={() => {
              router.push("/");
            }}
          />
        </div>
        <header className="mt-3 mb-3 w-[200px] h-[150px] bg-slate-200 dark:bg-gray-800 rounded-md flex flex-col justify-center items-center">
          {isLoading ? (
            <Spinner color="primary" />
          ) : profile ? (
            <div className="flex flex-col items-center rounded-sm ">
              <p>{profile.name}님 환영합니다.</p>
              <Button
                onClick={() => {
                  logout();
                  dispatch(clearUserProfile());
                  router.push("/");
                }}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <p>로그인을 해주세요</p>
              <Button onClick={() => router.push("/login")} color="primary">
                로그인
              </Button>
            </div>
          )}
        </header>
        <section className="mt-3 w-full">
          {dummyItemList.map((item) => (
            <SidebarItem
              key={item.title}
              title={item.title}
              Icon={item.icon}
              link={item.link}
            />
          ))}
        </section>
        <section className="absolute bottom-5">
          <ThemeSelect />
        </section>
      </aside>

      {/* Toggle Button - Now at bottom left */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`fixed bottom-4 z-50 bg-slate-100 dark:bg-black p-2 rounded-r-lg border-y-2 border-r-2 border-slate-300 dark:border-[#1e1e1e] transition-all duration-300 ease-in-out hover:bg-slate-200 dark:hover:bg-zinc-900
          ${isExpanded ? "left-64" : "left-0"}`}
        aria-label={isExpanded ? "Close sidebar" : "Open sidebar"}
      >
        {isExpanded ? (
          <IoIosArrowBack className="text-xl" />
        ) : (
          <IoIosArrowForward className="text-xl" />
        )}
      </button>
    </>
  );
};

export default Sidebar;
