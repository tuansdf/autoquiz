import { App } from "antd";
import type { PropsWithChildren } from "react";

export const AntdProvider = (props: PropsWithChildren) => {
  return <App>{props.children}</App>;
};
