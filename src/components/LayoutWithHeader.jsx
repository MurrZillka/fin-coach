// src/components/LayoutWithHeader.jsx
import { useLocation, Routes, Route } from 'react-router-dom';
import Header from './Header.jsx';
import HeaderAuth from './HeaderAuth.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import routes from '../routes';
import useAuthStore from '../stores/authStore.js';
// --- ИЗМЕНЕНИЕ: Получаем submissionError из useModalStore ---
import useModalStore from '../stores/modalStore.js';
import Modal from './ui/Modal.jsx';
import ConfirmModal from './ui/ConfirmModal.jsx';
import BalanceWidget from './BalanceWidget.jsx';

export default function LayoutWithHeader() {
    const location = useLocation();
    console.log('LayoutWithHeader: Accessing useAuthStore');
    const { isAuthenticated } = useAuthStore();

    // Публичные страницы (без баланса и обычного хедера)
    const isAuthPage = ['/login', '/signup', '/demo'].includes(location.pathname);
    const showAuthHeader = isAuthPage;
    const showRegularHeader = isAuthenticated && !isAuthPage;

    // --- ИЗМЕНЕНИЕ: Получаем submissionError из useModalStore ---
    const { modalType, modalProps, closeModal, submissionError } = useModalStore();

    return (
        <div className="flex flex-col min-h-screen bg-secondary-50">
            {showAuthHeader && <HeaderAuth />}
            {showRegularHeader && <Header />}

            <div className="flex-grow overflow-y-auto relative z-0 max-w-7xl mx-auto px-4 py-4 w-full pb-36">
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

            {/* Футер с балансом: только если авторизован и не на публичной странице */}
            {isAuthenticated && !isAuthPage && (
                <div className="fixed bottom-2 left-0 right-0 z-10">
                    <div className="max-w-7xl mx-auto px-4">
                        <BalanceWidget />
                    </div>
                </div>
            )}

            {/* Модальные окна */}
            {modalType && (
                ['addCategory', 'editCategory', 'addCredit', 'editCredit', 'addSpending', 'editSpending', 'addGoal', 'editGoal'].includes(modalType) ? (
                    <Modal
                        isOpen={true}
                        onClose={closeModal} // closeModal из useModalStore, он сбрасывает и submissionError
                        {...modalProps}
                        // --- НОВОЕ: Передаем submissionError из стора в компонент Modal ---
                        submissionError={submissionError}
                    />
                ) : ['confirmDelete', 'confirmDeleteGoal', 'confirmSetCurrentGoal'].includes(modalType) ? (
                    <ConfirmModal
                        isOpen={true}
                        onClose={closeModal}
                        {...modalProps}
                    />
                ) : null
            )}
        </div>
    );
}