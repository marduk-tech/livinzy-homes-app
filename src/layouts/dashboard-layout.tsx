import { Drawer, Flex, Image, Layout, Typography } from "antd";
import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { CustomErrorBoundary } from "../components/common/custom-error-boundary";
import { useDevice } from "../hooks/use-device";
import { useUser } from "../hooks/use-user";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
import { COLORS, FONT_SIZE } from "../theme/style-constants";

const { Header, Content } = Layout;

export const DashboardLayout: React.FC = () => {
  const { isMobile } = useDevice();

  const { user, isLoading, isError } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinks = [
    { title: "FAQ", link: "", icon: { name: "FaQuoteLeft", set: "fa" } },
    {
      title: "Profile",
      link: "",
      icon: { name: "FaRegUserCircle", set: "fa" },
    },
  ];

  const renderNavLinks = () => {
    return navLinks.map((l: any) => {
      return (
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
              `{" "}
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
            <Flex vertical gap={16}>
              {renderNavLinks()}
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
