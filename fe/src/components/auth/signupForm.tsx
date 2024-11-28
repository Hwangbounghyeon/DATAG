"use client";

import { DepartmentType } from "@/types/departmentType";
import { Button, Checkbox, Input, Select, SelectItem } from "@nextui-org/react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { useState } from "react";

const inputStyles = {
  input: ["bg-transparent"],
  errorMessage: [
    "font-bold",
    "text-[13px]",
    "dark:text-red-200", // 다크모드에서 에러 메시지 색상도 조정
  ],
};

type SignFormDataType = {
  name: string;
  email: string;
  password: string;
  duty: string;
  location: string;
  department_id: number;
  is_supervised: boolean;
};

interface SignFormProps {
  department_list: DepartmentType[];
}

export const SignForm = ({ department_list }: SignFormProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure(); // Modal창
  const [verificationCode, setVerificationCode] = useState(""); // 인증 코드
  const [isVerifying, setIsVerifying] = useState(false); //인증 시도 중인가?
  const [failVerifying, setFailVerifying] = useState(false); //인증 실패
  const [userEmail, setUserEmail] = useState(""); // Store email for verification
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignFormDataType>({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      duty: "",
      location: "",
      department_id: 0,
      is_supervised: false,
    },
  });

  // 제출 로직
  const onSubmit = async (data: SignFormDataType) => {
    data = {
      ...data,
      department_id: Number(data.department_id),
      location: data.location.trim(),
      duty: data.duty.trim(),
      name: data.name.trim(),
    };

    try {
      // Assuming this is your API call to register user
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        setUserEmail(data.email);
        onOpen(); // 성공인 경우
      } else {
        throw Error("response", {
          cause: response,
        });
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  // 이메일 인증 로직
  const handleVerificationSubmit = async () => {
    setIsVerifying(true);
    setFailVerifying(false);
    try {
      const queryString = new URLSearchParams({
        email: userEmail,
        code: verificationCode,
      }).toString();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verification?${queryString}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        onClose();
        // Handle successful verification (e.g., redirect or show success message)
        router.push("/login");
      } else {
        setFailVerifying(true);
        throw Error("response", {
          cause: response,
        });
      }
    } catch (error) {
      console.error("Verification failed:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 min-h-[500px] space-y-6"
      >
        <div className="space-y-4 rounded-md">
          <Controller
            name="name"
            control={control}
            rules={{
              required: "이름은 필수입니다",
              pattern: {
                value: /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z\s]+$/,
                message: "한글 또는 영문만 입력 가능합니다",
              },
              validate: {
                noTrim: (value) =>
                  value.trim() === value || "앞뒤 공백은 허용되지 않습니다",
                noDoubleSpace: (value) =>
                  !value.includes("  ") || "연속된 공백은 허용되지 않습니다",
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                disabled={isOpen}
                radius="sm"
                type="text"
                label="name"
                isInvalid={!!errors.name}
                errorMessage={errors.name?.message}
                classNames={inputStyles}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            rules={{
              required: "이메일은 필수입니다",
              pattern: {
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "올바른 이메일 형식이 아닙니다",
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                radius="sm"
                disabled={isOpen}
                type="email"
                label="email"
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
                classNames={inputStyles}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{
              required: "비밀번호는 필수입니다",
              minLength: {
                value: 8,
                message:
                  "비밀번호는 최소 8자리 이상의 한글과 알파벳 조합이어야 합니다.",
              },
              pattern: {
                value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                message: "비밀번호는 알파벳과 숫자만 혼합하여 입력해주세요",
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                disabled={isOpen}
                radius="sm"
                type="password"
                label="password"
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
                classNames={inputStyles}
              />
            )}
          />

          <Controller
            name="duty"
            control={control}
            rules={{
              required: "직무는 필수입니다",
              maxLength: {
                value: 50,
                message: "직무는 최대 50글자까지 입력 가능합니다",
              },
              pattern: {
                value: /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z\s]+$/,
                message: "한글 또는 영문만 입력 가능합니다",
              },
              validate: {
                noTrim: (value) =>
                  value.trim() === value || "앞뒤 공백은 허용되지 않습니다",
                noDoubleSpace: (value) =>
                  !value.includes("  ") || "연속된 공백은 허용되지 않습니다",
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                disabled={isOpen}
                radius="sm"
                type="text"
                label="duty"
                isInvalid={!!errors.duty}
                errorMessage={errors.duty?.message}
                classNames={inputStyles}
              />
            )}
          />

          <Controller
            name="location"
            control={control}
            rules={{
              required: "위치 입력은 필수입니다",
              maxLength: {
                value: 50,
                message: "위치는 최대 50글자까지 입력 가능합니다",
              },
              pattern: {
                value: /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z\s]+$/,
                message: "한글 또는 영문만 입력 가능합니다",
              },
              validate: {
                noTrim: (value) =>
                  value.trim() === value || "앞뒤 공백은 허용되지 않습니다",
                noDoubleSpace: (value) =>
                  !value.includes("  ") || "연속된 공백은 허용되지 않습니다",
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                disabled={isOpen}
                radius="sm"
                type="text"
                label="location"
                isInvalid={!!errors.location}
                errorMessage={errors.location?.message}
                classNames={inputStyles}
              />
            )}
          />

          <Controller
            name="department_id"
            control={control}
            rules={{ required: "부서 선택은 필수입니다" }}
            render={({ field }) => (
              <Select
                {...field}
                disabled={isOpen}
                label="department"
                isInvalid={!!errors.department_id}
                errorMessage={errors.department_id?.message}
                classNames={inputStyles}
              >
                {department_list.map((department) => (
                  <SelectItem
                    key={department.department_id}
                    value={department.department_id}
                  >
                    {department.department_name}
                  </SelectItem>
                ))}
              </Select>
            )}
          />

          <Controller
            name="is_supervised"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Checkbox
                isSelected={value}
                disabled={isOpen}
                onValueChange={onChange}
                color="secondary"
                classNames={{
                  label: "text-sm",
                }}
              >
                관리자 권한
              </Checkbox>
            )}
          />
        </div>

        <Button
          isLoading={isSubmitting}
          type="submit"
          className="w-full text-white bg-purple-600 font-bold"
        >
          Verifying Email
        </Button>
      </form>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isDismissable={false}
        placement="center"
        classNames={{
          base: "dark:bg-[#19172c] bg-white",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">이메일 인증</ModalHeader>
          <ModalBody>
            <p className="text-sm text-gray-500">
              {userEmail}로 전송된 인증 코드를 입력해주세요.
            </p>
            <Input
              readOnly={isVerifying}
              isInvalid={failVerifying}
              autoFocus
              label="인증 코드"
              placeholder="인증 코드 입력하세요"
              variant="bordered"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              classNames={inputStyles}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              취소
            </Button>
            <Button
              color="primary"
              onPress={handleVerificationSubmit}
              isLoading={isVerifying}
            >
              확인
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SignForm;
