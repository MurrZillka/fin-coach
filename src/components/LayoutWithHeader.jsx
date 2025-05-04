// src/components/LayoutWithHeader.jsx
// Удалены импорты useEffect и useBalanceStore, т.к. логика загрузки перенесена в App.jsx
import { useLocation, Routes, Route } from 'react-router-dom'; // useEffect удален из импорта
import Header from './Header.jsx';
import HeaderAuth from './HeaderAuth.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import routes from '../routes';
import useAuthStore from '../stores/authStore.js'; // Импортируем стор авторизации (нужен для isAuthenticated)

// --- ИМПОРТЫ МОДАЛОК И ВИДЖЕТА БАЛАНСА ---
import useModalStore from '../stores/modalStore.js';
import Modal from './ui/Modal.jsx';
import ConfirmModal from './ui/ConfirmModal.jsx';
// Убедись, что путь к BalanceWidget корректный
import BalanceWidget from './BalanceWidget.jsx'; // Импортируем компонент BalanceWidget
// --- Конец ИМПОРТОВ ---


export default function LayoutWithHeader() {
    const location = useLocation();
    // useBalanceStore больше не используется напрямую здесь, fetch вызывается из App.jsx
    // Получаем только isAuthenticated из стора авторизации
    const { isAuthenticated } = useAuthStore();

    const isAuthPage = ['/login', '/signup', '/demo'].includes(location.pathname);
    const showAuthHeader = isAuthPage;
    const showRegularHeader = isAuthenticated && !isAuthPage;

    const { modalType, modalProps, closeModal } = useModalStore();

    // useEffect для первичной загрузки Баланса находится в App.jsx!
    // Здесь его нет.

    return (
        <div className="flex flex-col min-h-screen bg-secondary-50">
            {/* Header */}
            {showAuthHeader && <HeaderAuth />}
            {showRegularHeader && <Header />}

            {/* Основная область контента страницы, которая прокручивается */}
            <div className="flex-grow overflow-y-auto relative z-0 max-w-7xl mx-auto px-4 py-4 w-full pb-20"> {/* pb-20 */}
                {/* Виджет Баланса удален из этой области */}

                {/* Здесь рендерятся маршруты */}
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

            {/* --- ФИКСИРОВАННЫЙ ФУТЕР С ВИДЖЕТОМ БАЛАНСА --- */}
            {/* Рендерим футер только если пользователь авторизован */}
            {/* fixed bottom-2 left-0 right-0 z-10 */}
            {isAuthenticated && ( // Условие рендеринга по isAuthenticated
                <div className="fixed bottom-2 left-0 right-0 z-10"> {/* bottom-2 */}
                    {/* Внутренний контейнер для центрирования и горизонтальных отступов */}
                    <div className="max-w-7xl mx-auto px-4">
                        {/* Сам компонент виджета Баланса */}
                        <BalanceWidget />
                    </div>
                </div>
            )}
            {/* --- Конец ФИКСИРОВАННОГО ФУТЕРА --- */}


            {/* Модальные окна */}
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