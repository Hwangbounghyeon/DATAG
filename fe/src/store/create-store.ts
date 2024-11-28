import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  CreateProjectType,
  SearchDepartmentWithAutyType,
  ProjectAuthType,
  SearchUserWithAuthType,
} from "@/types/projectType";

const VALID_AUTH_TYPES: ProjectAuthType[] = ["ReadOnly", "Read&Write"];

const initialState: CreateProjectType = {
  project_name: "",
  project_model_task: "",
  project_model_name: "",
  description: "",
  accesscontrol: {
    users: {},
    departments: {},
  },
  is_private: false,
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProjectName: (state, action: PayloadAction<string>) => {
      state.project_name = action.payload;
    },
    setProjectModelTask: (state, action: PayloadAction<string>) => {
      state.project_model_task = action.payload;
    },
    setProjectModelName: (state, action: PayloadAction<string>) => {
      state.project_model_name = action.payload;
    },
    setDescription: (state, action: PayloadAction<string>) => {
      state.description = action.payload;
    },
    setIsPrivate: (state, action: PayloadAction<boolean>) => {
      state.is_private = action.payload;
    },
    addUser: (state, action: PayloadAction<SearchUserWithAuthType>) => {
      state.accesscontrol.users[action.payload.user_id] = action.payload;
    },
    removeUser: (state, action: PayloadAction<number>) => {
      delete state.accesscontrol.users[action.payload];
    },
    addDepartment: (
      state,
      action: PayloadAction<SearchDepartmentWithAutyType>
    ) => {
      state.accesscontrol.departments[action.payload.department_id] =
        action.payload;
    },
    removeDepartment: (state, action: PayloadAction<number>) => {
      delete state.accesscontrol.departments[action.payload];
    },
    updateUserAuth: (
      state,
      action: PayloadAction<{ userId: number; auth: ProjectAuthType }>
    ) => {
      if (state.accesscontrol.users[action.payload.userId]) {
        state.accesscontrol.users[action.payload.userId].Auth =
          action.payload.auth;
      }
    },
    updateDepartmentAuth: (
      state,
      action: PayloadAction<{ departmentId: number; auth: ProjectAuthType }>
    ) => {
      if (state.accesscontrol.departments[action.payload.departmentId]) {
        state.accesscontrol.departments[action.payload.departmentId].Auth =
          action.payload.auth;
      }
    },
    resetProject: (state) => {
      return initialState;
    },
  },
});

export const {
  setProjectName,
  setProjectModelName,
  setProjectModelTask,
  setDescription,
  setIsPrivate,
  addUser,
  removeUser,
  addDepartment,
  removeDepartment,
  updateUserAuth,
  updateDepartmentAuth,
  resetProject,
} = projectSlice.actions;

export default projectSlice.reducer;
