// src/components/LayoutWithHeader.jsx
// Удалены импорты useEffect и useBalanceStore, т.к. логика загрузки перенесена в App.jsx
// Импортируем компоненты и хуки React Router
import { useLocation, Routes, Route } from 'react-router-dom'; // useEffect удален из импорта
// Импортируем компоненты хедера
import Header from './Header.jsx';
import HeaderAuth from './HeaderAuth.jsx';
// Импортируем компонент ProtectedRoute для защиты маршрутов
import ProtectedRoute from './ProtectedRoute.jsx';
// Импортируем массив с определениями маршрутов
import routes from '../routes';
// Импортируем стор авторизации (нужен для isAuthenticated)
import useAuthStore from '../stores/authStore.js';

// --- ИМПОРТЫ МОДАЛОК И ВИДЖЕТА БАЛАНСА ---
// Импортируем стор модальных окон
import useModalStore from '../stores/modalStore.js';
// Импортируем компоненты модальных окон
import Modal from './ui/Modal.jsx';
import ConfirmModal from './ui/ConfirmModal.jsx';
// Импортируем компонент виджета Баланса
// Убедись, что путь к BalanceWidget корректный
import BalanceWidget from './BalanceWidget.jsx';
// --- Конец ИМПОРТОВ ---


export default function LayoutWithHeader() {
    // Получаем объект location для определения текущего пути
    const location = useLocation();
    // useBalanceStore больше не используется напрямую здесь, fetch вызывается из App.jsx
    // Получаем только isAuthenticated из стора авторизации
    const { isAuthenticated } = useAuthStore();

    // Определяем, нужно ли показывать хедер для страниц без авторизации
    const isAuthPage = ['/login', '/signup', '/demo'].includes(location.pathname);
    const showAuthHeader = isAuthPage;
    // Определяем, нужно ли показывать обычный хедер (для авторизованных пользователей на защищенных страницах)
    const showRegularHeader = isAuthenticated && !isAuthPage;

    // Получаем состояние модалов и действие закрытия из стора модальных окон
    const { modalType, modalProps, closeModal } = useModalStore();

    // useEffect для первичной загрузки Баланса находится в App.jsx!
    // Здесь его нет.

    return (
        // Главный контейнер лейаута: flex-колонка, занимает мин. высоту экрана, фон светло-серый
        <div className="flex flex-col min-h-screen bg-secondary-50">
            {/* Header: рендерим один из хедеров в зависимости от условий */}
            {showAuthHeader && <HeaderAuth />}
            {showRegularHeader && <Header />}

            {/* Основная область контента страницы, которая прокручивается */}
            {/* flex-grow: занимает всё доступное пространство по вертикали, прижимая футер вниз */}
            {/* overflow-y-auto: позволяет прокручивать контент, если он не помещается */}
            {/* relative z-0: для позиционирования и z-index */}
            {/* max-w-7xl mx-auto: центрирует контент и ограничивает его ширину */}
            {/* px-4 py-4: внутренние горизонтальные и вертикальные отступы */}
            {/* w-full: занимает всю ширину родителя */}
            {/* pb-20: нижний отступ, чтобы контент не перекрывался фиксированным футером */}
            <div className="flex-grow overflow-y-auto relative z-0 max-w-7xl mx-auto px-4 py-4 w-full pb-20"> {/* pb-20 */}
                {/* Виджет Баланса удален из этой области */}

                {/* Здесь рендерятся маршруты приложения с использованием Routes и Route */}
                <Routes>
                    {/* Маппим массив маршрутов из src/routes/index.jsx в компоненты Route */}
                    {routes.map((route, index) => (
                        <Route
                            key={index} // Ключ для React
                            path={route.path} // Путь маршрута (например, '/credits', '/categories')
                            element={
                                // Если маршрут защищен (isProtected === true)
                                route.isProtected ? (
                                    // Оборачиваем компонент страницы в ProtectedRoute
                                    <ProtectedRoute>{route.element}</ProtectedRoute>
                                ) : (
                                    // Если маршрут не защищен, рендерим компонент напрямую
                                    route.element
                                )
                            }
                        />
                    ))}
                </Routes>
            </div>

            {/* --- ФИКСИРОВАННЫЙ ФУТЕР С ВИДЖЕТОМ БАЛАНСА --- */}
            {/* Рендерим футер только если пользователь авторизован */}
            {/* fixed bottom-2 left-0 right-0 z-10: делает футер фиксированным внизу экрана */}
            {isAuthenticated && ( // Условие рендеринга футера по isAuthenticated
                <div className="fixed bottom-2 left-0 right-0 z-10"> {/* bottom-2: отступ 2 единицы от нижнего края */}
                    {/* Внутренний контейнер для центрирования и горизонтальных отступов виджета внутри футера */}
                    <div className="max-w-7xl mx-auto px-4">
                        {/* Сам компонент виджета Баланса */}
                        <BalanceWidget />
                    </div>
                </div>
            )}
            {/* --- Конец ФИКСИРОВАННОГО ФУТЕРА --- */}


            {/* --- Область Рендеринга Модальных Окон --- */}
            {/* Условно рендерим компонент модала на основе значения modalType из стора */}
            {modalType && ( // Если modalType не null (т.е., какой-то модал должен быть открыт)
                // Проверяем, какой тип модала открыт, и рендерим соответствующий компонент
                // ИСПРАВЛЕНО: добавлено ['addCredit', 'editCredit'] в условие рендеринга Modal
                ['addCategory', 'editCategory', 'addCredit', 'editCredit'].includes(modalType) ? ( // Если тип - один из типов форм (для Modal.jsx)
                    <Modal // Рендерим компонент Modal
                        isOpen={true} // Всегда передаем true, т.к. условный рендеринг выше уже определяет его видимость
                        onClose={closeModal} // Передаем функцию закрытия из стора
                        {...modalProps} // Передаем все пропсы из modalProps стора (title, fields, initialData, onSubmit и т.д.)
                    />
                ) : modalType === 'confirmDelete' ? ( // Если тип - модал подтверждения удаления
                    <ConfirmModal // Рендерим компонент ConfirmModal
                        isOpen={true} // Всегда передаем true
                        onClose={closeModal} // Передаем функцию закрытия
                        {...modalProps} // Передаем пропсы (title, message, onConfirm)
                    />
                ) : null // Если modalType не совпал ни с одним известным типом, ничего не рендерим
            )}
            {/* --- Конец Области Рендеринга Модальных Окон --- */}

        </div>
    );
}