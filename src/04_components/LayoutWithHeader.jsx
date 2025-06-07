// src/components/LayoutWithHeader.jsx
import {Navigate, Route, Routes, useLocation} from 'react-router-dom';
import Header from './Header.jsx';
import HeaderAuth from './HeaderAuth.jsx';
import ProtectedRoute from './ProtectedRoute.tsx';
import routes from '../06_routes/index.js';
import useAuthStore from '../02_stores/authStore/authStore.ts';
import useModalStore from '../02_stores/modalStore.js';
import Modal from './ui/Modals/Modal.jsx';
import ConfirmModal from './ui/Modals/ConfirmModal.jsx';
import ReminderModal from './ui/Modals/ReminderModal.jsx'; // Убедимся, что ReminderModal импортирован
import BalanceWidget from './widgets/BalanceWidget.jsx';

export default function LayoutWithHeader() {
    const location = useLocation();
    const {isAuthenticated} = useAuthStore();
    const {modalType, modalProps, closeModal, submissionError} = useModalStore();

    // ✅ Добавь редирект авторизованных с публичных страниц
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

    const renderModal = () => {
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
                    {showAuthHeader && <HeaderAuth/>}
                    {showRegularHeader && <Header/>}
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
                        <BalanceWidget/>
                    </div>
                </div>
            )}
            {renderModal()}
        </div>
    );
}