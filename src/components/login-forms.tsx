import {
  Button,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { COLORS, FONT_SIZE } from "../theme/style-constants";

export function LoginForm() {
  // modal

  // auth
  const {
    generateOtp: generateOtpMutation,
    login: loginMutation,
    loginStatus,
    setLoginStatus,
  } = useAuth();
  const [resendTimer, setResendTimer] = useState(45);

  const [form] = Form.useForm();

  useEffect(() => {
    let timer: any;
    if (resendTimer > 0 && loginStatus === "OTP_SENT") {
      timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer, loginStatus]);

  const generateOtp = async ({ mobile }: { mobile: string }) => {
    try {
      await generateOtpMutation.mutateAsync({
        mobile: mobile,
      });

      message.success("OTP sent");
      setLoginStatus("OTP_SENT");
      setResendTimer(45);
    } catch (error) {
      message.error("Failed to send OTP");
    }
  };

  const handleGenerateOtp = async () => {
    const values = await form.validateFields();
    generateOtp({ mobile: values.mobileNumber });
  };

  const handleLogin = async () => {
    const values = await form.validateFields();

    try {
      await loginMutation.mutateAsync({
        mobile: values.mobileNumber,
        code: values.otp,
      });
    } catch (error) {
      message.error("Invalid OTP. Please try again.");
      form.resetFields(["otp"]);
    }
  };

  return (
    <>
      <div
        style={{
          margin: "auto",
          marginTop: "30px",
          backgroundColor: "rgba(255,255,255,0.95)",
          padding: 24,
          borderRadius: 4,
          width: 500,
          boxShadow: "0 0 4px",
        }}
      >
        <Flex vertical>
          <Typography.Text
            style={{ fontSize: FONT_SIZE.title, fontWeight: "bold" }}
          >
            Welcome To Livinzy
          </Typography.Text>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.subText,
              color: COLORS.textColorLight,
            }}
          >
            Login with your mobile number to continue.
          </Typography.Text>
        </Flex>
        <Divider />

        <Flex>
          <Form
            style={{ width: "100%" }}
            form={form}
            layout="vertical"
            onFinish={
              loginStatus === "OTP_SENT" ? handleLogin : handleGenerateOtp
            }
          >
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue, resetFields }) => {
                return (
                  <>
                    <Form.Item
                      label=""
                      name="mobileNumber"
                      validateTrigger="onSubmit"
                      rules={[
                        {
                          required: true,
                          message: "Please input your mobile number!",
                        },
                        {
                          type: "integer",
                          message: "Mobile number must be an integer!",
                        },
                        {
                          validator: (_, value) =>
                            value && value.toString().length === 10
                              ? Promise.resolve()
                              : Promise.reject(
                                  new Error(
                                    "Mobile number must be 10 digits long!"
                                  )
                                ),
                        },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber
                        style={{
                          fontSize: FONT_SIZE.subHeading,
                          width: "100%",
                        }}
                        placeholder="Enter your mobile number"
                        disabled={loginStatus === "OTP_SENT"}
                        type="tel"
                      />
                    </Form.Item>
                    <Typography.Text
                      style={{
                        fontSize: FONT_SIZE.default,
                        color: COLORS.textColorLight,
                        width: "100%",
                      }}
                    >
                      By signing up, you agree to the terms & conditions.
                    </Typography.Text>

                    {loginStatus === "OTP_SENT" && (
                      <Button
                        type="link"
                        size="small"
                        style={{ padding: 0 }}
                        onClick={() => {
                          setLoginStatus("EDIT_MOBILE");
                          form.resetFields(["otp"]);
                        }}
                      >
                        Edit number
                      </Button>
                    )}

                    {loginStatus === "OTP_SENT" && (
                      <>
                        <Form.Item
                          label="OTP"
                          name="otp"
                          rules={[
                            {
                              required: true,
                              message: "Please input the OTP!",
                            },
                            {
                              pattern: /^\d{4}$/,
                              message: "OTP must be exactly 4 digits long!",
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
                            placeholder="Enter the OTP"
                            maxLength={6}
                          />
                        </Form.Item>

                        <Button
                          disabled={resendTimer > 0}
                          style={{
                            padding: 0,
                            color:
                              resendTimer > 0
                                ? COLORS.textColorLight
                                : COLORS.textColorDark,
                          }}
                          type="link"
                          onClick={() =>
                            generateOtp({
                              mobile: getFieldValue("mobileNumber"),
                            })
                          }
                          size="small"
                        >
                          {resendTimer > 0 ? (
                            <>Resend OTP in {resendTimer} sec</>
                          ) : (
                            <>Resend OTP</>
                          )}
                        </Button>
                      </>
                    )}
                  </>
                );
              }}
            </Form.Item>
            <Form.Item style={{ marginTop: 20 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={
                  generateOtpMutation.isPending || loginMutation.isPending
                }
              >
                {loginStatus === "OTP_SENT" ? "Verify OTP" : "Send OTP"}
              </Button>
            </Form.Item>
          </Form>
        </Flex>
      </div>
    </>
  );
}