import { Button, Form, Input, Select } from "antd";
import { useUser } from "../hooks/use-user";
import { useUpdateUserMutation } from "../hooks/user-hooks";
import { FONT_SIZE } from "../theme/style-constants";

const sourceOptions = [
  { label: "Direct email", value: "Direct email" },
  {
    label: "Found on Google Search/Other Search",
    value: "Found on Google Search/Other Search",
  },
  { label: "Social Media", value: "Social Media" },
  { label: "Through a friend", value: "Through a friend" },
  { label: "Other", value: "Other" },
];

export function UserDetailsForm({
  ignoreSource = false,
  ignoreCity = false,
}: {
  ignoreSource?: boolean;
  ignoreCity?: boolean;
}) {
  const [form] = Form.useForm();

  const { user } = useUser();

  const updateUserMutation = useUpdateUserMutation({
    userId: user?._id as string,
  });

  const handleUserUpdate = async () => {
    const values = await form.validateFields();

    updateUserMutation.mutate({
      userData: {
        profile: {
          ...user?.profile,
          ...values,
        },
      },
    });
  };

  if (user) {
    return (
      <Form
        style={{ width: "100%" }}
        form={form}
        layout="vertical"
        onFinish={handleUserUpdate}
        initialValues={user.profile}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[
            {
              required: true,
            },
          ]}
          validateTrigger="onSubmit"
          style={{ marginBottom: 0 }}
        >
          <Input
            style={{
              width: "100%",
              fontSize: FONT_SIZE.subHeading,
            }}
            placeholder="Jon Doe"
          />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              type: "email",
              message: "Please enter a valid email!",
            },
          ]}
          validateTrigger="onSubmit"
          style={{ marginBottom: 0, marginTop: 20 }}
        >
          <Input
            style={{
              width: "100%",
              fontSize: FONT_SIZE.subHeading,
            }}
            placeholder="jondoe@gmail.com"
          />
        </Form.Item>

        {!ignoreCity && (
          <Form.Item
            label="Current City Location"
            name="city"
            style={{ marginBottom: 0, marginTop: 20 }}
          >
            <Input
              style={{
                width: "100%",
                fontSize: FONT_SIZE.subHeading,
              }}
              placeholder="Enter your city"
            />
          </Form.Item>
        )}

        {!ignoreSource && (
          <Form.Item
            label="How did you get to know about Livinzy?"
            name="source"
            style={{ marginBottom: 0, marginTop: 20 }}
          >
            <Select
              placeholder="Select an option"
              style={{ width: "100%", fontSize: FONT_SIZE.subHeading }}
              allowClear
            >
              {sourceOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item style={{ marginTop: 30 }}>
          <Button
            loading={updateUserMutation.isPending}
            type="primary"
            htmlType="submit"
          >
            Save
          </Button>
        </Form.Item>
      </Form>
    );
  }
}