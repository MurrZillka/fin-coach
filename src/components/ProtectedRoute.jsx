import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import Loader from "./ui/Loader.jsx";

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, isInitializing } = useAuthStore();

    if (isInitializing) {
        return <Loader/>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}