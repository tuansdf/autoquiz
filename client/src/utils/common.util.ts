import { notifications } from "@mantine/notifications";
import { HTTPError } from "ky";

export const handleHttpError = async (e: any) => {
  if (e instanceof HTTPError) {
    notifications.show({
      message: (await e.response.json()).message,
      withCloseButton: true,
      color: "red",
      style: { whiteSpace: "pre-line" },
    });
  } else {
    notifications.show({
      message: "Something Went Wrong",
      withCloseButton: true,
      color: "red",
      style: { whiteSpace: "pre-line" },
    });
  }
};
