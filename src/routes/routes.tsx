import { Route, Routes } from "react-router-dom";

//Layouts
import { DashboardLayout } from "../layouts/dashboard-layout";

// Pages
import LandMeasurementConvertor from "../components/sides/land-measurement-convertor";
import { ProfilePage } from "../pages/profile-page";
import { SignUpForm } from "../pages/signup";
import UserSessions from "../pages/user-sessions";

import LivProjectPro from "../components/liv-project-pro";
import { PaymentCallbackPage } from "../pages/payment-callback";
import { Brick360Full } from "../pages/brick360-full";
import { useUser } from "../hooks/use-user";
import { useEffect } from "react";
import posthog from "posthog-js";
import { posthogkey } from "../libs/constants";
import { MainLanding } from "../pages/landing/main-landing";
import BrickfiHome from "../pages/brickfi-home";
import { AboutUs } from "../pages/landing/about-us";
import { LivIndexFull } from "../components/map-view/map-old/liv-index-all/livindex-full";

export const Router = () => {
  const { user, isLoading: userLoading } = useUser();

  useEffect(() => {
    if (user && user._id) {
      console.log(user);
      posthog.init(posthogkey, {
        api_host: "https://us.i.posthog.com",
        person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
      });

      posthog.identify(user._id, {
        countryCode: user.countryCode,
      });
    }
  }, [user]);
  return (
    <Routes>
      <Route
        path="/sides/unit-connvertor"
        element={<LandMeasurementConvertor />}
      />
      <Route path="/" element={<MainLanding />} />
      <Route path="/aboutus" element={<AboutUs />} />
      <Route element={<DashboardLayout />}>
        <Route path="/app/map-view-345" element={<LivIndexFull />} />
        <Route path="/app" element={<BrickfiHome />} />
        <Route path="/app/profile" element={<ProfilePage />} />
        <Route path="/pro/:projectId?" element={<LivProjectPro />} />
        <Route
          path="/app/brick360/:lvnzyProjectId?"
          element={<BrickfiHome />}
        />
        <Route
          path="/app/brick360-full/:lvnzyProjectId?"
          element={<Brick360Full />}
        />
        <Route path="/app/user-sessions" element={<UserSessions />} />
      </Route>

      <Route path="/app/payments/callback" element={<PaymentCallbackPage />} />

      <Route path="/*" element={<div>404</div>} />
      <Route path="/app/sign-up" element={<SignUpForm />} />
    </Routes>
  );
};
