//src/components/ui/Header.jsx

import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import Text from './ui/Text.jsx'; // Убедись, что путь правильный

export default function Header() {
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuthStore();

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
        // Убран класс h-16. Высота определяется содержимым и p-4. Добавлен flex-shrink-0.
        <header className="bg-secondary-800 text-background p-5 shadow-md flex-shrink-0">
            <div className="max-w-7xl mx-auto flex justify-between items-center h-full"> {/* h-full и items-center */}
                <Text variant="h1">Financial Coach</Text>

                <div className="flex items-center h-full">
                    <nav className="h-full flex items-center">
                        <Link to="/main" className="mx-4">
                            <Text variant="navLink">Главная</Text>
                        </Link>
                        <Link to="/categories" className="mx-4">
                            <Text variant="navLink">Категории</Text>
                        </Link>
                        <Link to="/spendings" className="mx-4">
                            <Text variant="navLink">Расходы</Text>
                        </Link>
                        {/* ИСПРАВЛЕНА ОПЕЧАТКА ЗДЕСЬ </ш> -> </Text> */}
                        <Link to="/credits" className="mx-4">
                            <Text variant="navLink">Доходы</Text>
                        </Link>
                    </nav>
                </div>

                {isAuthenticated && (
                    <div className="flex items-center h-full">
                        <Text variant="body" className="mr-4 text-background">
                            {getUserName()}
                        </Text>
                        <button
                            onClick={handleLogout}
                            className="bg-primary-500 hover:bg-primary-600 text-background px-4 py-2 rounded-md transition-colors duration-300"
                            type="button"
                        >
                            Выйти
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}