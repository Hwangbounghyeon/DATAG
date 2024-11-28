import SignForm from "@/components/auth/signupForm";
import { DepartmentType } from "@/types/departmentType";

export default async function Page() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/department/list`
  );
  const data = await response.json();
  const department_list: DepartmentType[] = data.data;

  return <SignForm department_list={department_list} />;
}
