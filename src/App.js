import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AnimatedBackground from './components/AnimatedBackground';
import Layout from './components/Layout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SchedulePage from './pages/SchedulePage';
import PickupsPage from './pages/PickupsPage';
import PointsPage from './pages/PointsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import CollectorQueuePage from './pages/CollectorQueuePage';
import CollectorHistoryPage from './pages/CollectorHistoryPage';
import CollectorDashboardPage from './pages/CollectorDashboardPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminPickupsPage from './pages/AdminPickupsPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminCollectorsPage from './pages/AdminCollectorsPage';
import AdminRedemptionsPage from './pages/AdminRedemptionsPage';
import AdminApiKeysPage from './pages/AdminApiKeysPage';
import AdminPaymentsPage from './pages/AdminPaymentsPage';
import PaymentPage from './pages/PaymentPage';

// Protected route wrapper
const Protected = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
};

// Public route (redirect if logged in)
const Public = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'collector') return <Navigate to="/collector/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Landing page — default entry point */}
    <Route path="/" element={<LandingPage />} />

    {/* Auth */}
    <Route path="/login" element={<Public><LoginPage /></Public>} />
    <Route path="/register" element={<Public><RegisterPage /></Public>} />

    {/* Household */}
    <Route path="/dashboard" element={<Protected roles={['household']}><DashboardPage /></Protected>} />
    <Route path="/schedule" element={<Protected roles={['household']}><SchedulePage /></Protected>} />
    <Route path="/pickups" element={<Protected roles={['household']}><PickupsPage /></Protected>} />
    <Route path="/points" element={<Protected roles={['household']}><PointsPage /></Protected>} />
    <Route path="/leaderboard" element={<Protected><LeaderboardPage /></Protected>} />

    {/* Collector */}
    <Route path="/collector/dashboard" element={<Protected roles={['collector']}><CollectorDashboardPage /></Protected>} />
    <Route path="/collector/queue" element={<Protected roles={['collector']}><CollectorQueuePage /></Protected>} />
    <Route path="/collector/history" element={<Protected roles={['collector']}><CollectorHistoryPage /></Protected>} />

    {/* Admin */}
    <Route path="/admin/dashboard" element={<Protected roles={['admin']}><AdminDashboard /></Protected>} />
    <Route path="/admin/users" element={<Protected roles={['admin']}><AdminUsersPage /></Protected>} />
    <Route path="/admin/pickups" element={<Protected roles={['admin']}><AdminPickupsPage /></Protected>} />
    <Route path="/admin/analytics" element={<Protected roles={['admin']}><AdminAnalyticsPage /></Protected>} />
    <Route path="/admin/collectors" element={<Protected roles={['admin']}><AdminCollectorsPage /></Protected>} />
    <Route path="/admin/redemptions" element={<Protected roles={['admin']}><AdminRedemptionsPage /></Protected>} />
    <Route path="/admin/api-keys" element={<Protected roles={['admin']}><AdminApiKeysPage /></Protected>} />
    <Route path="/admin/payments" element={<Protected roles={['admin']}><AdminPaymentsPage /></Protected>} />

    {/* Household */}
    <Route path="/payments" element={<Protected roles={['household']}><PaymentPage /></Protected>} />

    {/* Shared */}
    <Route path="/notifications" element={<Protected><NotificationsPage /></Protected>} />
    <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedBackground />
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(20,10,40,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(147,51,234,0.3)',
              color: '#f0e6ff',
              fontFamily: 'Outfit, sans-serif',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#4ade80', secondary: '#0a0510' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#0a0510' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
