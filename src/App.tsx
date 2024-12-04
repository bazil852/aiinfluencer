import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import DashboardPage from './pages/DashboardPage';
import ContentPage from './pages/ContentPage';
import SettingsPage from './pages/SettingsPage';
import ContentPlannerPage from './pages/ContentPlannerPage';
import Chatbot from './components/Chatbot';
import ApiSetupModal from './components/ApiSetupModal';
import { useAuthStore } from './store/authStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.currentUser);
  const [showApiSetup, setShowApiSetup] = React.useState(false);

  React.useEffect(() => {
    if (user && (!user.openaiApiKey || !user.heygenApiKey)) {
      setShowApiSetup(true);
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      {children}
      {showApiSetup && <ApiSetupModal onClose={() => setShowApiSetup(false)} />}
    </>
  );
}

function App() {
  const user = useAuthStore((state) => state.currentUser);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="content/:id"
            element={
              <ProtectedRoute>
                <ContentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="planner"
            element={
              <ProtectedRoute>
                <ContentPlannerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
      {user && <Chatbot />}
    </BrowserRouter>
  );
}

export default App;