import { Route, Routes } from "react-router-dom";

//Layouts
import { DashboardLayout } from "../layouts/dashboard-layout";

// Pages
import AskPage from "../pages/ask-page";
import { HomePage } from "../pages/home-page";
import ProjectPage from "../pages/project-page";
import { useUser } from "../hooks/use-user";
import { LoginPage } from "../pages/login-page";

export const Router = () => {
  const { user, isError } = useUser();

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={user ? <HomePage /> : <LoginPage />} />
        <Route path="/project/:projectId" element={<ProjectPage />} />
        <Route path="/ask" element={<AskPage />} />
        <Route path="/*" element={<div>404</div>} />{" "}
      </Route>
    </Routes>
  );
};
