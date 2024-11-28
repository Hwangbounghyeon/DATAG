"use client";

import { Button, Input } from "@nextui-org/react";
import { check_auth } from "@/app/actions/auth";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { DefaultResponseType } from "@/types/default";
import { UserType } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useUserDispatch } from "@/hooks/userProfileHook/index";
import { fetchUserProfile } from "@/store/user";

type LoginFormValues = {
  email: string;
  password: string;
};

interface LoginResult {
  UserData: UserType;
}

export const LoginForm = () => {
  const dispatch = useUserDispatch();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const router = useRouter();
  useEffect(() => {
    // mount 될 때 처리하도록
    router.prefetch("/project");
  }, [router]);
  const [errorMessage, SetErrorMessage] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormValues) => {
    SetErrorMessage(null);
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    const response: DefaultResponseType<LoginResult> = await check_auth(
      formData
    );

    if (response.error || !response.data || response.error) {
      console.log(response.error);
      SetErrorMessage(response.error || "An error occurred");
    } else {
      // 로그인 성공 후 프로필 정보 가져오기
      await dispatch(fetchUserProfile());
      router.push("/project");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      <div className="space-y-4 rounded-md">
        <Input
          {...register("email")}
          radius="sm"
          type="email"
          label="name"
          placeholder="Enter your name"
        />
        <Input
          {...register("password")}
          radius="sm"
          type="password"
          label="password"
          placeholder="Enter your password"
        />
      </div>

      <Button
        disabled={isSubmitting}
        isLoading={isSubmitting}
        type="submit"
        className="w-full bg-purple-600 font-bold"
      >
        {isSubmitting ? "Loading..." : "Login"}
      </Button>
      <footer>
        {errorMessage && (
          <div className="text-red-500 text-center font-bold">
            {errorMessage}
          </div>
        )}
      </footer>
    </form>
  );
};

export default LoginForm;
