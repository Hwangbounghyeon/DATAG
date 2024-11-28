import { CreateProjectState } from "@/store/store";
import { CreateProjectResponseType, StepProps } from "@/types/projectType";
import { CreateProjectRequestType } from "@/types/projectType";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { customFetch } from "@/app/actions/customFetch";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

const Step4 = ({ handleMove }: StepProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    router.prefetch("/project");
  }, [router]);

  const project_name = useSelector(
    (state: CreateProjectState) => state.project.project_name
  );
  const project_model_task = useSelector(
    (state: CreateProjectState) => state.project.project_model_task
  );
  const project_model_name = useSelector(
    (state: CreateProjectState) => state.project.project_model_name
  );
  const description = useSelector(
    (state: CreateProjectState) => state.project.description
  );
  const is_private = useSelector(
    (state: CreateProjectState) => state.project.is_private
  );
  const addedAuthUsers = useSelector(
    (state: CreateProjectState) => state.project.accesscontrol.users
  );
  const addedAuthDeps = useSelector(
    (state: CreateProjectState) => state.project.accesscontrol.departments
  );

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>("User");

  const requesetCreateProject = async () => {
    if (isLoading) return;

    try {
      console.log("request create project");
      setIsLoading(true);
      setErrorMessage("");

      const sendData: CreateProjectRequestType = {
        project_name: project_name,
        project_model_task: project_model_task,
        project_model_name: project_model_name,
        description: description,
        accesscontrol: {
          view_users: Object.values(addedAuthUsers)
            .filter((user) => user.Auth === "ReadOnly")
            .map((user) => user.user_id.toString()),
          edit_users: Object.values(addedAuthUsers)
            .filter((user) => user.Auth === "Read&Write")
            .map((user) => user.user_id.toString()),
          view_departments: Object.values(addedAuthDeps)
            .filter((dep) => dep.Auth === "ReadOnly")
            .map((dep) => dep.department_name),
          edit_departments: Object.values(addedAuthDeps)
            .filter((dep) => dep.Auth === "Read&Write")
            .map((dep) => dep.department_name),
        },
        is_private: is_private,
      };

      const response = await customFetch<CreateProjectResponseType>({
        endpoint: "/project/create",
        method: "POST",
        body: JSON.stringify(sendData),
      });
      if (!response.data) {
        setErrorMessage("프로젝트 생성에 실패했습니다.");
      } else {
        const projectId = response.data.data;

        console.log(projectId);
        queryClient.invalidateQueries({
          queryKey: ["projects"],
        });
        router.replace(`/project/${projectId}/image_manage`);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("프로젝트 생성에 실패했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[700px] w-full flex flex-col items-center justify-center">
      <header>
        <h1 className="text-[20px] mb-3">프로젝트 정보</h1>
      </header>
      <section className="gap-2 grid grid-cols-1 md:grid-cols-2">
        <Card className="w-[40%] min-w-[300px]">
          <CardHeader className="flex justify-center text-center">
            <p className="dark:text-white text-black">프로젝트 이름</p>
          </CardHeader>
          <CardBody className="text-center">
            <p className="dark:text-white text-black">{project_name}</p>
          </CardBody>
        </Card>
        <Card className="w-[40%] min-w-[300px]">
          <CardHeader className="flex justify-center text-center">
            <p className="dark:text-white text-black">프로젝트 모델값</p>
          </CardHeader>
          <CardBody className="text-center">
            <p className="dark:text-white text-black">{project_model_name}</p>
          </CardBody>
        </Card>
        <Card className="w-[40%] min-w-[300px]">
          <CardHeader className="flex justify-center text-center">
            <p className="dark:text-white text-black">프로젝트 설명</p>
          </CardHeader>
          <CardBody className="text-center">
            <p className="dark:text-white text-black">{description}</p>
          </CardBody>
        </Card>
        <Card className="w-[40%] min-w-[300px]">
          <CardHeader className="flex justify-center text-center">
            <p className="dark:text-white text-black">프로젝트 Private여부</p>
          </CardHeader>
          <CardBody className="text-center">
            <p className="dark:text-white text-black">
              {is_private ? "Private" : "Public"}
            </p>
          </CardBody>
        </Card>
      </section>
      {!is_private && (
        <section className="w-full flex flex-col items-center mt-8">
          <Tabs
            aria-label="private allow tabs"
            selectedKey={selected}
            onSelectionChange={(key) => setSelected(key.toString())}
            classNames={{
              tabList: "w-full flex justify-center gap-4",
              panel: "pt-4",
              tab: "flex-1 max-w-[300px]",
            }}
          >
            <Tab key="User" title="User">
              <div className="w-full mt-4">
                <Table
                  aria-label="selected user list"
                  classNames={{
                    base: "min-w-[400px] h-[300px]",
                    table: "w-full",
                  }}
                >
                  <TableHeader>
                    <TableColumn>유저 이름</TableColumn>
                    <TableColumn>이메일</TableColumn>
                    <TableColumn>권한</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="등록된 사람이 없습니다.">
                    {Object.values(addedAuthUsers).map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.Auth}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Tab>
            <Tab key="Department" title="Department">
              <div className="w-full mt-4">
                <Table
                  aria-label="selected department list"
                  classNames={{
                    base: "min-w-[400px] h-[300px]",
                    table: "w-full",
                  }}
                >
                  <TableHeader>
                    <TableColumn>부서이름</TableColumn>
                    <TableColumn>권한</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="등록된 부서가 없습니다.">
                    {Object.values(addedAuthDeps).map((department) => (
                      <TableRow key={department.department_id}>
                        <TableCell>{department.department_name}</TableCell>
                        <TableCell>{department.Auth}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Tab>
          </Tabs>
        </section>
      )}
      {errorMessage !== "" && <p className="text-red-500">{errorMessage}</p>}
      <footer className="w-full mb-2 flex flex-row justify-between">
        <Button onClick={() => handleMove(3)} color="primary" variant="ghost">
          이전
        </Button>
        <Button
          onClick={requesetCreateProject}
          color="primary"
          variant="ghost"
          disabled={isLoading}
        >
          {isLoading ? "로딩중..." : "프로젝트 생성"}
        </Button>
      </footer>
    </div>
  );
};

export default Step4;
