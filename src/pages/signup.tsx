import { Button, Form, Input, message, Typography } from "antd";
import PhoneInput from "antd-phone-input";
import { useDevice } from "../hooks/use-device";

import { useState } from "react";
import { useCreateUserMutation } from "../hooks/user-hooks";
import { getUserByMobile } from "../libs/api/user";
import { COLORS } from "../theme/style-constants";

export function SignUpForm() {
  const [form] = Form.useForm();

  const { isTabletOrMobile } = useDevice();

  const createUserMutation = useCreateUserMutation({ enableToasts: false });

  const [signUpStatus, setSignUpStatus] = useState<"EXISTS" | "NEW">();

  const handleOnSubmit = async () => {
    const values = await form.validateFields();

    let phoneNumber;
    let countryCode;

    if (values.mobile) {
      phoneNumber =
        values.mobile.countryCode +
        values.mobile.areaCode +
        values.mobile.phoneNumber;

      countryCode = values.mobile.countryCode;
    }

    const userAlreadyExists = await getUserByMobile(phoneNumber);

    if (userAlreadyExists) {
      setSignUpStatus("EXISTS");
      form.resetFields();
    } else {
      await createUserMutation
        .mutateAsync({
          userData: {
            mobile: phoneNumber,
            countryCode: countryCode,
            profile: {
              ...values,
            },
          },
        })
        .then((data) => {
          setSignUpStatus("NEW");
          form.resetFields();
        })
        .catch((err) => {
          message.error("Please try again later");
        });
    }
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
          {signUpStatus === "EXISTS" ? (
            <>
              <Typography.Title level={2}>Thank You!</Typography.Title>

              <Typography.Title level={4} style={{ fontWeight: "normal" }}>
                You have already registered with us.
              </Typography.Title>
            </>
          ) : signUpStatus === "NEW" ? (
            <>
              <Typography.Title level={2}>Thank You!</Typography.Title>

              <Typography.Title level={4} style={{ fontWeight: "normal" }}>
                We will soon send the additional details over email.
              </Typography.Title>
            </>
          ) : (
            <>
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
                  label="Your Current City & Country"
                  name="city"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Your Mobile Number"
                  name="mobile"
                  rules={[{ required: true }]}
                  initialValue={{
                    countryCode: 91,
                    isoCode: "in",
                  }}
                >
                  <PhoneInput enableArrow enableSearch disableParentheses />
                </Form.Item>

                <Form.Item>
                  <Button
                    loading={createUserMutation.isPending}
                    type="primary"
                    htmlType="submit"
                  >
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </>
          )}
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
