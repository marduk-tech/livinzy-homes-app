import {
  AutoComplete,
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  notification,
  Row,
  Tag,
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

export const NewReportRequestForm = ({
  onSuccess,
  open,
  onClose,
}: {
  onSuccess: () => void;
  open: boolean;
  onClose: () => void;
}) => {
  const [form] = Form.useForm();
  const [step, setStep] = useState(1);
  const [selectedProjects, setSelectedProjects] = useState<ReraProject[]>([]);
  const { projects, isLoading } = useReraProjectSearch();
  const createUser = useCreateUserMutation({ enableToasts: false });
  const navigate = useNavigate();
  const { user } = useUser();

  const [messageApi, contextHolder] = message.useMessage();

  const projectOptions = (projects || [])
    .filter((p) => !selectedProjects.some((s) => s.projectId === p.projectId))
    .map((project) => ({
      value: project.projectName,
      label: project.projectName,
      project,
    }));

  const handleSelectProject = (_: any, option: any) => {
    if (selectedProjects.length < 3) {
      setSelectedProjects([...selectedProjects, option.project]);
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

    const requestedReports = selectedProjects.map((p) => ({
      projectName: p.projectName,
      reraId: p.projectId,
    }));

    if (user) {
      try {
        await createUser.mutateAsync({
          userData: {
            profile: user.profile,
            mobile: user.mobile,
            countryCode: user.countryCode,
            requestedReports,
          },
        });
        messageApi.open({
          type: "success",
          content: "Project Requested",
        });
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
    } else {
      setStep(2);
    }
  };

  const onFinish = async (values: any) => {
    const requestedReports = selectedProjects.map((p) => ({
      projectName: p.projectName,
      reraId: p.projectId,
    }));

    try {
      await createUser.mutateAsync({
        userData: {
          profile: {
            name: values.name,
            email: values.email,
          },
          mobile: values.mobile,
          countryCode: "91",
          requestedReports,
        },
      });
      messageApi.open({
        type: "success",
        content: "Project Requested",
      });

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

  const handleClose = () => {
    setStep(1);
    setSelectedProjects([]);
    form.resetFields();
    onClose();
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
        title={step === 1 ? "Request New Reports" : "Your Information"}
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
            : [
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
        }
      >
        {step === 1 && (
          <>
            <p>Search and select up to 3 projects to request reports for.</p>
            <AutoComplete
              style={{ width: "100%", marginBottom: 16 }}
              options={projectOptions}
              onSelect={handleSelectProject}
              placeholder="Search for projects..."
              disabled={selectedProjects.length >= 3}
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
      </Modal>
    </>
  );
};
