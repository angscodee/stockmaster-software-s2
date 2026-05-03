import React from 'react';
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated } = useAuthStore();

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Compatibilidad: el backend puede haber guardado 'role' o 'rol'
    const userRole = user.rol || (user as any).role;

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />; // Or to an unauthorized page if available
    }

    return <Outlet />;
}
