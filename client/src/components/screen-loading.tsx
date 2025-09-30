import { Box, LoadingOverlay } from "@mantine/core";

export const ScreenLoading = (props: { visible?: boolean }) => {
  if (!props.visible) return null;

  return (
    <Box pos="fixed" inset={0} h="100svh">
      <LoadingOverlay visible />
    </Box>
  );
};
