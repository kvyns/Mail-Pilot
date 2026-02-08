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

// Dashboard pages
import Overview from '../pages/Dashboard/Overview';
import Users from '../pages/Dashboard/Users';
import InviteUser from '../pages/Users/InviteUser';
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
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
        <Route path="/dashboard/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/dashboard/users/invite" element={<ProtectedRoute><InviteUser /></ProtectedRoute>} />
        <Route path="/dashboard/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
        <Route path="/dashboard/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
        <Route path="/dashboard/templates/:id" element={<ProtectedRoute><TemplateEditor /></ProtectedRoute>} />
        <Route path="/dashboard/credits" element={<ProtectedRoute><Credits /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        
        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
