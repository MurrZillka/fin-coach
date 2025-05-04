// src/components/Header.jsx

import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
// ПРАВИЛЬНЫЙ ПУТЬ импорта Text, т.к. Text.jsx в src/components/ui, а Header.jsx в src/components
import Text from './ui/Text';
// ПРАВИЛЬНЫЙ ПУТЬ импорта IconButton, т.к. IconButton.jsx в src/components/ui, а Header.jsx в src/components
import IconButton from './ui/IconButton';

// Импортируем нужную иконку из Heroicons
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';


export default function Header() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    const getUserName = () => {
        const storedName = localStorage.getItem('userName');
        return storedName || 'Пользователь';
    };

    const handleLogout = () => {
        const token = localStorage.getItem('token');
        logout(token);
        navigate('/login', { replace: true });
    };

    return (
        // shadow-md на хедере. flex-shrink-0 для Flexbox layout.
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
                        {/* УДАЛЕН проп tooltip */}
                        {/* ИЗМЕНЕН класс ховера для светлого эффекта */}
                        <IconButton
                            icon={ArrowRightStartOnRectangleIcon} // Компонент иконки
                            // УДАЛЕНА строка: tooltip="Выйти"
                            onClick={handleLogout} // Обработчик клика
                            // Изменен класс ховера на светлый полупрозрачный фон
                            className="text-background hover:bg-white/10" // Светлый ховер эффект (белый с 10% прозрачностью)
                        />
                        {/* --- Конец IconButton --- */}
                    </div>
                )}
            </div>
        </header>
    );
}