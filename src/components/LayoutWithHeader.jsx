// src/components/LayoutWithHeader.jsx
import {useLocation, Routes, Route} from 'react-router-dom';
import Header from './Header.jsx';
import HeaderAuth from './HeaderAuth.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import routes from '../routes';
import useAuthStore from '../stores/authStore.js';
import useModalStore from '../stores/modalStore.js';
import Modal from './ui/Modal.jsx';
import ConfirmModal from './ui/ConfirmModal.jsx';
import ReminderModal from './ui/ReminderModal.jsx'; // Убедимся, что ReminderModal импортирован
import BalanceWidget from './widgets/BalanceWidget.jsx';

export default function LayoutWithHeader() {
    const location = useLocation();
    console.log('LayoutWithHeader: Accessing useAuthStore');
    const {isAuthenticated} = useAuthStore();

    const isAuthPage = ['/login', '/signup', '/demo'].includes(location.pathname);
    const showAuthHeader = isAuthPage;
    const showRegularHeader = isAuthenticated && !isAuthPage;

    // Получаем состояние модальных окон
    const {modalType, modalProps, closeModal, submissionError} = useModalStore();

    // Логи для отладки
    console.log('LayoutWithHeader: RENDERING. Current modalType in store:', modalType);
    console.log('LayoutWithHeader: Current modalProps in store:', modalProps);

    const validPaths = routes
        .filter(route => route.path !== '*')
        .map(route => route.path);

    const isNotFoundPage = !validPaths.includes(location.pathname);

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

            {/* Модальные окна: КОРРЕКТНЫЙ РЕНДЕРИНГ */}
            {modalType && (
                // Если тип модалки для форм (использует универсальный Modal.jsx)
                ['addCategory', 'editCategory', 'addCredit', 'editCredit', 'addSpending', 'editSpending', 'addGoal', 'editGoal'].includes(modalType) ? (
                        <Modal
                            isOpen={true}
                            onClose={closeModal}
                            {...modalProps}
                            submissionError={submissionError}
                        />
                    ) : // Если тип модалки - 'reminderNotification' (использует ReminderModal.jsx)
                    modalType === 'reminderNotification' ? (
                            <ReminderModal
                                modalProps={modalProps}
                            />
                        ) : // Если тип модалки для подтверждения (использует ConfirmModal.jsx)
                        ['confirmDelete', 'confirmDeleteGoal', 'confirmSetCurrentGoal'].includes(modalType) ? (
                            // ConfirmModal требует пропсы напрямую, а не через modalProps={}
                            // Если modalProps содержит все нужные пропсы, просто разворачиваем их.
                            <ConfirmModal
                                isOpen={true} // ConfirmModal использует проп isOpen, который мы передаем явно
                                onClose={closeModal}
                                onConfirm={modalProps.onConfirm}
                                title={modalProps.title}
                                message={modalProps.message}
                                confirmText={modalProps.confirmText}
                                // Если ConfirmModal также принимает cancelText, передай его здесь
                                // cancelText={modalProps.cancelText}
                            />
                        ) : null
            )}
        </div>
    );
}