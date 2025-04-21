import { Route, Routes } from "react-router-dom";

//Layouts
import { DashboardLayout } from "../layouts/dashboard-layout";

// Pages
import LandMeasurementConvertor from "../components/sides/land-measurement-convertor";
import { LivindexPlaces } from "../pages/livindex-places";
import { ProfilePage } from "../pages/profile-page";
import { SignUpForm } from "../pages/signup";
import UserSessions from "../pages/user-sessions";

import LivProjectPro from "../components/liv-project-pro";
import { Brick360 } from "../pages/brick360";
import { PaymentCallbackPage } from "../pages/payment-callback";
import { UserProjects } from "../pages/user-projects";
import { Brick360Full } from "../pages/brick360-full";

export const Router = () => {
  return (
    <Routes>
      <Route
        path="/sides/unit-connvertor"
        element={<LandMeasurementConvertor />}
      />
      <Route element={<DashboardLayout />}>
        <Route path="/map" element={<LivindexPlaces />} />
        {/* <Route path="/:sessionId?" element={<LivV3 />} /> */}
        <Route path="/" element={<UserProjects />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/pro/:projectId?" element={<LivProjectPro />} />
        <Route path="/brick360/:lvnzyProjectId?" element={<Brick360 />} />
        <Route
          path="/brick360-full/:lvnzyProjectId?"
          element={<Brick360Full />}
        />
        <Route path="/user-sessions" element={<UserSessions />} />
      </Route>

      <Route path="/payments/callback" element={<PaymentCallbackPage />} />

      <Route path="/*" element={<div>404</div>} />
      <Route path="/sign-up" element={<SignUpForm />} />
    </Routes>
  );
};
