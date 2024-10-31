import { useMutation } from "@tanstack/react-query";
import { notification } from "antd";
import { AxiosError } from "axios";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { queryKeys } from "../libs/constants";
import { queryClient } from "../libs/query-client";
import { User } from "../types/User";

export function useUpdateUserMutation({
  userId,
  enableToasts = true,
}: {
  userId: string;
  enableToasts?: boolean;
}) {
  return useMutation({
    mutationFn: async ({ userData }: { userData: Partial<User> }) => {
      const endpoint = `/user/${userId}`;

      return await axiosApiInstance
        .post(endpoint, userData)
        .then((response) => {
          return response.data as User;
        });
    },

    onSuccess: () => {
      if (enableToasts) {
        notification.success({
          message: `User updated successfully!`,
        });
      }
    },

    onError: (error: AxiosError<any>) => {
      notification.error({
        message: `An unexpected error occurred. Please try again later.`,
      });

      console.log(error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.user],
      });
    },
  });
}
