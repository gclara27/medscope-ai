import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { PrivateRoute } from "@/components/PrivateRoute";
import { RoleRoute } from "@/components/RoleRoute";
import { AuthProvider } from "@/context/AuthContext";
import { AppLayout } from "@/layouts/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              <Route
                path="/dashboard"
                element={
                  <RoleRoute
                    allowedRoles={[
                      "admin",
                      "clinician",
                      "analyst",
                      "nurse",
                    ]}
                  >
                    <DashboardPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/evaluation"
                element={
                  <RoleRoute allowedRoles={["admin", "clinician"]}>
                    <PlaceholderPage
                      title="Clinical Evaluation"
                      description="Enter patient data and generate AI readmission risk predictions."
                    />
                  </RoleRoute>
                }
              />
              <Route
                path="/simulation"
                element={
                  <RoleRoute allowedRoles={["admin", "clinician"]}>
                    <PlaceholderPage
                      title="Clinical Simulation"
                      description="Run what-if scenarios and compare risk outcomes."
                    />
                  </RoleRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <RoleRoute allowedRoles={["admin", "clinician", "nurse"]}>
                    <PlaceholderPage
                      title="Prediction History"
                      description="Review past evaluations and risk assessments."
                    />
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
