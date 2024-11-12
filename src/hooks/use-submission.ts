import { useMutation } from "@tanstack/react-query";
import { notification } from "antd";
import { AxiosError } from "axios";
import { axiosApiInstance } from "../libs/axios-api-Instance";

export function useSubmitSubmissionMutation({
  enableToasts = true,
}: {
  enableToasts?: boolean;
}) {
  return useMutation({
    mutationFn: async ({ body }: { body: any }) => {
      const endpoint = `/submissions`;
      console.log(body);

      return await axiosApiInstance.post(endpoint, body).then((response) => {
        return response.data;
      });
    },

    onSuccess: () => {
      if (enableToasts) {
        notification.success({
          message: `Your response has been successfully submitted.`,
        });
      }
    },

    onError: (error: AxiosError<any>) => {
      notification.error({
        message: `An unexpected error occurred. Please try again later.`,
      });
    },
  });
}
