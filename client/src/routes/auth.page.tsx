import { exchangeToken } from "@/api/auth.api.js";
import { ENV_SERVER_BASE_URL } from "@/env.js";
import { handleLoginSuccess, isAuth } from "@/utils/auth.util.js";
import { handleHttpError } from "@/utils/common.util.js";
import { Button, Flex, Title } from "@mantine/core";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  if (isAuth()) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async () => {
    window.open(`${ENV_SERVER_BASE_URL || ""}/api/oauth/google`, "_self");
  };

  const handleExchangeCode = async (code: string) => {
    try {
      const response = await exchangeToken({ token: code });
      handleLoginSuccess(response, navigate);
    } catch (e) {
      await handleHttpError(e);
    }
  };

  const code = searchParams.get("code");
  useEffect(() => {
    if (!code) return;
    handleExchangeCode(code);
  }, [code]);

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
