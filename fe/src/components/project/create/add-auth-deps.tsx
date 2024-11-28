import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import { DepartmentType } from "@/types/departmentType";
import { useDispatch, useSelector } from "react-redux";
import { CreateProjectAppDispatch, CreateProjectState } from "@/store/store";
import { getDepartments } from "@/app/actions/depatment";
import { addDepartment } from "@/store/create-store";

interface AddAuthDpts {
  isOpen: boolean; // 모달 열린 상태인가?
  onClose: () => void; // 모달 닫는 함수
}

const ItemsPerPage = 5; // 한 페이지에 보여줄 아이템 수

const AddAuthDeps = ({ isOpen, onClose }: AddAuthDpts) => {
  const dispatch = useDispatch<CreateProjectAppDispatch>(); // redux dispatch
  const [isLoading, setIsLoading] = useState(false); // 로딩 중인가?
  const [nowPgae, setNowPage] = useState(1); // 현재 페이지
  const [totalPage, setTotalPage] = useState(1); // 총 페이지
  const [errorMessage, setErrorMessage] = useState(""); // 에러 메시지
  const [pageDpts, setPageDpts] = useState<DepartmentType[]>([]); // 현재 페이지의 유저 목록
  const [willSelectedDeps, setWillSelectedDeps] = useState<DepartmentType[]>(
    []
  ); // 추가할 선택된 부서 목록

  const selectedDeps = useSelector(
    (state: CreateProjectState) => state.project.accesscontrol.departments
  ); // 선택된 부서 목록

  const fetchDpts = useCallback(async () => {
    // 서버에서 부서 목록을 가져오는 함수
    const result = await getDepartments();
    if (!result.data) {
      setErrorMessage("목록을 가져오는데 실패했습니다.");
      setPageDpts([]);
    } else {
      setTotalPage(Math.min(Math.ceil(result.data.length / ItemsPerPage), 1));
      setPageDpts(result.data);
    }
  }, []);

  const handleSelectUser = (dpts: DepartmentType) => {
    // 유저를 선택하는 함수
    if (willSelectedDeps.includes(dpts)) {
      setWillSelectedDeps(willSelectedDeps.filter((u) => u !== dpts));
    } else {
      setWillSelectedDeps([...willSelectedDeps, dpts]);
    }
  };

  const handleAddDpts = () => {
    willSelectedDeps.forEach((dpts) => {
      dispatch(
        addDepartment({
          ...dpts,
          Auth: "ReadOnly",
        })
      );
    });
    onClose();
  };

  useEffect(() => {
    setIsLoading(true);
    if (isOpen) {
      setErrorMessage("");
      setNowPage(1);
      setTotalPage(1);
      setPageDpts([]);
      setWillSelectedDeps([]);
      fetchDpts().then(() => setIsLoading(false));
    }
  }, [isOpen]);

  return (
    <Modal
      className="w-[90%] min-w-[600px] max-h-[610px]"
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalContent className="w-full">
        <ModalHeader className="flex flex-col">
          <h2 className="text-xl font-bold">추가할 부서를 넣어주세요</h2>
          <p> {willSelectedDeps.length}개 부서가 선택됨</p>
        </ModalHeader>
        <ModalBody className="w-full flex flex-col items-center">
          <Table
            selectionMode="none"
            aria-label="부서 목록"
            classNames={{
              base: "min-w-[400px] max-h-[300px] ",
            }}
          >
            <TableHeader>
              <TableColumn>부서명</TableColumn>
              <TableColumn>선택</TableColumn>
            </TableHeader>

            <TableBody
              isLoading={isLoading}
              loadingContent={
                <div className="w-full h-full flex flex-row justify-center items-center bg-slate-600 opacity-50">
                  <Spinner size="lg" />
                </div>
              }
              emptyContent={
                <div>
                  {errorMessage ? (
                    <div>{errorMessage}</div>
                  ) : (
                    <div>데이터가 없습니다.</div>
                  )}
                </div>
              }
            >
              {pageDpts.map((department) => (
                <TableRow key={department.department_id}>
                  <TableCell>{department.department_name}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => {
                        handleSelectUser(department);
                      }}
                      size="sm"
                      disabled={!!selectedDeps[department.department_id]}
                      color={
                        willSelectedDeps.includes(department)
                          ? "secondary"
                          : "primary"
                      }
                    >
                      {!!selectedDeps[department.department_id]
                        ? "추가됨"
                        : willSelectedDeps.includes(department)
                        ? "목록 제거"
                        : "목록 추가"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            isDisabled={isLoading || errorMessage !== ""}
            onChange={setNowPage}
            showControls
            total={totalPage}
            initialPage={nowPgae}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            취소
          </Button>
          <Button
            onClick={() => {
              handleAddDpts();
            }}
            disabled={
              willSelectedDeps.length === 0 || errorMessage !== "" || isLoading
            }
            color="primary"
          >
            반영
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddAuthDeps;
