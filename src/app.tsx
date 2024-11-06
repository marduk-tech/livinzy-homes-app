import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { App as AntApp, AppProps, ConfigProvider } from "antd";
import { FunctionComponent, useEffect } from "react";
import { queryClient } from "./libs/query-client";
import { Router } from "./routes/routes";
import { antTheme } from "./theme/ant-theme";
import "./theme/globals.scss";
import posthog from "posthog-js";
import { env, posthogkey } from "./libs/constants";

export const App: FunctionComponent<AppProps> = () => {
  useEffect(() => {
    if (env == "production") {
      posthog.init(posthogkey, {
        api_host: "https://us.i.posthog.com",
        person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
      });
    }
  });
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antTheme}>
        <AntApp style={{ maxWidth: 2000, margin: "auto" }}>
          <Router />
        </AntApp>
      </ConfigProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};
