import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles } from 'lucide-react';

export default function AuthLayout() {
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Sparkles className="w-12 h-12 text-white" />
          <h1 className="text-3xl font-bold text-white ml-2">WinnerMind</h1>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}