import {
  AutoComplete,
  Button,
  Col,
  Flex,
  Form,
  Input,
  message,
  Row,
  Tag,
  Typography,
} from "antd";
import Link from "antd/es/typography/Link";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDevice } from "../../hooks/use-device";
import {
  ReraProject,
  useReraProjectSearch,
} from "../../hooks/use-rera-project-search";
import { useUser } from "../../hooks/use-user";
import {
  useCreateUserMutation,
  useSendUserMailMutation,
} from "../../hooks/user-hooks";
import { queryKeys } from "../../libs/constants";
import { capitalize } from "../../libs/lvnzy-helper";
import { queryClient } from "../../libs/query-client";
import { LandingFooter } from "../../pages/landing/footer";
import LandingHeader from "../../pages/landing/header";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import DynamicReactIcon from "./dynamic-react-icon";

export const NewReportRequestFormV2 = () => {
  const [form] = Form.useForm();
  const [step, setStep] = useState(1);
  const [selectedProjects, setSelectedProjects] = useState<ReraProject[]>([]);
  const { projects, isLoading } = useReraProjectSearch();
  const createUser = useCreateUserMutation({ enableToasts: false });
  const sendMail = useSendUserMailMutation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { isMobile } = useDevice();
  const [reportsLeft, setReportsLeft] = useState(3);
  const [searchValue, setSearchValue] = useState("");

  const [messageApi, contextHolder] = message.useMessage();

  const projectOptions = (projects || [])
    .filter((p) => !selectedProjects.some((s) => s.projectId === p.projectId))
    .map((project) => ({
      value: `${project.projectId}-${project.projectName}`,
      label: capitalize(project.projectName),
      project,
    }));

  const handleSelectProject = (_: any, option: any) => {
    const newProject = option.project;
    const alreadySelected = selectedProjects.some(
      (p) => p.projectId === newProject.projectId
    );

    if (alreadySelected) {
      message.warning("This project is already selected.");
      return;
    }

    if (selectedProjects.length < 3) {
      setSelectedProjects([...selectedProjects, newProject]);
      setSearchValue("");
    } else {
      message.warning("You can select a maximum of 3 projects.");
    }
  };
  const handleRemoveProject = (projectId: string) => {
    setSelectedProjects(
      selectedProjects.filter((p) => p.projectId !== projectId)
    );
  };

  const handleNext = async () => {
    if (selectedProjects.length === 0) {
      message.error("Please select at least one project.");
      return;
    }
    if (user) {
      processReportRequest();
    } else {
      setStep(2);
    }
  };

  const processReportRequest = async (formValues?: any) => {
    const requestedReports = selectedProjects.map((p) => ({
      projectName: p.projectName,
      reraId: p.projectId,
    }));
    try {
      let responseUser;
      if (user) {
        responseUser = await createUser.mutateAsync({
          userData: {
            profile: user.profile,
            mobile: user.mobile,
            countryCode: user.countryCode,
            requestedReports,
          },
        });
      } else {
        responseUser = await createUser.mutateAsync({
          userData: {
            profile: {
              name: formValues.name,
              email: formValues.email,
            },
            mobile: formValues.mobile,
            countryCode: "91",
            requestedReports,
          },
        });
      }

      if (responseUser) {
        await sendMail.mutateAsync({
          userId: responseUser._id,
          emailType: "report-request",
          params: {
            requestedReports,
          },
        });
        if (responseUser.requestedReports) {
          setStep(3);
        }
      }

      await queryClient.invalidateQueries({ queryKey: [queryKeys.user] });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message ||
        "An unexpected error occurred. Please try again.";
      messageApi.open({
        type: "error",
        content: errorMessage,
      });
    }
  };

  const onFinish = async (values: any) => {
    await processReportRequest(values);
  };

  useEffect(() => {
    if (user && user.requestedReports) {
      setReportsLeft(3 - user.requestedReports.length);
    }
  }, [user]);

  return (
    <>
      <LandingHeader bgColor="#fff"></LandingHeader>
      <Flex
        vertical={isMobile}
        style={{
          paddingTop: isMobile ? 72 : 150,
          height: "calc(100vh - 100px)",
        }}
      >
        <Flex
          style={{
            width: `calc(${isMobile ? "100%" : "50%"} - 32px)`,
            padding: 16,
          }}
          justify="center"
        >
          {/* <img
            src="/images/landing/brick360-request-1.png"
            style={{
              height: isMobile ? 200 : 400,
              marginTop: isMobile ? 0 : 50,
            }}
          /> */}
          <div
            style={{
              backgroundImage: `url(/images/landing/brick360-request-1.png)`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              height: isMobile ? 200 : 400,
              width: isMobile ? "100%" : "80%",
            }}
          ></div>
        </Flex>
        <Flex
          style={{
            width: `calc(${isMobile ? "100%" : "50%"} - 32px)`,
            padding: 16,
            height: "100%",
            marginTop: isMobile ? 0 : 32,
          }}
          vertical
        >
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_3,
              color: COLORS.primaryColor,
            }}
          >
            REQUEST BRICK360 REPORT
          </Typography.Text>

          <Flex
            vertical
            style={{
              padding: 16,
              backgroundColor: COLORS.bgColor,
              marginTop: 8,
              borderRadius: 16,
            }}
          >
            {step === 1 && (
              <Flex vertical style={{ padding: "16px 0" }}>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_1,
                    lineHeight: "120%",
                  }}
                >
                  Search for a Project in Bangalore.
                </Typography.Text>
                {reportsLeft > 0 && (
                  <Typography.Text
                    style={{ fontSize: FONT_SIZE.HEADING_4, marginBottom: 24 }}
                  >
                    You can request report for upto {reportsLeft} projects.
                  </Typography.Text>
                )}

                <AutoComplete
                  style={{
                    width: "100%",
                    marginBottom: 16,
                    maxWidth: 500,
                    marginTop: 8,
                  }}
                  options={projectOptions}
                  value={searchValue}
                  onChange={setSearchValue}
                  onSelect={handleSelectProject}
                  filterOption={(inputValue, option) =>
                    option!.label
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  }
                  placeholder="Search for projects..."
                  disabled={!reportsLeft || selectedProjects.length >= 3}
                >
                  <Input.Search loading={isLoading} />
                </AutoComplete>

                <Row gutter={[16, 16]}>
                  {selectedProjects.map((p) => (
                    <Col key={p.projectId}>
                      <Tag
                        closable
                        onClose={() => handleRemoveProject(p.projectId)}
                        style={{ fontSize: FONT_SIZE.HEADING_2, padding: 16 }}
                      >
                        {capitalize(p.projectName)}
                      </Tag>
                    </Col>
                  ))}
                </Row>
                {!reportsLeft && (
                  <Flex style={{ maxWidth: "100%" }} vertical>
                    <Tag
                      style={{
                        width: "100%",
                        textWrap: "wrap",
                        backgroundColor: COLORS.bgColorBlue,
                        padding: "16px 8px",
                        margin: 0,
                      }}
                    >
                      <Flex vertical>
                        {" "}
                        <DynamicReactIcon
                          iconName="PiSmileyMehLight"
                          iconSet="pi"
                          size={32}
                        ></DynamicReactIcon>
                        <Typography.Text
                          style={{ fontSize: FONT_SIZE.HEADING_3 }}
                        >
                          {" "}
                          Oops! Looks like have you already requested max number
                          of free reports.
                        </Typography.Text>
                        <Link
                          href="/brickassist"
                          style={{
                            fontSize: FONT_SIZE.HEADING_3,
                            marginTop: 16,
                            color: COLORS.primaryColor,
                          }}
                        >
                          {" "}
                          Looking for more ? Schedule a callback with us.
                        </Link>
                      </Flex>
                    </Tag>
                  </Flex>
                )}
              </Flex>
            )}
            {step === 2 && (
              <>
                <Typography.Text style={{ marginBottom: 16 }}>
                  Please provide your details to receive the reports.
                </Typography.Text>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  style={{ width: "100%", maxWidth: 500 }}
                >
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[
                      { required: true, message: "Please enter your name" },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                      { required: true, message: "Please enter your email" },
                      {
                        type: "email",
                        message: "Please enter a valid email",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="mobile"
                    label="Mobile Number"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your mobile number",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Form>
              </>
            )}

            {step == 3 && (
              <Flex vertical style={{ padding: "32px 0" }}>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_1,
                    lineHeight: "120%",
                    marginBottom: 16,
                  }}
                >
                  Wohoo! Your request is submitted.
                </Typography.Text>
                <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_4 }}>
                  Our team including our swarm of AI agents are already
                  processesing your request. <br></br>Please give us max 24
                  hours to get back to you with a detailed report.
                </Typography.Text>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_4,
                    fontWeight: "bold",
                    marginTop: 16,
                  }}
                >
                  We will notify you via email and message once its ready.
                </Typography.Text>
              </Flex>
            )}
          </Flex>
          {reportsLeft > 0 && (
            <Flex style={{ marginTop: 16 }} gap={16}>
              {step === 1
                ? [
                    <Button
                      key="next"
                      type="primary"
                      onClick={handleNext}
                      disabled={selectedProjects.length === 0}
                      loading={createUser.isPending && !!user}
                    >
                      {user ? "Submit" : "Next"}
                    </Button>,
                  ]
                : step == 2
                ? [
                    <Button key="back" onClick={() => setStep(1)}>
                      Back
                    </Button>,
                    <Button
                      key="submit"
                      type="primary"
                      loading={createUser.isPending}
                      onClick={() => form.submit()}
                    >
                      Submit
                    </Button>,
                  ]
                : [
                    <Button
                      style={{ width: 200 }}
                      key="home"
                      onClick={() => {
                        window.location.replace("/");
                      }}
                    >
                      Take me Home
                    </Button>,
                  ]}
            </Flex>
          )}
        </Flex>
      </Flex>
      <LandingFooter></LandingFooter>
    </>
  );
};
