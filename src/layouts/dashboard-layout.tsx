import { Drawer, Flex, Image, Layout, Modal, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { CustomErrorBoundary } from "../components/common/custom-error-boundary";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
import { LoginForm } from "../components/login-forms";
import { useDevice } from "../hooks/use-device";
import { useUser } from "../hooks/use-user";
import { LocalStorageKeys } from "../libs/constants";
import { COLORS, FONT_SIZE, MAX_WIDTH } from "../theme/style-constants";
import { NavLink } from "../types/Common";

const { Header, Content } = Layout;

export const DashboardLayout: React.FC = () => {
  const { isMobile } = useDevice();

  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    const userItem = localStorage.getItem(LocalStorageKeys.user);
    const user = userItem ? JSON.parse(userItem) : null;
    if (user) {
      return;
    } else {
      setLoginModalOpen(true);
    }
  });

  useEffect(() => {
    if (user) {
      setLoginModalOpen(false);
    }
  }, [user]);

  const navLinks: NavLink[] = [
    {
      title: "Profile",
      link: "/profile",
      icon: { name: "FaRegUserCircle", set: "fa" },
    },
    {
      title: "Chat History",
      link: "/user-sessions",
      icon: { name: "RiHistoryLine", set: "ri" },
    },
    {
      title: "Learn",
      link: "https://learn.livinzy.com/",
      icon: { src: "./images/livology-icon.png" },
    },
    {
      title: "Buying a Farmland",
      link: "https://livology.hashnode.dev/faqs-buying-agricultural-land-karnataka",
      icon: { name: "TbPhotoQuestion", set: "tb" },
    },
    {
      title: "About Us",
      link: "https://livinzy.com/about",
      icon: { name: "RiProfileLine", set: "ri" },
      alignBottom: true,
    },
  ];

  const NavLinks = ({ navLinks }: { navLinks: NavLink[] }) => {
    return (
      <>
        {navLinks
          .filter((l) => l.title === "Profile" || l.title === "Chat History")

          .map((link) => (
            <Link
              key={link.title}
              to={link.link || "#"}
              onClick={() => {
                setSidebarOpen(false);
              }}
              style={{ marginTop: link.alignBottom ? "auto" : "initial" }}
            >
              <Flex align="center" gap={8}>
                {link.icon.name ? (
                  <DynamicReactIcon
                    iconName={link.icon.name}
                    iconSet={link.icon.set as any}
                    size={16}
                    color={COLORS.textColorDark}
                  />
                ) : (
                  <Image width={16} src={link.icon.src}></Image>
                )}

                <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_3 }}>
                  {link.title}
                </Typography.Text>
              </Flex>
            </Link>
          ))}
      </>
    );
  };

  return (
    <CustomErrorBoundary>
      <Modal
        open={loginModalOpen}
        closable={false}
        footer={null}
        style={{ padding: 0 }}
        styles={{
          mask: {
            backgroundColor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(8px)",
          },
        }}
      >
        <LoginForm></LoginForm>
      </Modal>
      <Layout
        style={{
          minHeight: "100vh",
          backgroundColor: "transparent",
        }}
      >
        <Layout
          style={{
            backgroundColor: "transparent",
          }}
        >
          <Header
            style={{
              background: "transparent",
              height: "60px",
              padding: "0 12px",
              borderBottom: "1px solid",
              borderBottomColor: COLORS.borderColor,
            }}
          >
            <Flex align="center" justify="space-between" style={{ height: 60 }}>
              <Link
                to="/"
                style={{ height: 60, display: "flex", alignItems: "center" }}
              >
                <img
                  src="/logo-name.png"
                  style={{ height: 30, width: "auto", marginLeft: -8 }}
                ></img>
              </Link>

              {user && (
                <Flex
                  onClick={() => {
                    setSidebarOpen(true);
                  }}
                  style={{ marginLeft: "auto", cursor: "pointer" }}
                >
                  <DynamicReactIcon
                    iconName="HiOutlineMenuAlt3"
                    iconSet="hi"
                  ></DynamicReactIcon>
                </Flex>
              )}
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
              align="flex-start"
              style={{ position: "relative", height: "100%" }}
            >
              <NavLinks navLinks={navLinks} />
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.SUB_TEXT,
                  color: COLORS.textColorLight,
                  marginTop: "auto",
                }}
              >
                Copyright @Marduk Technologies Private Ltd
              </Typography.Text>
            </Flex>
          </Drawer>
          <Content
            style={{
              margin: "auto",
              marginTop: 16,
              maxWidth: MAX_WIDTH,
              width: "100%",
            }}
          >
            <CustomErrorBoundary>
              <Outlet />
            </CustomErrorBoundary>
          </Content>
        </Layout>
      </Layout>
    </CustomErrorBoundary>
  );
};
