// src/components/LayoutWithHeader.jsx
import {useLocation, Routes, Route} from 'react-router-dom';
import Header from './Header.jsx'; // Обычный хедер
import HeaderAuth from './HeaderAuth.jsx'; // Хедер для страниц авторизации
import ProtectedRoute from './ProtectedRoute.jsx';
import routes from '../routes';
import useAuthStore from '../stores/authStore.js';
import useModalStore from '../stores/modalStore.js';
import Modal from './ui/Modal.jsx';
import ConfirmModal from './ui/ConfirmModal.jsx';
import BalanceWidget from './BalanceWidget.jsx'; // Футер с балансом (уже фиксированный)

export default function LayoutWithHeader() {
    const location = useLocation();
    console.log('LayoutWithHeader: Accessing useAuthStore');
    const {isAuthenticated} = useAuthStore();

    // Определяем, какая шапка должна быть показана и является ли страница публичной
    const isAuthPage = ['/login', '/signup', '/demo'].includes(location.pathname);
    const showAuthHeader = isAuthPage; // Показываем HeaderAuth на страницах авторизации
    const showRegularHeader = isAuthenticated && !isAuthPage; // Показываем обычный Header, если авторизован и не на страницах авторизации

    // Получаем состояние модальных окон
    const {modalType, modalProps, closeModal, submissionError} = useModalStore();

    return (
        // Основной контейнер страницы. flex-col и min-h-screen задают колонку с минимальной высотой экрана
        <div className="flex flex-col min-h-screen bg-secondary-50">

            {/* --- ДОБАВЛЕНО: Фиксированный хедер контейнер --- */}
            {/* Этот div фиксирует блок шапки вверху экрана */}
            {/* fixed: позиционирование, top-0 left-0 right-0: растягивает по всей ширине вверху */}
            {/* z-10: устанавливает порядок наслоения (хедер выше контента) */}
            {/* w-full: убеждаемся, что занимает всю ширину */}
            {/* bg-white shadow-md: добавляем фон и тень, чтобы хедер был виден над контентом */}
            {(showAuthHeader || showRegularHeader) && ( // Рендерим фиксированный контейнер только если какая-то шапка должна быть видна
                <div className="fixed top-0 left-0 right-0 z-20 w-full bg-white shadow-md">
                    {showAuthHeader && <HeaderAuth/>} {/* Рендерим нужный хедер внутри */}
                    {showRegularHeader && <Header/>}
                </div>
            )}
            <div className="flex-grow relative overflow-y-auto z-0 max-w-7xl mx-auto px-4 mt-[64px] w-full min-h-[calc(100vh - 64px)]">
                {/* Здесь рендерятся страницы приложения через Routes */}
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

            {/* Футер с балансом: остается фиксированным внизу */}
            {isAuthenticated && !isAuthPage && (
                <div className="fixed bottom-2 left-0 right-0 z-10">
                    <div className="max-w-7xl mx-auto px-4">
                        <BalanceWidget/>
                    </div>
                </div>
            )}

            {/* Модальные окна (остаются без изменений) */}
            {modalType && (
                ['addCategory', 'editCategory', 'addCredit', 'editCredit', 'addSpending', 'editSpending', 'addGoal', 'editGoal'].includes(modalType) ? (
                    <Modal
                        isOpen={true}
                        onClose={closeModal}
                        {...modalProps}
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