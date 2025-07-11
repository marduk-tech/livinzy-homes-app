import { Button, Flex, Form, Input, Typography } from "antd";
import { useState } from "react";
import { FONT_SIZE } from "../../theme/style-constants";

const mockVal = (str: string, repeat = 1) => ({
  value: str.repeat(repeat),
});

export function BrickAssistCallback() {
  const [form] = Form.useForm();

  const [formSuccess, setFormSuccess] = useState(true);

  return (
    <Flex gap={8} vertical style={{ paddingTop: 24, paddingBottom: 16 }}>
      {formSuccess ? (
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
            Thank you for your request. Our team will call you back at your
            preferred time.
          </Typography.Text>
        </Flex>
      ) : (
        <Flex vertical>
          <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_1 }}>
            Provide Your Details
          </Typography.Text>
          <Form
            form={form}
            layout="vertical"
            onFinish={() => {}}
            style={{
              marginTop: 16,
              maxWidth: "400px",
              display: "flex",
              flexDirection: "column",
              gap: 0,
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
              label="Your Mobile Number"
              name="mobile"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="What's a good day and time to call you"
              name="callbackTime"
            >
              <Input placeholder="Anyday after 5pm" />
            </Form.Item>
          </Form>
        </Flex>
      )}

      {formSuccess ? null : (
        <Flex justify="flex-end" style={{ marginTop: 24 }} gap={16}>
          <Button onClick={() => {}} type="primary">
            {"Submit"}
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
