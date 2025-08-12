import type { LoginResponse } from "@/type/auth.type.js";
import { handleLoginSuccess, isAuth } from "@/utils/auth.util.js";
import { Button, Flex, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { useRef } from "react";
import { Navigate, useNavigate } from "react-router";

export default function AuthPage() {
  const loginRef = useRef<any>(null);
  const navigate = useNavigate();

  if (isAuth()) {
    return <Navigate to="/" replace />;
  }

  const handleLoginMessage = (popup?: Window | null) => (event: MessageEvent) => {
    if (event.origin !== import.meta.env.VITE_SERVER_BASE_URL) {
      return;
    }
    if (popup) {
      popup.close();
    }
    const response = event.data as LoginResponse;
    if (!response.data) {
      notifications.show({
        message: response.message || "Something Went Wrong",
        withCloseButton: true,
        color: "red",
        style: { whiteSpace: "pre-line" },
      });
      return;
    }
    handleLoginSuccess(response, navigate);
  };

  const handleLogin = async () => {
    window.removeEventListener("message", loginRef.current);
    const popup = window.open(`${import.meta.env.VITE_SERVER_BASE_URL}/api/auth/google`, "_blank");
    if (!popup) {
      notifications.show({
        message: "Please enable pop-ups to continue",
        withCloseButton: true,
        color: "red",
        style: { whiteSpace: "pre-line" },
      });
      return;
    }
    loginRef.current = handleLoginMessage(popup);
    window.addEventListener("message", loginRef.current, { once: true });
  };

  return (
    <>
      <title>Sign In</title>
      <Flex pos="relative" h="100svh" justify="center" align="center">
        <Flex maw={420} w="100%" align="center" justify="center" direction="column">
          <Title ta="center" fz={28}>
            Welcome back!
          </Title>

          <Button
            size="md"
            mt="md"
            variant="outline"
            radius="md"
            onClick={handleLogin}
            leftSection={<IconBrandGoogleFilled />}
          >
            Sign in with Google
          </Button>
        </Flex>
      </Flex>
    </>
  );
}
