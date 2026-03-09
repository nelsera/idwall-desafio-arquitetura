import { Navigate, Route, Routes } from "react-router-dom";

import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { LoginPage } from "@/pages/login/LoginPage";
import { RecommendationPage } from "@/pages/recommendation/RecommendationPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route
        path="/recommendations/:requestId"
        element={<RecommendationPage />}
      />
    </Routes>
  );
}