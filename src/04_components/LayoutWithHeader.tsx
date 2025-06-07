// src/components/LayoutWithHeader.tsx
import {Navigate, Route, Routes, useLocation} from 'react-router-dom';
import Header from './Header';
import HeaderAuth from './HeaderAuth';
import ProtectedRoute from './ProtectedRoute';
import routes from '../06_routes'; // Предполагаем, что routes типизированы
import useAuthStore from '../02_stores/authStore/authStore';
import useModalStore from '../02_stores/modalStore/modalStore';
import Modal from './ui/Modals/Modal';
import ConfirmModal from './ui/Modals/ConfirmModal/ConfirmModal';
import ReminderModal from './ui/Modals/ReminderModal/ReminderModal';
import BalanceWidget from './widgets/BalanceWidget';

export default function LayoutWithHeader(): React.JSX.Element {
    const location = useLocation();
    const { isAuthenticated } = useAuthStore();
    const { modalType, modalProps, closeModal, submissionError } = useModalStore();

    // ✅ Редирект авторизованных с публичных страниц
    if (isAuthenticated && ['/login', '/signup', '/demo'].includes(location.pathname)) {
        console.log('🔀 Redirecting authenticated user from', location.pathname, 'to /main');
        return <Navigate to="/main" replace />;
    }

    const isAuthPage = ['/login', '/signup', '/demo'].includes(location.pathname);
    const showAuthHeader = isAuthPage;
    const showRegularHeader = isAuthenticated && !isAuthPage;

    const validPaths = routes
        .filter(route => route.path !== '*')
        .map(route => route.path);

    const isNotFoundPage = !validPaths.includes(location.pathname);

    const renderModal = (): React.JSX.Element | null => {
        if (!modalType) return null;

        const formModals = ['addCategory', 'editCategory', 'addCredit', 'editCredit', 'addSpending', 'editSpending', 'addGoal', 'editGoal'];
        const confirmModals = ['confirmDelete', 'confirmDeleteGoal', 'confirmSetCurrentGoal'];

        if (formModals.includes(modalType)) {
            return (
                <Modal
                    isOpen={true}
                    onClose={closeModal}
                    {...modalProps}
                    submissionError={submissionError}
                />
            );
        }

        if (modalType === 'reminderNotification') {
            return (
                <ReminderModal
                    modalProps={modalProps}
                />
            );
        }

        if (confirmModals.includes(modalType)) {
            return (
                <ConfirmModal
                    isOpen={true}
                    onClose={closeModal}
                    onConfirm={modalProps.onConfirm}
                    title={modalProps.title}
                    message={modalProps.message}
                    confirmText={modalProps.confirmText}
                />
            );
        }

        return null;
    };

    return (
        <div className="flex flex-col bg-secondary-50 min-h-screen pb-28">
            {(showAuthHeader || showRegularHeader) && (
                <div className="fixed top-0 left-0 right-0 z-20 w-full bg-white shadow-md">
                    {showAuthHeader && <HeaderAuth />}
                    {showRegularHeader && <Header />}
                </div>
            )}
            <div className="overflow-y-auto max-w-7xl mx-auto mt-[64px] w-full h-[calc(100% - 64px)]">
                <Routes>
                    {routes.map((route, index) => (
                        <Route
                            key={index}
                            path={route.path}
                            element={
                                route.isProtected
                                    ? <ProtectedRoute>{route.element}</ProtectedRoute>
                                    : route.element
                            }
                        />
                    ))}
                </Routes>
            </div>

            {isAuthenticated && !isAuthPage && !isNotFoundPage && (
                <div className="fixed bottom-2 left-0 right-0 z-10">
                    <div className="max-w-7xl mx-auto px-4">
                        <BalanceWidget />
                    </div>
                </div>
            )}
            {renderModal()}
        </div>
    );
}
