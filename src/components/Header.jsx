import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import Text from './ui/Text';

export default function Header() {
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuthStore();

    // Простая функция для вывода имени пользователя
    const getUserName = () => {
        const storedName = localStorage.getItem('userName');
        return storedName || 'Пользователь';
    };

    // Обработчик выхода - без лишних эффектов и зависимостей
    const handleLogout = () => {
        // Получаем токен из localStorage перед его удалением
        const token = localStorage.getItem('token');

        // Вызываем logout из Zustand-стора с токеном
        logout(token);

        // localStorage будет очищен внутри logout в authStore

        // Переходим на страницу логина сразу же
        navigate('/login', { replace: true });
    };

    return (
        <header className="bg-secondary-800 text-background p-4 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Text variant="h1">Financial Coach</Text>

                <div className="flex items-center">
                    <nav>
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
                    <div className="flex items-center">
                        <Text variant="body" className="mr-4 text-background">
                            {getUserName()}
                        </Text>
                        <button
                            onClick={handleLogout}
                            className="bg-primary-500 hover:bg-primary-600 text-background px-4 py-2 rounded-md transition-colors duration-300"
                            type="button" // Явно указываем тип кнопки
                        >
                            Выйти
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}