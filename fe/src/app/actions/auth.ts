"use server";

import { cookies } from "next/headers";

import { LoginResponseType, RefreshResponseType, UserType } from "@/types/auth";
import {
  accessTokenDuration,
  refreshTokenDuration,
} from "@/lib/constants/token-duration";
import { DefaultResponseType } from "@/types/default";
import { customFetch } from "./customFetch";

export const check_auth = async (formData: FormData) => {
  console.log("check_auth");
  const email = formData.get("email");
  const password = formData.get("password");
  if (!email || !password) {
    return {
      status: 400,
      error: "Email and password are required",
    };
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
      {
        credentials: "same-origin",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      }
    );

    if (!response || !response.ok || response.status >= 400) {
      console.log("login fail here ---- ");
      console.log(response);
      return {
        error: "유효하지 않는 이메일 또는 비밀번호입니다.",
        status: 401,
      };
    }

    const data: DefaultResponseType<LoginResponseType> = await response.json();

    if (!data?.data || !data.data.access_token) {
      console.log("login fail");
      return {
        error: "Invalid",
        status: 400,
      };
    }

    console.log("login success = ", data.data?.access_token);
    const cookieStore = await cookies();

    cookieStore.set({
      name: "refreshToken",
      value: data.data.refresh_token,
      httpOnly: true,
      path: "/",
      maxAge: refreshTokenDuration,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    cookieStore.set({
      name: "accessToken",
      value: data.data.access_token,
      httpOnly: true,
      path: "/",
      maxAge: accessTokenDuration,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    console.log();

    return {
      status: response.status,
      data: {
        UserData: data.data.user,
      },
    };
  } catch (error) {
    console.error("Login failed:", error);
    return {
      error: "Something went wrong",
      status: 500,
    };
  }
};

// 쿠키에 담긴 accessToken을 이용하여 사용자의 인증 상태를 확인
// accessToken이 유효하면 true, 그렇지 않으면 false를 반환 (없는 경우도 고려)
export const verifyAccessToken = async (accessToken: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/profile`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );
    if (!response.ok) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
};

// 쿠키에 담긴 refreshToken을 이용하여 새로운 accessToken을 발급
// 새로운 accessToken을 반환하며, refreshToken이 유효하지 않은 경우 null을 반환
// refreshToken이 유효하지 않은 경우, 쿠키에서 refreshToken과 accessToken을 삭제
// 새로운 accessToken을 발급받은 경우, 쿠키에 새로운 accessToken과 refreshToken을 저장
export const refreshAccessToken = async (
  refreshAccessToken: string
): Promise<string | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`,
      {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshAccessToken}`,
        },
      }
    );

    const data: DefaultResponseType<RefreshResponseType> =
      await response.json();
    console.log("Refresh 결과", data.data);

    if (!data?.data) {
      cookies().delete("refreshToken");
      cookies().delete("accessToken");
      throw new Error("Failed to refresh token");
    }

    cookies().set({
      name: "refreshToken",
      value: data.data.refresh_token,
      httpOnly: true,
      path: "/",
      maxAge: refreshTokenDuration,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    cookies().set({
      name: "accessToken",
      value: data.data.access_token,
      httpOnly: true,
      path: "/",
      maxAge: accessTokenDuration,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return data.data.access_token;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
};

export const logout = async () => {
  try {
    cookies().delete("refreshToken");
    const accessToken = cookies().get("accessToken");

    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken?.value}`,
      },
      cache: "no-store",
    });
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    cookies().delete("refreshToken");
    cookies().delete("accessToken");
    return null;
  }
};

// 쿠키에 담긴 accessToken을 이용하여 사용자의 인증 상태를 확인
// accessToken이 유효하면 true, 그렇지 않으면 false를 반환 (없는 경우도 고려)
export const getUserProfile = async () => {
  try {
    const response = await customFetch<DefaultResponseType<UserType>>({
      endpoint: "/user/profile",
      method: "GET",
    });

    if (!response.data) {
      return {
        status: response.status,
        error: response.error || "Failed to fetch profile",
      };
    } else {
      return {
        status: response.status,
        data: response.data,
      };
    }
  } catch (error) {
    console.error("Token verification failed:", error);
    return {
      status: 500,
      error: "Failed to fetch profile",
    };
  }
};

export const getAccessToken = async () => {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken");
  const refreshToken = cookieStore.get("refreshToken");

  if (accessToken) {
    return accessToken.value;
  } else {
    if (refreshToken) {
      const result = await refreshAccessToken(refreshToken.value);
      return result;
    } else {
      return null;
    }
  }
};
