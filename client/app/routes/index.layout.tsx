import { getAuth } from "@/utils/auth.util.js";
import { Button, Flex, Text } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import React from "react";
import { Link, Navigate, Outlet, useNavigate } from "react-router";

export default function IndexLayout() {
  const auth = getAuth();
  const navigate = useNavigate();

  if (!auth) {
    return <Navigate to="/auth" />;
  }

  return (
    <div>
      <Flex p={20} justify="space-between">
        <Text
          component={Link}
          to="/"
          fw="bolder"
          size="xl"
          variant="gradient"
          gradient={{ from: "blue", to: "cyan", deg: 90 }}
        >
          AutoQuiz
        </Text>
        <Button leftSection={<IconLogout size={14} />} variant="default" onClick={() => navigate("/auth")}>
          Sign out
        </Button>
      </Flex>
      <Outlet />
    </div>
  );
}
