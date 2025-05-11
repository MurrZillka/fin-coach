import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, isInitializing } = useAuthStore();

    if (isInitializing) {
        return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}