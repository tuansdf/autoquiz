import { App, ConfigProvider } from "antd";
import type { PropsWithChildren } from "react";

export const AntdProvider = (props: PropsWithChildren) => {
  return (
    <ConfigProvider>
      <App>{props.children}</App>
    </ConfigProvider>
  );
};