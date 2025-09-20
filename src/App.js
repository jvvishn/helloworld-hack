import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import ErrorBoundary from "./components/UI/ErrorBoundary";
import Layout from "./components/Layout/Layout";
import LoadingSpinner from "./components/UI/LoadingSpinner";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import GroupChat from "./pages/GroupChat";
import StudyMaterials from "./pages/StudyMaterials";
import PersonalChecklists from "./pages/PersonalChecklists";
import Settings from "./pages/Settings";

import "./App.css";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : children;
};

// App Content Component
const AppContent = () => {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <Layout user={user} onLogout={logout}>
            <Home />
          </Layout>
        }
      />

      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={logout}>
              <Dashboard user={user} />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/study-materials"
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={logout}>
              <StudyMaterials />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route 
        path="/checklists" 
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={logout}>
              <PersonalChecklists />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={logout}>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Temporary placeholder routes */}
      <Route
        path="/groups"
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={logout}>
              <div className="text-center py-20">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  My Groups
                </h1>
                <p className="text-gray-600">
                  Coming Soon - This will show your study groups
                </p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/find-groups"
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={logout}>
              <div className="text-center py-20">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Find Groups
                </h1>
                <p className="text-gray-600">
                  Coming Soon - This will help you find study groups
                </p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Real-time Chat Route */}
      <Route
        path="/group/:groupId"
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={logout}>
              <GroupChat />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route
        path="*"
        element={
          <Layout user={user} onLogout={logout}>
            <div className="text-center py-20">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Page Not Found
              </h1>
              <p className="text-gray-600">
                The page you're looking for doesn't exist.
              </p>
            </div>
          </Layout>
        }
      />
    </Routes>
  );
};

// Main App Component with ErrorBoundary
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;