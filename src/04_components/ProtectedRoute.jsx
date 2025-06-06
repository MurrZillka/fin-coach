import { Navigate } from 'react-router-dom';
import useAuthStore from '../02_stores/authStore/authStore.ts';
import Loader from "./ui/Loader.jsx";

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, status, user } = useAuthStore();

    console.log('🛡️ ProtectedRoute check:', {
        isAuthenticated,
        status,
        hasUser: !!user,
        path: window.location.pathname
    });

    if (status === 'initializing') {
        console.log('🔄 ProtectedRoute: Showing loader (initializing)');
        return <Loader/>;
    }

    if (!isAuthenticated) {
        console.log('❌ ProtectedRoute: Not authenticated, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    console.log('✅ ProtectedRoute: Authenticated, rendering children');
    return children;
}