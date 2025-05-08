// src/components/Header.jsx
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import Text from './ui/Text';
import IconButton from './ui/IconButton'; // Убедись, что путь правильный
// --- Импортируем компонент NavLinkItem ---
// Убедись, что путь к NavLinkItem корректный из папки src/components/ui
import NavLinkItem from './ui/NavLinkItem';
// --- Конец импорта NavLinkItem ---


import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';
// Импорт HeaderAuth, но в текущем коде он не используется в JSX
// import HeaderAuth from "./HeaderAuth.jsx";


export default function Header() {
    const navigate = useNavigate();
    // useAuthStore нужен для isAuthenticated и logout
    const { isAuthenticated, logout } = useAuthStore();

    const getUserName = () => {
        const storedName = localStorage.getItem('userName');
        return storedName || 'Пользователь';
    };

    // Обработчик выхода из системы
    const handleLogout = () => {
        // Токен не нужно явно получать здесь, стор authStore сам управляет токеном
        // logout в authStore уже не требует аргументов, так как он сам чистит localStorage
        // useAuthStore.getState().logout(); // Лучше вызывать logout напрямую из стора
        logout(); // Вызываем действие logout из хука useAuthStore
        console.log('Header: Logout triggered.'); // Лог выхода

        // Перенаправляем на страницу логина после выхода
        // replace: true заменяет текущую запись в истории браузера
        navigate('/login', { replace: true });
    };


    // Определяем список ссылок с их путями и надписями для навигации в хедере
    const links = [
        { path: '/main', label: 'Главная' },
        { path: '/categories', label: 'Категории' },
        { path: '/spendings', 'label': 'Расходы' },
        { path: '/credits', 'label': 'Доходы' },
        // --- ДОБАВЛЕНО: Ссылка на страницу Целей ---
        { path: '/goals', label: 'Цели' }, // Добавляем новую ссылку для страницы Целей
        // --- Конец ДОБАВЛЕННОГО ---
    ];

    return (
        <header className="bg-secondary-800 text-background p-4 shadow-md flex-shrink-0">
            <div className="max-w-7xl mx-auto flex justify-between items-center h-full">
                {/* Логотип или название приложения */}
                <Text variant="h1">Financial Coach</Text>

                {/* Навигационные ссылки (отображаются, если пользователь аутентифицирован) */}
                {/* По твоей логике в Header.jsx, навигация отображается ТОЛЬКО если isAuthenticated */}
                {isAuthenticated && (
                    <div className="flex items-center h-full">
                        <nav className="h-full flex items-center space-x-4"> {/* Добавим space-x-4 для интервала между ссылками */}
                            {/* Используем NavLinkItem для каждой ссылки */}
                            {links.map((link) => (
                                <NavLinkItem
                                    key={link.path} // Используем путь как уникальный ключ
                                    to={link.path} // Передаем путь в NavLinkItem
                                    label={link.label} // Передаем надпись
                                />
                            ))}
                        </nav>
                    </div>
                )}


                {/* Секция пользователя и выхода (отображается, если пользователь аутентифицирован) */}
                {isAuthenticated && (
                    <div className="flex items-center h-full">
                        {/* Имя пользователя */}
                        <Text variant="body" className="mr-4 text-background">
                            {getUserName()}
                        </Text>

                        {/* Кнопка выхода */}
                        <IconButton
                            icon={ArrowRightStartOnRectangleIcon}
                            onClick={handleLogout}
                            className="text-background hover:bg-white/10" // Светлый ховер
                            tooltip="Выйти" // Добавим тултип для понятности
                        />
                    </div>
                )}
                {/* Если не аутентифицирован, ты можешь здесь отобразить HeaderAuth или что-то другое */}
                {/* В твоем коде HeaderAuth импортирован, но не используется в JSX */}
                {/* Например: {!isAuthenticated && <HeaderAuth />} */}
            </div>
        </header>
    );
}

Header.displayName = 'Header'; // Имя компонента для инструментов разработки