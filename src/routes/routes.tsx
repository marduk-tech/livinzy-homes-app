import { Route, Routes } from "react-router-dom";

//Layouts
import { DashboardLayout } from "../layouts/dashboard-layout";

// Pages
import { HomePage } from "../pages/home-page";
import ProjectPage from "../pages/project-page";
import AskPage from "../pages/ask-page";

export const Router = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/project" element={<ProjectPage />} />
        <Route path="/ask" element={<AskPage />} />
        <Route path="/*" element={<div>404</div>} />{" "}
      </Route>
    </Routes>
  );
};
