import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { PermissionRoute } from "@/components/PermissionRoute";
import { PrivateRoute } from "@/components/PrivateRoute";
import { AuthProvider } from "@/context/AuthContext";
import { AppLayout } from "@/layouts/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { EvaluationPage } from "@/pages/EvaluationPage";
import { LoginPage } from "@/pages/LoginPage";
import { HistoryDetailPage } from "@/pages/HistoryDetailPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { SupportPage } from "@/pages/SupportPage";
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
                  <PermissionRoute module="dashboard">
                    <DashboardPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/evaluation"
                element={
                  <PermissionRoute module="evaluation">
                    <EvaluationPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/evaluation/result"
                element={
                  <PermissionRoute module="evaluation">
                    <PredictionResultPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/simulation"
                element={
                  <PermissionRoute module="simulation">
                    <SimulationPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <PermissionRoute module="history">
                    <HistoryPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/history/:predictionId"
                element={
                  <PermissionRoute module="history">
                    <HistoryDetailPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <PermissionRoute module="analytics">
                    <AnalyticsPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PermissionRoute module="settings">
                    <SettingsPage />
                  </PermissionRoute>
                }
              />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
