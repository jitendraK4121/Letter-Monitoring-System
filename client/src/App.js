import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import UserDashboard from './components/dashboard/UserDashboard';
import SSMDashboard from './components/dashboard/SSMDashboard';
import GMDashboard from './components/dashboard/GMDashboard';
import './App.css';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('username');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const DashboardRoute = () => {
  const userRole = localStorage.getItem('userRole');
  const username = localStorage.getItem('username');

  if (!username) {
    return <Navigate to="/login" />;
  }

  switch (userRole) {
    case 'ssm':
      return <SSMDashboard />;
    case 'gm':
      return <GMDashboard />;
    case 'user':
    default:
      return <UserDashboard />;
  }
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardRoute />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App; 