import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Page imports
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Community from './pages/Community';
import Profile from './pages/Profile';
import AICoach from './pages/AICoach';
import Programs from './pages/Programs';
import AdminDashboard from './pages/admin/Dashboard';
import AdminChallenges from './pages/admin/Challenges';
import AdminPrograms from './pages/admin/Programs';
import AdminSettings from './pages/admin/Settings';

// Layout imports
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import AdminRoute from './components/AdminRoute';

// Context imports
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoute><AppLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="challenges" element={<AdminChallenges />} />
              <Route path="programs" element={<AdminPrograms />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Protected routes */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/ai-coach" element={<AICoach />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/community" element={<Community />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}