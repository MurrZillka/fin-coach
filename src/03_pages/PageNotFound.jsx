import React from 'react'; // Добавляем useEffect
import {useNavigate} from 'react-router-dom'; // Добавляем useNavigate
import Text from '../04_components/ui/Text';
import useAuthStore from '../02_stores/authStore'; // Импортируем useAuthStore

export default function PageNotFound() {
    const navigate = useNavigate();
    const { isAuthenticated, isInitializing } = useAuthStore(); // Получаем состояние аутентификации

    const handleGoHomeClick = () => {
        if (isInitializing) {
            console.log('PageNotFound: Authentication initialization in progress, cannot redirect yet.');
            return;
        }

        if (isAuthenticated) {
            navigate('/main'); // Аутентифицированный пользователь -> /main
        } else {
            navigate('/demo'); // Неаутентифицированный пользователь -> /demo
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <Text variant="h1" className="text-9xl font-bold text-gray-800">
                404
            </Text>
            <Text variant="h2" className="text-3xl font-semibold text-gray-700 mt-4">
                Страница не найдена
            </Text>
            <Text variant="body" className="text-gray-600 mt-2">
                Ой! Похоже, вы заблудились.
            </Text>
            {/* Теперь используем обычную кнопку или Link, но с обработчиком клика */}
            <button
                onClick={handleGoHomeClick}
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
                Вернуться на главную
            </button>
        </div>
    );
}