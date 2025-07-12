import {
  AutoComplete,
  Button,
  Col,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Row,
  Tag,
  Typography,
} from "antd";
import { AxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ReraProject,
  useReraProjectSearch,
} from "../../hooks/use-rera-project-search";
import { useUser } from "../../hooks/use-user";
import { useCreateUserMutation } from "../../hooks/user-hooks";
import { queryKeys } from "../../libs/constants";
import { queryClient } from "../../libs/query-client";
import { FONT_SIZE } from "../../theme/style-constants";

export const NewReportRequestForm = ({
  onSuccess,
  open,
  onClose,
}: {
  onSuccess?: () => void;
  open: boolean;
  onClose?: () => void;
}) => {
  const [form] = Form.useForm();
  const [step, setStep] = useState(1);
  const [selectedProjects, setSelectedProjects] = useState<ReraProject[]>([]);
  const { projects, isLoading } = useReraProjectSearch();
  const createUser = useCreateUserMutation({ enableToasts: false });
  const navigate = useNavigate();
  const { user } = useUser();

  const [messageApi, contextHolder] = message.useMessage();

  const [searchValue, setSearchValue] = useState("");

  const projectOptions = (projects || [])
    .filter((p) => !selectedProjects.some((s) => s.projectId === p.projectId))
    .map((project) => ({
      value: `${project.projectId}-${project.projectName}`,
      label: project.projectName,
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
      if (user) {
        await createUser
          .mutateAsync({
            userData: {
              profile: user.profile,
              mobile: user.mobile,
              countryCode: user.countryCode,
              requestedReports,
            },
          })
          .then((data) => {
            if (data.requestedReports) {
              messageApi.open({
                type: "success",
                content: "Reports Requested",
              });
            }
          });
      } else {
        await createUser
          .mutateAsync({
            userData: {
              profile: {
                name: formValues.name,
                email: formValues.email,
              },
              mobile: formValues.mobile,
              countryCode: "91",
              requestedReports,
            },
          })
          .then((data) => {
            if (data.requestedReports) {
              messageApi.open({
                type: "success",
                content: "Reports Requested",
              });
            }
          });
      }

      await queryClient.invalidateQueries({ queryKey: [queryKeys.user] });

      setStep(3);
      if (onSuccess) {
        onSuccess();
      }
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

  const handleClose = () => {
    setStep(1);
    setSelectedProjects([]);
    form.resetFields();
    if (onClose) {
      onClose();
    }
  };

  if (user && user.requestedReports && user.requestedReports.length >= 3) {
    return (
      <Modal
        open={open}
        onCancel={handleClose}
        onClose={handleClose}
        footer={null}
        closable={true}
      >
        <p>You have already requested 3 reports.</p>
      </Modal>
    );
  }

  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        title={null}
        closable={true}
        onClose={handleClose}
        onCancel={handleClose}
        footer={
          step === 1
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
                  key="close"
                  onClick={() => {
                    handleClose();
                  }}
                >
                  Close
                </Button>,
              ]
        }
      >
        {step === 1 && (
          <>
            <p>Search and select up to 3 projects to request reports for.</p>
            <AutoComplete
              style={{ width: "100%", marginBottom: 16 }}
              options={projectOptions}
              onSelect={handleSelectProject}
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Search for projects..."
              disabled={selectedProjects.length >= 3}
              filterOption={(inputValue, option) =>
                option!.label.toLowerCase().includes(inputValue.toLowerCase())
              }
            >
              <Input.Search loading={isLoading} />
            </AutoComplete>

            <Row gutter={[16, 16]}>
              {selectedProjects.map((p) => (
                <Col key={p.projectId}>
                  <Tag
                    closable
                    onClose={() => handleRemoveProject(p.projectId)}
                  >
                    {p.projectName}
                  </Tag>
                </Col>
              ))}
            </Row>
          </>
        )}
        {step === 2 && (
          <>
            <p>Please provide your details to receive the reports.</p>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: "Please enter your name" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Please enter a valid email" },
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
          <Flex vertical>
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
              Our team including our swarm of AI agents are already processesing
              your request. Please give us max 24 hours to get back to you with
              a detailed report.
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
      </Modal>
    </>
  );
};
