import { Route, Routes } from "react-router-dom";

//Layouts
import { DashboardLayout } from "../layouts/dashboard-layout";

// Pages
import { useUser } from "../hooks/use-user";
import AskPage from "../pages/ask-page";
import { HomePage } from "../pages/home-page";
import ProjectPage from "../pages/project-page";
import { ProfilePage } from "../pages/profile-page";

export const Router = () => {
  const { user, isError } = useUser();

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<HomePage></HomePage>} />
        <Route path="/project/:projectId" element={<ProjectPage />} />
        <Route path="/ask" element={<AskPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/*" element={<div>404</div>} />{" "}
      </Route>
    </Routes>
  );
};
