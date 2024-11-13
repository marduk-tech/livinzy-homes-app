import {
  Button,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Typography,
} from "antd";
import PhoneInput from "antd-phone-input";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { useUser } from "../hooks/use-user";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { UserDetailsForm } from "./user-details-form";

export function LoginForm() {
  // auth
  const {
    generateOtp: generateOtpMutation,
    login: loginMutation,
    loginStatus,
    setLoginStatus,
  } = useAuth();
  const [resendTimer, setResendTimer] = useState(45);

  const [form] = Form.useForm();

  const [showUserDetailsForm, setShowUserDetailsForm] = useState(false);

  useEffect(() => {
    let timer: any;
    if (resendTimer > 0 && loginStatus === "OTP_SENT") {
      timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer, loginStatus]);

  const { user, isLoading: userLoading } = useUser();

  useEffect(() => {
    if (user && !user.profile?.name) {
      setShowUserDetailsForm(true);
    }
  }, [userLoading, user]);

  const generateOtp = async ({
    mobile,
    countryCode,
  }: {
    mobile: string;
    countryCode: string;
  }) => {
    try {
      await generateOtpMutation.mutateAsync({
        mobile: mobile,
        countryCode: countryCode,
      });

      message.success("OTP sent");
      setLoginStatus("OTP_SENT");
      setResendTimer(45);
    } catch (error: any) {
      if (
        error &&
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        message.error(error.response.data.message);
      } else {
        message.error("Failed to send OTP. Please try again.");
      }
    }
  };

  const handleGenerateOtp = async () => {
    const values = await form.validateFields();

    let phoneNumber;
    let countryCode;

    if (values.mobileNumber) {
      phoneNumber =
        values.mobileNumber.countryCode +
        values.mobileNumber.areaCode +
        values.mobileNumber.phoneNumber;
      countryCode = values.mobileNumber.countryCode;
    }

    generateOtp({ mobile: phoneNumber, countryCode: `${countryCode}` });
  };

  const handleLogin = async () => {
    const values = await form.validateFields();

    try {
      await loginMutation
        .mutateAsync({
          code: values.otp,
          countryCode: values.mobileNumber.countryCode,
        })
        .then((user: any) => {
          if (!user.profile?.name) {
            setShowUserDetailsForm(true);
          }
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
          backgroundColor: "rgba(255,255,255,0.95)",
          padding: 8,
          borderRadius: 4,
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
              marginBottom: 24,
            }}
          >
            {showUserDetailsForm
              ? "Please update your basic details"
              : "Livinzy is only available for private access right now."}
          </Typography.Text>
          {/* <Typography.Text
style={{
fontSize: FONT_SIZE.subText,
color: COLORS.textColorLight,
}}
>
Login with your mobile number to continue.
</Typography.Text> */}
        </Flex>
        {/* <Divider style={{ marginTop: 8, marginBottom: 32 }} /> */}

        <Flex>
          {showUserDetailsForm ? (
            <>
              <UserDetailsForm />
            </>
          ) : (
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
                            validator: (_, value) => {
                              const mobile = value.areaCode + value.phoneNumber;

                              console.log(mobile);

                              return value && mobile.length >= 10
                                ? Promise.resolve()
                                : Promise.reject(
                                    new Error(
                                      "Mobile number must be at least 10 digits long!"
                                    )
                                  );
                            },
                          },
                        ]}
                        style={{ marginBottom: 0 }}
                        initialValue={{
                          countryCode: 91,
                          isoCode: "in",
                        }}
                      >
                        <PhoneInput
                          disabled={loginStatus === "OTP_SENT"}
                          placeholder="Login with your mobile number"
                          enableArrow
                          enableSearch
                          disableParentheses
                        />
                      </Form.Item>
                      {/* <Typography.Text
style={{
fontSize: FONT_SIZE.default,
color: COLORS.textColorLight,
width: "100%",
}}
>
By signing up, you agree to the terms & conditions.
</Typography.Text> */}

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
                            onClick={() => {
                              const mobile = getFieldValue("mobileNumber");

                              const phoneNumber =
                                mobile.countryCode +
                                mobile.areaCode +
                                mobile.phoneNumber;

                              generateOtp({
                                mobile: phoneNumber,
                                countryCode: `${mobile.countryCode}`,
                              });
                            }}
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
          )}
        </Flex>
      </div>
    </>
  );
}
