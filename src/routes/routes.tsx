import { Route, Routes } from "react-router-dom";

//Layouts
import { DashboardLayout } from "../layouts/dashboard-layout";

// Pages
import LandMeasurementConvertor from "../components/sides/land-measurement-convertor";
import { LivindexPlaces } from "../pages/livindex-places";
import { ProfilePage } from "../pages/profile-page";
import { SignUpForm } from "../pages/signup";
import UserSessions from "../pages/user-sessions";

import { LivV3 } from "../components/liv/liv-v3";
import LivProjectPro from "../components/liv-project-pro";
import { PropStar } from "../pages/prop-star";

export const Router = () => {
  return (
    <Routes>
      <Route
        path="/sides/unit-connvertor"
        element={<LandMeasurementConvertor />}
      />
      <Route element={<DashboardLayout />}>
        <Route path="/map" element={<LivindexPlaces />} />
        <Route path="/:sessionId?" element={<LivV3 />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/pro/:projectId?" element={<LivProjectPro />} />
        <Route path="/propstar/:lvnzyProjectId?" element={<PropStar />} />
        <Route path="/user-sessions" element={<UserSessions />} />
        <Route path="/*" element={<div>404</div>} />
      </Route>
      <Route path="/sign-up" element={<SignUpForm />} />
    </Routes>
  );
};
