import { Route, Routes } from "react-router-dom";

//Layouts
// import { AuthenticationGuard } from "../components/auth/authentication-guard";
// import { DashboardLayout } from "../layouts/dashboard-layout";
import { HomePage } from "../pages/home-page";
import ProjectPage from "../pages/project-page";

// Pages

export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/project" element={<ProjectPage />} />
      <Route path="/*" element={<div>404</div>} />
    </Routes>
  );
};
