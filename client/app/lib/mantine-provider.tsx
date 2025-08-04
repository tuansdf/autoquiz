import { createTheme, MantineProvider as AMantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import type { PropsWithChildren } from "react";

const theme = createTheme({
  black: "#171717",
});

export const MantineProvider = (props: PropsWithChildren) => {
  return (
    <AMantineProvider theme={theme}>
      <Notifications />
      {props.children}
    </AMantineProvider>
  );
};
