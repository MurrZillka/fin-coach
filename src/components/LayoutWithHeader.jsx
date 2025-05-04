// src/components/LayoutWithHeader.jsx
import { useLocation, Routes, Route } from 'react-router-dom';
import Header from './Header.jsx'; // Убедись, что путь правильный
import HeaderAuth from './HeaderAuth.jsx'; // Убедись, что путь правильный
import ProtectedRoute from './ProtectedRoute.jsx'; // Убедись, что путь правильный
import routes from '../routes'; // Убедись, что путь правильный
import useAuthStore from '../stores/authStore.js'; // Импортируем стор авторизации

// --- НОВЫЕ ИМПОРТЫ ---
import useModalStore from '../stores/modalStore.js';
import Modal from './ui/Modal.jsx'; // Убедись, что путь к Modal.jsx правильный
import ConfirmModal from './ui/ConfirmModal.jsx'; // Убедись, что путь к ConfirmModal.jsx правильный
// --- Конец НОВЫХ ИМПОРТОВ ---


export default function LayoutWithHeader() {
    const location = useLocation();
    const { isAuthenticated } = useAuthStore();

    const isAuthPage = ['/login', '/signup', '/demo'].includes(location.pathname); // Пути для HeaderAuth
    const showAuthHeader = isAuthPage;
    const showRegularHeader = isAuthenticated && !isAuthPage; // Обычный хедер для авторизованных вне AuthPage

    const { modalType, modalProps, closeModal } = useModalStore();


    return (
        // Главный контейнер layout - используем Flexbox для расположения элементов по вертикали.
        // min-h-screen гарантирует, что даже при коротком контенте фон будет на всю высоту вьюпорта.
        <div className="flex flex-col min-h-screen bg-secondary-50"> {/* Flex column */}
            {/* --- ХЕДЕР --- */}
            {/* Оборачиваем хедеры в div с flex-shrink-0. */}
            {/* ВАЖНО: Сами компоненты <Header /> и <HeaderAuth /> ДОЛЖНЫ иметь определенную высоту */}
            {/* в своем CSS, например: class="h-16" (height: 4rem / 64px) или явно height: ...px */}
            {showAuthHeader && <div className="flex-shrink-0"><HeaderAuth /></div>}
            {showRegularHeader && <div className="flex-shrink-0"><Header /></div>}
            {/* ------------- */}

            {/* --- ОСНОВНАЯ ОБЛАСТЬ КОНТЕНТА СТРАНИЦЫ --- */}
            {/* Этот div будет растягиваться (flex-grow: 1), чтобы занять всё оставшееся место под хедерами. */}
            {/* overflow-y-auto добавит скролл ТОЛЬКО если контент внутри превысит доступную высоту. */}
            {/* relative z-0 может помочь со stacking context, но может быть не обязателен с Flexbox. */}
            <div className="flex-grow overflow-y-auto relative z-0"> {/* Flex grow и overflow */}
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
            {/* -------------------------------------- */}


            {/* --- МЕСТО ДЛЯ МОДАЛЬНЫХ ОКОН (РЕНДЕРИНГ НА ОСНОВЕ СТОРА) --- */}
            {/* Модальные окна рендерятся здесь, как "соседи" основного контентного div. */}
            {/* Их position: fixed будет работать правильно относительно вьюпорта. */}
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
            {/* --- Конец МЕСТА ДЛЯ МОДАЛЬНЫХ ОКОН --- */}

        </div>
    );
}