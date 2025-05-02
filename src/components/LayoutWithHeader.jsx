import { useLocation, Routes, Route } from 'react-router-dom';
import Header from './Header.jsx';
import HeaderAuth from './HeaderAuth.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import routes from '../routes';

export default function LayoutWithHeader() {
    const location = useLocation();
    const AUTH_HEADER_PATHS = ['/login', '/signup', '/demo'];
    const useAuthHeader = AUTH_HEADER_PATHS.includes(location.pathname);

    return (
        <>
            {useAuthHeader ? <HeaderAuth /> : <Header />}
            <div className="min-h-screen bg-secondary-50">
                <Routes>
                    {routes.map((route, index) => (
                        <Route
                            key={index}
                            path={route.path}
                            element={
                                route.isProtected ? (
                                    <ProtectedRoute>{route.element}</ProtectedRoute>
                                ) : (
                                    route.element
                                )
                            }
                        />
                    ))}
                </Routes>
            </div>
        </>
    );
}