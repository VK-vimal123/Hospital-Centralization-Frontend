import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import MainLayout from './layouts/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import QRScanPage from './pages/QRScanPage';

// Pages
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import EquipmentDetails from './pages/EquipmentDetails';
import Cycles from './pages/Cycles';
import EquipmentLogs from './pages/EquipmentLogs';
import Maintenance from './pages/Maintenance';
import Compliance from './pages/Compliance';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (allowedRoles) {
        const hasRole = allowedRoles.some(role => role.toLowerCase() === user.role?.toLowerCase());
        if (!hasRole) {
            return <Navigate to="/login" replace />;
        }
    }
    return children;
};

// Helper array to render all standard routes for a role
const standardRoutes = [
    <Route key="dashboard" path="dashboard" element={<Dashboard />} />,
    <Route key="equipment" path="equipment" element={<Equipment />} />,
    <Route key="equipment-details" path="equipment/:id" element={<EquipmentDetails />} />,
    <Route key="cycles" path="cycles" element={<Cycles />} />,
    <Route key="equipment-logs" path="equipment-logs" element={<EquipmentLogs />} />,
    <Route key="maintenance" path="maintenance" element={<Maintenance />} />,
    <Route key="compliance" path="compliance" element={<Compliance />} />,
    <Route key="reports" path="reports" element={<Reports />} />,
    <Route key="notifications" path="notifications" element={<Notifications />} />,
    <Route key="users" path="users" element={<UserManagement />} />,
    <Route key="settings" path="settings" element={<Settings />} />,
];

export default function App() {
    return (
        <ErrorBoundary>
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout /></ProtectedRoute>}>
                {standardRoutes}
            </Route>

            {/* Staff Routes */}
            <Route path="/staff" element={<ProtectedRoute allowedRoles={['Sterilization Staff']}><MainLayout /></ProtectedRoute>}>
                {standardRoutes}
            </Route>

            {/* Supervisor Routes */}
            <Route path="/supervisor" element={<ProtectedRoute allowedRoles={['Supervisor']}><MainLayout /></ProtectedRoute>}>
                {standardRoutes}
            </Route>

            {/* Maintenance Routes */}
            <Route path="/maintenance" element={<ProtectedRoute allowedRoles={['Maintenance Staff']}><MainLayout /></ProtectedRoute>}>
                {standardRoutes}
            </Route>

            {/* Public QR Scan route — no auth required */}
            <Route path="/qr-scan/:equipment_id" element={<QRScanPage />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </ErrorBoundary>
    );
}
