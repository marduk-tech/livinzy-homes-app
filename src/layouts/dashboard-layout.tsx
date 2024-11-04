import { ExclamationCircleFilled, LogoutOutlined } from "@ant-design/icons";
import { Button, Drawer, Flex, Image, Layout, Typography } from "antd";
import confirm from "antd/es/modal/confirm";
import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { CustomErrorBoundary } from "../components/common/custom-error-boundary";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
import { useAuth } from "../hooks/use-auth";
import { useDevice } from "../hooks/use-device";
import { useUser } from "../hooks/use-user";
import { COLORS, FONT_SIZE } from "../theme/style-constants";

const { Header, Content } = Layout;

export const DashboardLayout: React.FC = () => {
  const { isMobile } = useDevice();
  const { logout } = useAuth();

  const { user, isLoading, isError } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinks = [
    { title: "FAQ", link: "", icon: { name: "FaQuoteLeft", set: "fa" } },
    {
      title: "Profile",
      link: "/profile",
      icon: { name: "FaRegUserCircle", set: "fa" },
    },
  ];
  const showConfirm = () => {
    confirm({
      title: "Logout",
      icon: <ExclamationCircleFilled />,
      content: "Are you sure you want to logout ?",
      okText: "Logout",
      okType: "danger",
      cancelButtonProps: {
        type: "default",
        shape: "default",
      },
      onOk() {
        logout.mutate();
        window.location.reload();
      },
    });
  };

  const renderNavLinks = () => {
    return navLinks.map((l: any) => {
      return (
        <Link to={l.link ? l.link : "#"}>
          <Flex align="center" gap={8}>
            <DynamicReactIcon
              iconName={l.icon.name}
              iconSet={l.icon.set}
              size={18}
              color={COLORS.textColorDark}
            ></DynamicReactIcon>

            <Typography.Text style={{ fontSize: FONT_SIZE.subHeading }}>
              {l.title}
            </Typography.Text>
          </Flex>
        </Link>
      );
    });
  };

  const bgImage = user
    ? {}
    : {
        backgroundImage: `url(https://avillionfarms.com/wp-content/uploads/2022/09/Entrance-Swing-of-Avillion-Farm-2.png)`,
        backgroundPosition: "center",
        height: 700,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      };
  return (
    <CustomErrorBoundary>
      <Layout
        style={{
          minHeight: "100vh",
          backgroundColor: "transparent",
          ...bgImage,
        }}
      >
        <Layout
          style={{
            backgroundColor: "transparent",
          }}
        >
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

              <Flex
                onClick={() => {
                  setSidebarOpen(true);
                }}
                style={{ marginLeft: "auto" }}
              >
                <DynamicReactIcon
                  iconName="HiOutlineMenuAlt3"
                  iconSet="hi"
                ></DynamicReactIcon>
              </Flex>
              {/* {user && !isLoading && !isError ? <UserDropDown /> : null} */}
            </Flex>
          </Header>
          <Drawer
            title=""
            onClose={() => {
              setSidebarOpen(false);
            }}
            open={sidebarOpen}
          >
            <Flex
              vertical
              gap={16}
              style={{ position: "relative", height: "100%" }}
            >
              {renderNavLinks()}

              <Button
                icon={<LogoutOutlined />}
                type="link"
                onClick={showConfirm}
                style={{
                  padding: 0,
                  height: 32,
                  textAlign: "left",
                  position: "absolute",
                  bottom: 16,
                  left: 0,
                  width: "auto",
                }}
              >
                Logout
              </Button>
            </Flex>
          </Drawer>
          <Content style={{ margin: isMobile ? 16 : 48, marginTop: 0 }}>
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
