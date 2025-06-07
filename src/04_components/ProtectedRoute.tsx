// src/02_components/ProtectedRoute/ProtectedRoute.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../02_stores/authStore/authStore';
import Loader from './ui/Loader.js';

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, status, user } = useAuthStore();

    console.log('🛡️ ProtectedRoute check:', {
        isAuthenticated,
        status,
        hasUser: !!user,
        path: window.location.pathname
    });

    if (status === 'initializing') {
        console.log('🔄 ProtectedRoute: Showing loader (initializing)');
        return <Loader />;
    }

    if (!isAuthenticated) {
        console.log('❌ ProtectedRoute: Not authenticated, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    console.log('✅ ProtectedRoute: Authenticated, rendering children');
    return children;
}
