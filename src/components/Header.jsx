//src/components/ui/Header.jsx

import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import Text from './ui/Text.jsx'; // Убедись, что путь к компоненту Text правильный относительно этой папки

export default function Header() {
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuthStore();

    // Простая функция для вывода имени пользователя
    const getUserName = () => {
        const storedName = localStorage.getItem('userName');
        return storedName || 'Пользователь';
    };

    // Обработчик выхода
    const handleLogout = () => {
        const token = localStorage.getItem('token');
        logout(token);
        navigate('/login', { replace: true });
    };

    return (
        // ДОБАВЛЕН КЛАСС h-16 для фиксированной высоты
        <header className="bg-secondary-800 text-background p-4 shadow-md h-16">
            <div className="max-w-7xl mx-auto flex justify-between items-center h-full"> {/* h-full для заполнения высоты хедера */}
                <Text variant="h1">Financial Coach</Text>

                <div className="flex items-center h-full"> {/* h-full */}
                    <nav className="h-full flex items-center"> {/* h-full и flex items-center для выравнивания */}
                        <Link to="/main" className="mx-4">
                            <Text variant="navLink">Главная</Text>
                        </Link>
                        <Link to="/categories" className="mx-4">
                            <Text variant="navLink">Категории</Text>
                        </Link>
                        <Link to="/spendings" className="mx-4">
                            <Text variant="navLink">Расходы</Text>
                        </Link>
                        <Link to="/credits" className="mx-4">
                            <Text variant="navLink">Доходы</Text>
                        </Link>
                    </nav>
                </div>

                {isAuthenticated && (
                    <div className="flex items-center h-full"> {/* h-full */}
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