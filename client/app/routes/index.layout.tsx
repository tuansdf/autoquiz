import { BookOutlined, MenuFoldOutlined, MenuOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router";

const { Header, Sider, Content } = Layout;

export default function IndexLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100%" }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div />
        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={[
            {
              key: "1",
              icon: <BookOutlined />,
              label: "Quizzes",
              onClick: () => navigate("/"),
            },
            {
              key: "2",
              icon: <UserOutlined />,
              label: "Users",
              onClick: () => navigate("/users"),
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            size="large"
            icon={collapsed ? <MenuOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ margin: "0.75rem" }}
          />
        </Header>
        <Content
          style={{
            margin: "1.25rem",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
