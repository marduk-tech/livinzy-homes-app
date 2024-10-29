import { Flex, Image, Layout } from "antd";
import React from "react";
import { Link, Outlet } from "react-router-dom";
import { CustomErrorBoundary } from "../components/common/custom-error-boundary";
import { UserDropDown } from "../components/common/user-dropdown";
import { LoginForm } from "../components/login-form";
import { useDevice } from "../hooks/use-device";
import { useUser } from "../hooks/use-user";

const { Header, Content } = Layout;

export const DashboardLayout: React.FC = () => {
  const { isMobile } = useDevice();

  const { user, isLoading, isError } = useUser();

  return (
    <CustomErrorBoundary>
      <Layout style={{ minHeight: "100vh", backgroundColor: "transparent" }}>
        <Layout style={{ backgroundColor: "transparent" }}>
          <Header
            style={{
              padding: isMobile ? 8 : "8px 24px",
              background: "transparent",
            }}
          >
            <Flex align="center" justify="space-between">
              <Link to="/">
                <Image
                  preview={false}
                  src="/logo-name.png"
                  style={{ height: 35, width: "auto" }}
                ></Image>
              </Link>

              {user && !isLoading && !isError ? (
                <UserDropDown />
              ) : (
                <LoginForm />
              )}
            </Flex>
          </Header>
          <Content style={{ margin: isMobile ? 16 : 48 }}>
            {/* <Menu mode="horizontal" items={menuItems} /> */}
            <CustomErrorBoundary>
              <Outlet />
            </CustomErrorBoundary>
          </Content>
        </Layout>
      </Layout>
    </CustomErrorBoundary>
  );
};
