import { Button, Flex, Form, Input, Typography } from "antd";
import { useEffect, useState } from "react";
import { useUser } from "../../hooks/use-user";
import {
  useCreateUserMutation,
  useSendUserMailMutation,
  useUpdateUserMutation,
} from "../../hooks/user-hooks";
import { FONT_SIZE } from "../../theme/style-constants";

export function BrickAssistCallback({ onSuccess }: { onSuccess?: () => void }) {
  const [form] = Form.useForm();
  const { user } = useUser();
  const createUser = useCreateUserMutation({});
  const updateUser = useUpdateUserMutation({ userId: user?._id || "" });
  const sendMail = useSendUserMailMutation();

  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.profile.name,
        mobile: user.mobile,
      });
    }
  }, [user, form]);

  const onFinish = async (values: any) => {
    let userId = user?._id;

    if (user) {
      await updateUser.mutateAsync({
        userData: {
          status: "callback-request",
          profile: {
            ...user.profile,
            preferredCallbackTime: values.callbackTime,
          },
        },
      });
    } else {
      const newUser = await createUser.mutateAsync({
        userData: {
          name: values.name,
          mobile: values.mobile,
          status: "callback-request",
          profile: {
            preferredCallbackTime: values.callbackTime,
          },
          countryCode: "91",
        },
      });
      userId = newUser._id;
    }

    if (userId) {
      await sendMail.mutateAsync({
        userId,
        emailType: "callback-request",
        params: {
          name: values.name,
          mobile: values.mobile,
          callbackTime: values.callbackTime,
        },
      });
    }

    setFormSuccess(true);
    if (onSuccess) {
      onSuccess();
    }
  };

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
            onFinish={onFinish}
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
              <Input disabled={!!user} />
            </Form.Item>
            <Form.Item
              label="Your Mobile Number"
              name="mobile"
              rules={[{ required: true }]}
            >
              <Input disabled={!!user} />
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
          <Button
            onClick={() => form.submit()}
            type="primary"
            loading={
              createUser.isPending || updateUser.isPending || sendMail.isPending
            }
          >
            {"Submit"}
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
