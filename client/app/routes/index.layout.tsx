import { getAuth, handleLogout } from "@/utils/auth.util.js";
import { Box, Button, Flex, Text } from "@mantine/core";
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
    <>
      <Flex p="lg" justify="space-between">
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
        <Button leftSection={<IconLogout size={14} />} variant="default" onClick={() => handleLogout(navigate)}>
          Sign out
        </Button>
      </Flex>
      <Box maw={800} mx="auto" pb="xl">
        <Outlet />
      </Box>
    </>
  );
}
