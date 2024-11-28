import { StepProps } from "@/types/projectType";
import { CreateProjectAppDispatch, CreateProjectState } from "@/store/store";
import {
  updateDepartmentAuth,
  updateUserAuth,
  removeUser,
  removeDepartment,
  setIsPrivate,
} from "@/store/create-store";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Checkbox,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spinner,
} from "@nextui-org/react";
import AddAuthUser from "./add-auth-user";
import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import AddAuthDeps from "./add-auth-deps";
import ButtonFooter from "./buttonFooter";

export default function Step3({ handleMove }: StepProps) {
  const dispatch = useDispatch<CreateProjectAppDispatch>();
  const addedAuthUsers = useSelector(
    (state: CreateProjectState) => state.project.accesscontrol.users
  );
  const addedAuthDeps = useSelector(
    (state: CreateProjectState) => state.project.accesscontrol.departments
  );
  const isPrivate = useSelector(
    (state: CreateProjectState) => state.project.is_private
  );

  const [isOpenUserModal, setIsOpenUserModal] = useState(false);
  const [isOpenDepModal, setIsOpenDepModal] = useState(false);

  return (
    <div className="max-w-[700px] w-full flex flex-col items-center justify-center">
      <header>
        <h1 className="text-[20px] mb-3">
          추가적으로 프로젝트에 접근 허용할 대상을 골라 주세요.
        </h1>
        <div className="w-full flex flex-row justify-evenly flex-wrap">
          <Button
            color="primary"
            disabled={isPrivate}
            onClick={() => setIsOpenDepModal(true)}
          >
            부서 추가
          </Button>
          <Button
            disabled={isPrivate}
            color="primary"
            onClick={() => setIsOpenUserModal(true)}
          >
            인원 추가
          </Button>
        </div>
        <div className="flex flex-col items-center mt-2 mb-2 justify-center">
          <Checkbox
            classNames={{
              label: "text-black dark:text-white",
            }}
            isSelected={isPrivate}
            onValueChange={(isSelected) => {
              dispatch(setIsPrivate(isSelected));
            }}
          >
            Private으로 생성하기
          </Checkbox>
          <p>
            Private으로 설정하면, 설정값과 관계없이 무조건 자기 자신만 볼수
            있습니다.
          </p>
        </div>
      </header>
      {!isPrivate && (
        <div className="w-full flex flex-col items-center">
          <div className="w-full flex flex-row gap-8">
            <section className="w-1/2 flex flex-col">
              <h3 className="text-[14px] text-center mb-2">부서 목록</h3>
              <Table
                classNames={{
                  base: "w-full",
                  table: "w-full",
                }}
                selectionMode="none"
                aria-label="선택된 부서 목록"
              >
                <TableHeader>
                  <TableColumn>부서 이름</TableColumn>
                  <TableColumn>권한</TableColumn>
                </TableHeader>
                <TableBody
                  loadingContent={
                    <div className="w-full h-full flex flex-row justify-center items-center bg-slate-600 opacity-50">
                      <Spinner size="lg" />
                    </div>
                  }
                  emptyContent="등록된 부서가 없습니다."
                >
                  {Object.values(addedAuthDeps).map((department) => (
                    <TableRow key={department.department_id}>
                      <TableCell>{department.department_name}</TableCell>
                      <TableCell>
                        <Dropdown>
                          <DropdownTrigger className="cursor-pointer">
                            {department.Auth}
                          </DropdownTrigger>
                          <DropdownMenu>
                            <DropdownItem
                              onPress={() => {
                                if (department.Auth !== "Read&Write") {
                                  dispatch(
                                    updateDepartmentAuth({
                                      departmentId: department.department_id,
                                      auth: "Read&Write",
                                    })
                                  );
                                }
                              }}
                              key="change WR"
                            >
                              권환을 W/R로 변경
                            </DropdownItem>
                            <DropdownItem
                              onPress={() => {
                                if (department.Auth !== "Read&Write") {
                                  dispatch(
                                    updateDepartmentAuth({
                                      departmentId: department.department_id,
                                      auth: "Read&Write",
                                    })
                                  );
                                }
                              }}
                              key="change RO"
                            >
                              권환을 RO로 변경
                            </DropdownItem>
                            <DropdownItem
                              onPress={() => {
                                dispatch(
                                  removeDepartment(department.department_id)
                                );
                              }}
                              key="delete"
                            >
                              목록 삭제
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>

            <section className="w-1/2 flex flex-col">
              <h3 className="text-[14px] text-center mb-2">인원 목록</h3>
              <Table
                classNames={{
                  base: "w-full",
                  table: "w-full",
                }}
                selectionMode="none"
                aria-label="선택된 사용자 목록"
              >
                <TableHeader>
                  <TableColumn>유저 이름</TableColumn>
                  <TableColumn>이메일</TableColumn>
                  <TableColumn>권한</TableColumn>
                </TableHeader>
                <TableBody
                  loadingContent={
                    <div className="w-full h-full flex flex-row justify-center items-center bg-slate-600 opacity-50">
                      <Spinner size="lg" />
                    </div>
                  }
                  emptyContent="등록된 인원이 없습니다."
                >
                  {Object.values(addedAuthUsers).map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Dropdown>
                          <DropdownTrigger className="cursor-pointer">
                            {user.Auth}
                          </DropdownTrigger>
                          <DropdownMenu>
                            <DropdownItem
                              onPress={() => {
                                if (user.Auth !== "Read&Write") {
                                  dispatch(
                                    updateUserAuth({
                                      userId: user.user_id,
                                      auth: "Read&Write",
                                    })
                                  );
                                }
                              }}
                              key="change WR"
                            >
                              권환을 W/R로 변경
                            </DropdownItem>
                            <DropdownItem
                              onPress={() => {
                                if (user.Auth !== "ReadOnly") {
                                  dispatch(
                                    updateUserAuth({
                                      userId: user.user_id,
                                      auth: "ReadOnly",
                                    })
                                  );
                                }
                              }}
                              key="change RO"
                            >
                              권환을 RO로 변경
                            </DropdownItem>
                            <DropdownItem
                              onPress={() => {
                                dispatch(removeUser(user.user_id));
                              }}
                              key="delete"
                            >
                              목록 삭제
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
          </div>
          <AddAuthUser
            isOpen={isOpenUserModal}
            onClose={() => setIsOpenUserModal(false)}
          />
          <AddAuthDeps
            isOpen={isOpenDepModal}
            onClose={() => setIsOpenDepModal(false)}
          />
        </div>
      )}
      <ButtonFooter
        beforeButtonText="이전"
        beforeButtonFunction={() => {
          handleMove(2);
        }}
        nextButtonText="다음"
        nextButtonFunction={() => {
          handleMove(4);
        }}
      />
    </div>
  );
}
