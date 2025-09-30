import { createTheme, MantineProvider as AMantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import type { PropsWithChildren } from "react";

const theme = createTheme({});

export const MantineProvider = (props: PropsWithChildren) => {
  return (
    <AMantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications />
      {props.children}
    </AMantineProvider>
  );
};
