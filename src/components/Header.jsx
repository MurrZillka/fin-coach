// src/components/Header.jsx

// Удаляем Link и useLocation, т.к. они теперь внутри NavLinkItem
import { useNavigate } from 'react-router-dom'; // useNavigate оставляем для handleLogout
import useAuthStore from '../stores/authStore'; // Убедись, что путь корректный

import Text from './ui/Text'; // Убедись, что путь правильный
import IconButton from './ui/IconButton'; // Убедись, что путь правильный
// --- Импортируем новый компонент NavLinkItem ---
// Убедись, что путь к NavLinkItem корректный из папки src/components
import NavLinkItem from './ui/NavLinkItem';
// --- Конец импорта NavLinkItem ---


import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';


export default function Header() {
    const navigate = useNavigate();
    // useLocation и isActiveLink теперь не нужны здесь, они внутри NavLinkItem
    // useAuthStore нужен для isAuthenticated и logout
    const { isAuthenticated, logout } = useAuthStore();

    // const location = useLocation(); // Удалено

    const getUserName = () => {
        const storedName = localStorage.getItem('userName');
        return storedName || 'Пользователь';
    };

    const handleLogout = () => {
        const token = localStorage.getItem('token');
        logout(token);
        navigate('/login', { replace: true });
    };

    // Определяем список ссылок с их путями и надписями (оставляем здесь, т.к. это структура навигации для хедера)
    const links = [
        { path: '/main', label: 'Главная' },
        { path: '/categories', label: 'Категории' },
        { path: '/spendings', 'label': 'Расходы' }, // У тебя было 'label': 'Расходы', оставляем так
        { path: '/credits', 'label': 'Доходы' }, // Проверь путь и формат label!
    ];

    // isActiveLink функция больше не нужна здесь, она внутри NavLinkItem
    // const isActiveLink = (to) => { ... }; // Удалено


    return (
        <header className="bg-secondary-800 text-background p-4 shadow-md flex-shrink-0">
            <div className="max-w-7xl mx-auto flex justify-between items-center h-full">
                <Text variant="h1">Financial Coach</Text>

                <div className="flex items-center h-full">
                    <nav className="h-full flex items-center">
                        {/* --- Используем новый компонент NavLinkItem для каждой ссылки --- */}
                        {/* Итерируем по списку ссылок и рендерим NavLinkItem для каждой */}
                        {links.map((link) => (
                            <NavLinkItem
                                key={link.path} // Используем путь как уникальный ключ
                                to={link.path} // Передаем путь в NavLinkItem через prop "to"
                                label={link.label} // Передаем надпись ссылки через prop "label"
                            />
                        ))}
                        {/* --- Конец использования NavLinkItem --- */}
                    </nav>
                </div>

                {isAuthenticated && (
                    <div className="flex items-center h-full">
                        {/* Имя пользователя */}
                        <Text variant="body" className="mr-4 text-background">
                            {getUserName()}
                        </Text>

                        {/* IconButton для выхода */}
                        <IconButton
                            icon={ArrowRightStartOnRectangleIcon}
                            onClick={handleLogout}
                            className="text-background hover:bg-white/10" // Светлый ховер
                        />
                    </div>
                )}
            </div>
        </header>
    );
}