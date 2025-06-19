import { Drawer, Flex, Image, Layout, Modal, Select, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { CustomErrorBoundary } from "../components/common/custom-error-boundary";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
import { LoginForm } from "../components/login-forms";
import { UserDetailsForm } from "../components/user-details-form";
import { useUser } from "../hooks/use-user";
import { LocalStorageKeys } from "../libs/constants";
import { COLORS, FONT_SIZE, MAX_WIDTH } from "../theme/style-constants";
import { NavLink } from "../types/Common";

const { Header, Content } = Layout;

export const DashboardLayout: React.FC = () => {
  const { user, isLoading: userLoading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [showUserDetailsForm, setShowUserDetailsForm] = useState(false);

  const navigate = useNavigate();
  const { lvnzyProjectId, collectionId } = useParams();

  useEffect(() => {
    const userItem = localStorage.getItem(LocalStorageKeys.user);
    const userLocal = userItem ? JSON.parse(userItem) : null;
    if (!userLocal) {
      setLoginModalOpen(true);
    } else {
      setLoginModalOpen(false);
    }
  }, []);

  useEffect(() => {
    if (user && (!user.profile.email || !user.profile.email)) {
      setShowUserDetailsForm(true);
    }
  }, [user]);

  const navLinks: NavLink[] = [
    {
      key: "profile",
      title: "Profile",
      link: "/app/profile",
      icon: { name: "FaRegUserCircle", set: "fa" },
    },
    {
      key: "about",
      title: "About Brickfi",
      link: "https://brickfi.in/",
      icon: { name: "FiInfo", set: "fi" },
    },
    {
      key: "chat-history",
      title: "Chat History",
      link: "/user-sessions",
      icon: { name: "RiHistoryLine", set: "ri" },
    },
  ];

  const NavLinks = ({ navLinks }: { navLinks: NavLink[] }) => {
    return (
      <>
        {navLinks.map((link) => (
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
                  size={20}
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
        open={loginModalOpen || showUserDetailsForm}
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
        {showUserDetailsForm ? (
          <UserDetailsForm ignoreCity={true} />
        ) : (
          <LoginForm></LoginForm>
        )}
      </Modal>
      <Layout
        style={{
          minHeight: "100vh",
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
            }}
          >
            <Flex
              align="center"
              justify="space-between"
              style={{ height: 60, cursor: "pointer" }}
            >
              <Flex
                onClick={() => {
                  if (lvnzyProjectId || collectionId) {
                    window.location.replace("/app");
                  } else {
                    window.location.replace("/");
                  }
                }}
                style={{ height: 60, display: "flex", alignItems: "center" }}
              >
                <img
                  src="/images/brickfi-logo.png"
                  style={{ height: 20, width: "auto", marginLeft: 4 }}
                ></img>
              </Flex>

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
              <NavLinks
                navLinks={navLinks.filter((l) => l.key === "profile")}
              />
              {user?.savedLvnzyProjects &&
                user.savedLvnzyProjects.length > 1 && (
                  <Select
                    style={{ minWidth: 200 }}
                    placeholder="Select project list"
                    defaultValue={user.savedLvnzyProjects[0]._id}
                    optionFilterProp="label"
                    onChange={(value: string) => {
                      setSidebarOpen(false);
                      navigate(`/app/${value}`);
                    }}
                    options={[
                      { value: "all", label: "All Collections" },
                      ...(user.savedLvnzyProjects?.map((c: any) => ({
                        value: c._id,
                        label: c.collectionName,
                      })) ?? []),
                    ]}
                  />
                )}
              <Flex gap={24} vertical style={{ marginTop: "auto" }}>
                <NavLinks
                  navLinks={navLinks.filter((l) => l.key === "about")}
                />
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.SUB_TEXT,
                    color: COLORS.textColorLight,
                  }}
                >
                  Copyright @Marduk Technologies Private Ltd
                </Typography.Text>
              </Flex>
            </Flex>
          </Drawer>
          <Content
            style={{
              margin: "auto",
              backgroundColor: COLORS.bgColorMedium,
              maxWidth: MAX_WIDTH,
              width: "100%",
              height: "calc(100vh - 100px)",
              overflowY: "scroll",
              scrollbarWidth: "none",
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
