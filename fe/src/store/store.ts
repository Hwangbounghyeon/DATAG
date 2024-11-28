// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import projectReducer from "@/store/create-store";
import userReducer from "@/store/user";

export const CreateProjectStore = configureStore({
  reducer: {
    project: projectReducer,
  },
  devTools: process.env.NODE_ENV === "development",
});

export type CreateProjectState = ReturnType<typeof CreateProjectStore.getState>;
export type CreateProjectAppDispatch = typeof CreateProjectStore.dispatch;

export const userStore = configureStore({
  reducer: {
    user: userReducer,
  },
  devTools: process.env.NODE_ENV === "development",
});

export type userState = ReturnType<typeof userStore.getState>;
export type userAppDispatch = typeof userStore.dispatch;
