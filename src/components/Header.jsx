// src/components/Header.jsx

import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
// Убедись, что путь к stores/authStore корректный
import useAuthStore from '../stores/authStore'; // Импортируем стор авторизации

// ПРАВИЛЬНЫЙ ПУТЬ импорта Text
import Text from './ui/Text';
// ПРАВИЛЬНЫЙ ПУТЬ импорта IconButton
import IconButton from './ui/IconButton';

// Импортируем иконку выхода
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';


export default function Header() {
    const navigate = useNavigate();
    // --- ИСПРАВЛЕНИЕ: ПОЛУЧАЕМ logout ИЗ СТОРА ---
    // Получаем isAuthenticated и logout действие из стора авторизации
    const { isAuthenticated, logout } = useAuthStore();
    // --- Конец ИСПРАВЛЕНИЯ ---

    const getUserName = () => {
        const storedName = localStorage.getItem('userName');
        return storedName || 'Пользователь';
    };

    const handleLogout = () => {
        const token = localStorage.getItem('token');
        // Теперь logout определен, т.к. мы его получили из стора
        logout(token);
        navigate('/login', { replace: true });
    };

    return (
        <header className="bg-secondary-800 text-background p-4 shadow-md flex-shrink-0">
            <div className="max-w-7xl mx-auto flex justify-between items-center h-full">
                <Text variant="h1">Financial Coach</Text>

                <div className="flex items-center h-full">
                    <nav className="h-full flex items-center">
                        <Link to="/main" className="mx-4">
                            <Text variant="navLink">Главная</Text>
                        </Link>
                        <Link to="/categories" className="mx-4">
                            <Text variant="navLink">Категории</Text>
                        </Link>
                        {/* Убедись, что здесь </Text> */}
                        <Link to="/spendings" className="mx-4">
                            <Text variant="navLink">Расходы</Text>
                        </Link>
                        <Link to="/credits" className="mx-4">
                            <Text variant="navLink">Доходы</Text>
                        </Link>
                    </nav>
                </div>

                {isAuthenticated && (
                    <div className="flex items-center h-full">
                        {/* Имя пользователя */}
                        <Text variant="body" className="mr-4 text-background">
                            {getUserName()}
                        </Text>

                        {/* --- IconButton для выхода --- */}
                        <IconButton
                            icon={ArrowRightStartOnRectangleIcon}
                            // Без tooltip="Выйти"
                            onClick={handleLogout}
                            className="text-background hover:bg-white/10" // Светлый ховер
                        />
                        {/* --- Конец IconButton --- */}
                    </div>
                )}
            </div>
        </header>
    );
}