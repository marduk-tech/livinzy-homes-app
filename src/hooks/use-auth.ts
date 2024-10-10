import { useMutation } from "@tanstack/react-query";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { LocalStorageKeys, queryKeys } from "../libs/constants";
import { queryClient } from "../libs/query-client";

export type LoginStatus =
  | "OTP_SENT"
  | "LOGIN_ERROR"
  | "LOGIN_SUCCESS"
  | "EDIT_MOBILE";

export function useAuth() {
  const navigate = useNavigate();

  const [loginStatus, setLoginStatus] = useState<LoginStatus>("EDIT_MOBILE");

  const generateOtp = useMutation({
    mutationFn: ({ mobile }: { mobile: string }) => {
      return axiosApiInstance.post(`/auth/otp/generate`, {
        mobile: mobile,
      });
    },
    onSuccess: async ({ data }) => {
      setLoginStatus("OTP_SENT");
    },
    onError: (error) => {
      console.log(error.message);
    },
  });

  const login = useMutation({
    mutationFn: ({ mobile, code }: { mobile: string; code: number }) => {
      return axiosApiInstance.post(`/auth/otp/login`, {
        mobile: mobile.toString(),
        code: code,
      });
    },

    async onSuccess({ data }) {
      localStorage.setItem(LocalStorageKeys.user, JSON.stringify(data.user));

      await queryClient.invalidateQueries({
        queryKey: [queryKeys.user],
      });

      return navigate("/");
    },

    onError: (error) => {
      console.log(error);
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      localStorage.removeItem(LocalStorageKeys.user);

      await queryClient.removeQueries({
        queryKey: [queryKeys.user],
      });
      return true;
    },

    onError: (error) => {
      console.log(error);
    },
  });

  return {
    login,
    logout,
    generateOtp,
    loginStatus,
    setLoginStatus,
  };
}
