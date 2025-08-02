import type { LoginResponse, User } from "@/type/auth.type.js";
import { notifications } from "@mantine/notifications";
import { jwtDecode, type JwtPayload } from "jwt-decode";

export const handleLoginSuccess = (result: LoginResponse, navigateFn?: (url: string) => any) => {
  localStorage.setItem("access_token", result.data?.accessToken || "");
  localStorage.setItem("refresh_token", result.data?.refreshToken || "");
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
  navigateFn?.("/auth");
};

interface AuthJwtPayload extends JwtPayload {
  userId?: string;
  username?: string;
  admin?: boolean;
}

export const getAuth = (): User | null => {
  const decoded = decodeAccessToken();
  if (!decoded) return null;
  return {
    userId: decoded.sub,
    username: decoded.username,
    isAdmin: Boolean(decoded.admin),
  };
};

export const decodeAccessToken = (): AuthJwtPayload | null => {
  const token = getAccessToken();
  if (!token) return null;
  return jwtDecode<AuthJwtPayload>(token);
};

export const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

export const getRefreshToken = () => {
  return localStorage.getItem("refresh_token");
};
