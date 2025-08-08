import { getSession, handleLogout, isAuth } from "@/utils/auth.util.js";
import { Box, Button, Flex, Text } from "@mantine/core";
import { IconLogin, IconLogout } from "@tabler/icons-react";
import React, { type PropsWithChildren } from "react";
import { Link, useNavigate } from "react-router";

export const CommonLayout = (props: PropsWithChildren) => {
  const navigate = useNavigate();

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
        <Flex align="center" gap="md">
          {!!getSession()?.isAdmin && (
            <Text component={Link} to="/configs" size="sm">
              Configs
            </Text>
          )}
          {isAuth() ? (
            <Button leftSection={<IconLogout size={14} />} variant="default" onClick={() => handleLogout(navigate)}>
              Sign out
            </Button>
          ) : (
            <Button component={Link} to="/auth" leftSection={<IconLogin size={14} />} variant="default">
              Sign in
            </Button>
          )}
        </Flex>
      </Flex>
      <Box maw={800} mx="auto" pb="xl" px="lg">
        {props.children}
      </Box>
    </>
  );
};
