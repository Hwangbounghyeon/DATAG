// src/hooks/index.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import {
  CreateProjectAppDispatch,
  CreateProjectState,
  userAppDispatch,
  userState,
} from "@/store/store";

// Project store hooks
export const useProjectDispatch = () => useDispatch<CreateProjectAppDispatch>();
export const useProjectSelector: TypedUseSelectorHook<CreateProjectState> =
  useSelector;

// User store hooks
export const useUserDispatch = () => useDispatch<userAppDispatch>();
export const useUserSelector: TypedUseSelectorHook<userState> = useSelector;
