import { Route, Routes } from "react-router-dom";

//Layouts
import { DashboardLayout } from "../layouts/dashboard-layout";

// Pages
import LandMeasurementConvertor from "../components/sides/land-measurement-convertor";
import { LivindexPlaces } from "../pages/livindex-places";
import { LivIQPage } from "../pages/liviq-page";
import { ProfilePage } from "../pages/profile-page";
import { SignUpForm } from "../pages/signup";

export const Router = () => {
  return (
    <Routes>
      <Route
        path="/sides/unit-connvertor"
        element={<LandMeasurementConvertor />}
      />
      <Route element={<DashboardLayout />}>
        <Route path="/livindex-places" element={<LivindexPlaces />} />
        <Route path="/" element={<LivIQPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/*" element={<div>404</div>} />{" "}
      </Route>
      <Route path="/sign-up" element={<SignUpForm />} />
    </Routes>
  );
};
