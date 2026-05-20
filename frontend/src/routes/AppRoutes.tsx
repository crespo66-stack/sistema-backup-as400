import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "../store";
import DefaultLayout from "../components/layout/DefaultLayout";

// Pages
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import ForgotPasswordPage from "../features/auth/ForgotPasswordPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import JournalsPage from "../features/journals/JournalsPage";
import HistoryPage from "../features/history/HistoryPage";
import AlertsPage from "../features/alerts/AlertsPage";
import SettingsPage from "../features/settings/SettingsPage";
import HomePage from "../pages/HomePage";

// Route guard
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1e293b",
            color: "#f1f5f9",
            border: "1px solid #334155",
          },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

        {/* Protected */}
        <Route
          element={
            <PrivateRoute>
              <DefaultLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/journals" element={<JournalsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}