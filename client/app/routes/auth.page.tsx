import { login, register } from "@/api/auth.api.js";
import { getAuth, handleLoginSuccess } from "@/utils/auth.util.js";
import { handleHttpError } from "@/utils/common.util.js";
import {
  Anchor,
  Button,
  Container,
  Flex,
  LoadingOverlay,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router";

export const meta = () => {
  return [{ title: "Sign In" }];
};

type FormValues = {
  username: string;
  password: string;
};

export default function AuthPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const formMethods = useForm<FormValues>();

  if (getAuth()) {
    return <Navigate to="/" />;
  }

  const handleSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setIsLoading(true);
      const result = isSignUp ? await register(data) : await login(data);
      handleLoginSuccess(result, navigate);
    } catch (e) {
      handleHttpError(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex pos="relative" h="100svh" justify="center" align="center">
      <LoadingOverlay visible={isLoading} />

      <Container size={420} w="100%">
        <Title ta="center" fz={40}>
          Welcome back!
        </Title>

        {isSignUp ? (
          <Text ta="center" fz="sm">
            Have an account?{" "}
            <Anchor component="span" role="button" onClick={() => setIsSignUp(false)} fz="sm">
              Sign in
            </Anchor>
          </Text>
        ) : (
          <Text ta="center" fz="sm">
            Do not have an account yet?{" "}
            <Anchor component="span" role="button" onClick={() => setIsSignUp(true)} fz="sm">
              Sign up
            </Anchor>
          </Text>
        )}

        <Paper
          component="form"
          withBorder
          shadow="sm"
          p={24}
          mt="xl"
          radius="md"
          onSubmit={formMethods.handleSubmit(handleSubmit)}
        >
          <TextInput
            label="Username"
            placeholder="Your username"
            required
            radius="md"
            {...formMethods.register("username")}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            radius="md"
            {...formMethods.register("password")}
          />
          <Button fullWidth mt="xl" radius="md" type="submit">
            Sign in
          </Button>
        </Paper>
      </Container>
    </Flex>
  );
}
