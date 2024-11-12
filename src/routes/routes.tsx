import { Route, Routes } from "react-router-dom";

//Layouts
import { DashboardLayout } from "../layouts/dashboard-layout";

// Pages
import LandMeasurementConvertor from "../components/sides/land-measurement-convertor";
import { useUser } from "../hooks/use-user";
import AskPage from "../pages/ask-page";
import { HomePage } from "../pages/home-page";
import { ProfilePage } from "../pages/profile-page";
import ProjectPage from "../pages/project-page";
import { SignUpForm } from "../pages/signup";

export const Router = () => {
  const { user, isError } = useUser();

  return (
    <Routes>
      <Route
        path="/sides/unit-connvertor"
        element={<LandMeasurementConvertor />}
      />
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<HomePage></HomePage>} />
        <Route path="/project/:projectId" element={<ProjectPage />} />
        <Route path="/ask" element={<AskPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/*" element={<div>404</div>} />{" "}
      </Route>
      <Route path="/sign-up" element={<SignUpForm />} />
    </Routes>
  );
};
