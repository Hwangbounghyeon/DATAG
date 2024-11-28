import { cookies } from "next/headers";

export const getAccessToken = () => {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken");

  return accessToken
}