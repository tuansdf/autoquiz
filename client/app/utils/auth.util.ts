import { refreshToken } from "@/api/auth.api.js";
import type { LoginResponse, User } from "@/type/auth.type.js";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import { jwtDecode, type JwtPayload } from "jwt-decode";

const EXPIRED_SECONDS_OFFSET = 10;

export const handleLoginSuccess = (result: LoginResponse, navigateFn?: (url: string) => any) => {
  localStorage.setItem("access_token", result.data?.accessToken || "");
  if (result.data?.refreshToken) {
    localStorage.setItem("refresh_token", result.data?.refreshToken || "");
  }
  if (navigateFn) {
    notifications.show({
      message: "Signed in successfully",
      withCloseButton: true,
      style: { whiteSpace: "pre-line" },
    });
    navigateFn("/");
  }
};

export const handleLogout = (navigateFn?: (url: string) => any) => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  if (navigateFn) {
    navigateFn("/auth");
  } else {
    window.location.replace("/auth");
  }
};

interface AuthJwtPayload extends JwtPayload {
  userId?: string;
  username?: string;
  admin?: boolean;
}

export const getSession = (): User | null => {
  const decoded = decodeAccessToken();
  if (!decoded) return null;
  return {
    userId: decoded.sub,
    username: decoded.username,
    isAdmin: Boolean(decoded.admin),
  };
};

export const isAuth = (): boolean => {
  const decoded = decodeRefreshToken();
  if (!decoded) return false;
  return !(dayjs().unix() > (decoded.exp || 0));
};

export const decodeAccessToken = (): AuthJwtPayload | null => {
  const token = getAccessToken();
  if (!token) return null;
  return jwtDecode<AuthJwtPayload>(token);
};

export const decodeRefreshToken = (): AuthJwtPayload | null => {
  const token = getRefreshToken();
  if (!token) return null;
  return jwtDecode<AuthJwtPayload>(token);
};

export const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

export const getRefreshToken = () => {
  return localStorage.getItem("refresh_token");
};

let accessTokenPromise: Promise<string | null | undefined> | undefined = undefined;

export const getValidAccessToken = async (): Promise<string | null | undefined> => {
  if (!accessTokenPromise) {
    accessTokenPromise = executeGetValidAccessToken().finally(() => (accessTokenPromise = undefined));
  }
  return accessTokenPromise;
};

export const executeGetValidAccessToken = async (): Promise<string | null | undefined> => {
  const accessToken = decodeAccessToken();
  if (!accessToken) {
    return null;
  }
  const expired = dayjs().unix() > (accessToken?.exp || 0) - EXPIRED_SECONDS_OFFSET;
  if (!expired) {
    return getAccessToken();
  }
  const refreshJwt = getRefreshToken();
  if (!refreshJwt) {
    return null;
  }
  const result = await refreshToken({ token: refreshJwt });
  handleLoginSuccess(result);
  return result.data?.accessToken;
};
