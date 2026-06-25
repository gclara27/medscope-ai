import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { PrivateRoute } from "@/components/PrivateRoute";
import { RoleRoute } from "@/components/RoleRoute";
import { AuthProvider } from "@/context/AuthContext";
import { AppLayout } from "@/layouts/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { EvaluationPage } from "@/pages/EvaluationPage";
import { LoginPage } from "@/pages/LoginPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { SimulationPage } from "@/pages/SimulationPage";
import { PredictionResultPage } from "@/pages/PredictionResultPage";
import { SplashPage } from "@/pages/SplashPage";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              <Route
                path="/dashboard"
                element={
                  <RoleRoute
                    allowedRoles={["admin", "clinician", "analyst", "nurse"]}
                  >
                    <DashboardPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/evaluation"
                element={
                  <RoleRoute allowedRoles={["admin", "clinician"]}>
                    <EvaluationPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/evaluation/result"
                element={
                  <RoleRoute allowedRoles={["admin", "clinician"]}>
                    <PredictionResultPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/simulation"
                element={
                  <RoleRoute allowedRoles={["admin", "clinician"]}>
                    <SimulationPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <RoleRoute allowedRoles={["admin", "clinician", "nurse"]}>
                    <HistoryPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <RoleRoute allowedRoles={["admin", "analyst"]}>
                    <PlaceholderPage
                      title="Population Analytics"
                      description="Explore aggregated metrics, trends, and cohort insights."
                    />
                  </RoleRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <RoleRoute allowedRoles={["admin"]}>
                    <PlaceholderPage
                      title="System Settings"
                      description="Manage users, roles, and platform configuration."
                    />
                  </RoleRoute>
                }
              />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
