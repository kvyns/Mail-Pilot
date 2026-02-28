import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Public pages
import Landing from '../pages/Landing';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import SelectAccount from '../pages/Auth/SelectAccount';
import ActivateAccount from '../pages/Users/ActivateAccount';
import Confirmation from '../pages/Payment/Confirmation';
import Cancel from '../pages/Payment/Cancel';

// Dashboard pages
import Overview from '../pages/Dashboard/Overview';
import Users from '../pages/Dashboard/Users';
import Team from '../pages/Dashboard/Team';
import Campaigns from '../pages/Dashboard/Campaigns';
import Templates from '../pages/Dashboard/Templates';
import TemplateEditor from '../pages/Dashboard/TemplateEditor';
import Credits from '../pages/Dashboard/Credits';
import Settings from '../pages/Dashboard/Settings';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/select-account" element={<SelectAccount />} />
        <Route path="/activate" element={<ActivateAccount />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/cancel" element={<Cancel />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute requiredPermission="view:overview"><Overview /></ProtectedRoute>} />
        <Route path="/dashboard/users" element={<ProtectedRoute requiredPermission="view:users"><Users /></ProtectedRoute>} />
        <Route path="/dashboard/team" element={<ProtectedRoute requiredPermission="view:team"><Team /></ProtectedRoute>} />
        <Route path="/dashboard/campaigns" element={<ProtectedRoute requiredPermission="view:campaigns"><Campaigns /></ProtectedRoute>} />
        <Route path="/dashboard/templates" element={<ProtectedRoute requiredPermission="view:templates"><Templates /></ProtectedRoute>} />
        <Route path="/dashboard/templates/:id" element={<ProtectedRoute requiredPermission="manage:templates"><TemplateEditor /></ProtectedRoute>} />
        <Route path="/dashboard/credits" element={<ProtectedRoute requiredPermission="view:credits"><Credits /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute requiredPermission="view:settings"><Settings /></ProtectedRoute>} />
        
        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
