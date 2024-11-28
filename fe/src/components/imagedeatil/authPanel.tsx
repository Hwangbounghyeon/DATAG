import React from "react";
import { BiPlus } from "react-icons/bi";
import { MdOutlineClear } from "react-icons/md";
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    useDisclosure,
} from "@nextui-org/react";
import { AuthUser } from "@/types/auth";
import AuthDeptModal from "./modal/authDeptModal";
import AuthUserModal from "./modal/authUserModal";

interface AuthorityPanelProps {
    userAuthorities: AuthUser[];
    departmentAuthorities: string[];
    onUserAuthorityAdd: (userIds: number[]) => void;
    onUserAuthorityRemove: (userId: number) => void;
    onDepartmentAuthorityAdd: (departmentNames: string[]) => void;
    onDepartmentAuthorityRemove: (departmentName: string) => void;
}

function AuthPanel({
    userAuthorities,
    departmentAuthorities,
    onUserAuthorityAdd,
    onUserAuthorityRemove,
    onDepartmentAuthorityAdd,
    onDepartmentAuthorityRemove,
}: AuthorityPanelProps) {
    const {
        isOpen: isUserModalOpen,
        onOpen: onUserModalOpen,
        onClose: onUserModalClose,
    } = useDisclosure();
    const {
        isOpen: isDeptModalOpen,
        onOpen: onDeptModalOpen,
        onClose: onDeptModalClose,
    } = useDisclosure();

    return (
        <div className="h-full flex flex-col">
            <div className="flex p-2 pb-2 justify-between items-center">
                <h2 className="text-lg font-semibold">AUTHORITY</h2>
                <Dropdown>
                    <DropdownTrigger>
                        <div className="cursor-pointer flex items-center text-blue-500 hover:text-blue-600">
                            <BiPlus className="h-5 w-5" />
                        </div>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Authority Actions">
                        <DropdownItem
                            key="department"
                            onClick={onDeptModalOpen}
                            className="text-sm"
                        >
                            부서 권한 추가하기
                        </DropdownItem>
                        <DropdownItem
                            key="user"
                            onClick={onUserModalOpen}
                            className="text-sm"
                        >
                            유저 권한 추가하기
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-1 py-1">
                <div className="flex flex-col gap-2">
                    {departmentAuthorities.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <div className="text-sm font-semibold">
                                부서 권한
                            </div>
                            {departmentAuthorities.map((deptName) => (
                                <div
                                    key={`dept-${deptName}`}
                                    className="flex items-center justify-between ps-3 py-1 rounded-full border border-blue-400"
                                >
                                    <span className="text-sm text-blue-400">
                                        {deptName}
                                    </span>
                                    <button
                                        onClick={() =>
                                            onDepartmentAuthorityRemove(
                                                deptName
                                            )
                                        }
                                        className="text-blue-400 hover:text-blue-300"
                                    >
                                        <MdOutlineClear />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {userAuthorities.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <div className="text-sm font-semibold">
                                유저 권한
                            </div>
                            {userAuthorities.map((authority) => (
                                <div
                                    key={`user-${authority.user_id}`}
                                    className="flex items-center justify-between ps-3 py-1 rounded-full border border-blue-400"
                                >
                                    <span className="text-sm text-blue-400">
                                        {authority.user_name} /{" "}
                                        {authority.department_name}
                                    </span>
                                    <button
                                        onClick={() =>
                                            onUserAuthorityRemove(
                                                authority.user_id
                                            )
                                        }
                                        className="text-blue-400 hover:text-blue-300"
                                    >
                                        <MdOutlineClear />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <AuthDeptModal
                isOpen={isDeptModalOpen}
                onClose={onDeptModalClose}
                onAdd={onDepartmentAuthorityAdd}
                existingAuthorities={userAuthorities}
            />
            <AuthUserModal
                isOpen={isUserModalOpen}
                onClose={onUserModalClose}
                onAdd={onUserAuthorityAdd}
                existingAuthorities={userAuthorities}
            />
        </div>
    );
}

export default AuthPanel;
