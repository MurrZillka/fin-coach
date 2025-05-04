//src/components/LayoutWithHeader.jsx
import { useLocation, Routes, Route } from 'react-router-dom';
import Header from './Header.jsx';
import HeaderAuth from './HeaderAuth.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import routes from '../routes';
import useAuthStore from '../stores/authStore.js';

import useModalStore from '../stores/modalStore.js';
import Modal from './ui/Modal.jsx';
import ConfirmModal from './ui/ConfirmModal.jsx';


export default function LayoutWithHeader() {
    const location = useLocation();
    const { isAuthenticated } = useAuthStore();

    const isAuthPage = ['/login', '/signup', '/demo'].includes(location.pathname);
    const showAuthHeader = isAuthPage;
    const showRegularHeader = isAuthenticated && !isAuthPage;

    const { modalType, modalProps, closeModal } = useModalStore();

    return (
        <div className="flex flex-col min-h-screen bg-secondary-50">
            {/* Header */}
            {showAuthHeader && <HeaderAuth />}
            {showRegularHeader && <Header />}

            {/* Main Content Area */}
            <div className="flex-grow overflow-y-auto relative z-0">
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

            {/* Modals */}
            {modalType && (
                modalType === 'addCategory' || modalType === 'editCategory' ? (
                    <Modal
                        isOpen={true}
                        onClose={closeModal}
                        {...modalProps}
                    />
                ) : modalType === 'confirmDelete' ? (
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