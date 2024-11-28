"use client";

import React from "react";

import { Provider } from "react-redux";
import { CreateProjectStore, userStore } from "@/store/store";

export function CreateProjectReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={CreateProjectStore}>{children}</Provider>;
}

export const UserStoreReduxProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <Provider store={userStore}>{children}</Provider>;
};
