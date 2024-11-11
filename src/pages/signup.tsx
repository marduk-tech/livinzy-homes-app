import { Button, Col, Form, Input, Row, Typography } from "antd";
import { useDevice } from "../hooks/use-device";
import { useSubmitSubmissionMutation } from "../hooks/use-submission";
import { COLORS } from "../theme/style-constants";

export function SignUpForm() {
  const [form] = Form.useForm();

  const { isTabletOrMobile } = useDevice();

  const submitMutation = useSubmitSubmissionMutation({});

  const handleOnSubmit = async () => {
    const values = await form.validateFields();

    submitMutation.mutateAsync({ body: values }).then(() => {
      form.resetFields();
    });
  };

  return (
    <>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <div
          style={{
            width: !isTabletOrMobile ? "50%" : "100%",
            padding: !isTabletOrMobile ? "40px 100px" : "40px",
          }}
        >
          <Typography.Title level={2}>
            Sign Up for exclusive access
          </Typography.Title>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleOnSubmit}
            style={{
              marginTop: 40,
              maxWidth: "500px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <Form.Item
              label="Your Name"
              name="name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Your Email"
              name="email"
              rules={[
                { required: true },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Your Linkedin Profile"
              name="linkedin"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Your current city & country"
              name="location"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item>
              <Button
                loading={submitMutation.isPending}
                type="primary"
                htmlType="submit"
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>

        {!isTabletOrMobile && (
          <div
            style={{
              width: "50%",
              backgroundColor: COLORS.bgColorDark,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          ></div>
        )}
      </div>
    </>
  );
}
