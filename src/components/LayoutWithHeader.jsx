// src/components/LayoutWithHeader.jsx
import { useLocation, Routes, Route } from 'react-router-dom';
import Header from './Header';
import HeaderAuth from './HeaderAuth';
import ProtectedRoute from './ProtectedRoute';
import ModalManager from './ModalManager';
import BalanceWidget from './BalanceWidget';
import ErrorBoundary from './ErrorBoundary';
import routes from '../routes';
import useAuthStore from '../stores/authStore';
import useBalanceStore from '../stores/balanceStore';

/**
 * Основной layout приложения: рендерит хедер, маршруты, футер с BalanceWidget и модалки.
 */
export default function LayoutWithHeader() {
    const location = useLocation();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const balanceLoading = useBalanceStore((state) => state.loading); // Проверка загрузки баланса
    const isAuthPage = ['/login', '/signup', '/demo'].includes(location.pathname);
    const header = isAuthPage ? <HeaderAuth /> : isAuthenticated ? <Header /> : null;

    return (
        <div className="flex flex-col min-h-screen bg-secondary-50">
            {header}
            <div className="flex-grow overflow-y-auto relative z-0 max-w-7xl mx-auto px-4 py-4 w-full pb-20">
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
            {isAuthenticated && !balanceLoading && ( // Показываем футер только после загрузки баланса
                <div className="fixed bottom-2 left-0 right-0 z-10 sm:bottom-4">
                    <div className="max-w-7xl mx-auto px-4">
                        <BalanceWidget />
                    </div>
                </div>
            )}
            <ErrorBoundary>
                <ModalManager />
            </ErrorBoundary>
        </div>
    );
}