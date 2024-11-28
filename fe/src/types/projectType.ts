import { DefaultResponseType } from "./default";
import { DepartmentType } from "./departmentType";

export type SearchUserType = {
    user_id: number;
    name: string;
    email: string;
};

export type SearchUserWithAuthType = SearchUserType & {
    Auth: ProjectAuthType;
};

export type SearchDepartmentWithAutyType = DepartmentType & {
    Auth: ProjectAuthType;
};

export type CreateProjectType = {
    project_name: string;
    project_model_task: string;
    project_model_name: string;
    description: string;
    accesscontrol: {
        users: Record<number, SearchUserWithAuthType>;
        departments: Record<number, SearchDepartmentWithAutyType>;
    };
    is_private: boolean;
};

export type CreateProjectRequestType = {
    project_name: string;
    project_model_name: string;
    project_model_task: string;
    description: string;
    accesscontrol: {
        view_users: string[];
        edit_users: string[];
        view_departments: string[];
        edit_departments: string[];
    };
    is_private: boolean;
};

export type ProjectRequest = {
  page: string;
  model_name?: string;
};

// 실제 이용할 때는 아래와 같이 사용
export type ProjectType = {
    project_id: number;
    project_name: string;
    task: string;
    model_name: string;
    description: string;
    user_id: number; // 생성한 사람 이름
    department: string; // 생성한 사람의 부서 이름
    is_private: boolean; // 0 : 공개, 1 : 비공개
    is_editor: boolean;
    is_creator: boolean;
    created_at: string;
    updated_at: string;
};

export interface StepProps {
    handleMove: (step: number) => void;
}

export type ProjectAuthType = "ReadOnly" | "Read&Write" | "None";

export type CreateProjectResponseType = DefaultResponseType<{
    status: number;
    data: string;
}>;
