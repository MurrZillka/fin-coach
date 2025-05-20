// src/App.jsx
import {useEffect, useState} from 'react'; // Импортируем useState
import {BrowserRouter as Router} from 'react-router-dom';
// Убедись, что путь к stores/authStore корректный
import useAuthStore from './stores/authStore';
// --- Импортируем стор Целей ---
import useGoalsStore from './stores/goalsStore';
// --- Конец ДОБАВЛЕННОГО ---

import LayoutWithHeader from './components/LayoutWithHeader';
import Loader from "./components/ui/Loader.jsx";
// --- Импортируем компонент Text, он понадобится для сообщения ---
import Text from './components/ui/Text.jsx';
// --- Конец импорта Text ---


function App() {
    // Получаем действия и состояние из стора авторизации
    const {initAuth, isAuthenticated, isInitializing} = useAuthStore(); // Получаем initAuth и isAuthenticated

    // --- ДОБАВЛЕНО: Состояние для ширины экрана ---
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    // --- ДОБАВЛЕНО: useEffect для отслеживания изменения размера окна ---
    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        // Очистка: удаляем обработчик при размонтировании компонента
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []); // Пустой массив зависимостей - эффект только при монтировании/размонтировании
    // --- Конец ДОБАВЛЕНО ---


    // --- Первый useEffect: Инициализация авторизации при загрузке приложения ---
    useEffect(() => {
        console.log("App.jsx: Running initial auth check (initAuth)...");
        initAuth();
    }, [initAuth]);

    // --- Второй useEffect: Загрузка первичных данных пользователя при авторизации ---
    useEffect(() => {
        if (isAuthenticated) {
            console.log("App.jsx: User is authenticated, triggering initial data fetches...");
            useAuthStore.getState().fetchInitialUserData();

            console.log("App.jsx: Also fetching current goal data...");
            useGoalsStore.getState().getCurrentGoal();
        }
    }, [isAuthenticated]);

    console.log('App.jsx: Rendering, isInitializing:', isInitializing, 'isAuthenticated:', isAuthenticated);

    // --- ДОБАВЛЕНО: Условный рендеринг в зависимости от ширины экрана ---
    // Если ширина экрана меньше 320px, показываем сообщение
    if (screenWidth < 400) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-secondary-50 text-center px-4">
                {/* Используем компонент Text для сообщения */}
                <Text variant="h3" className="text-red-600">
                    Извините, но наше приложение рассчитано на работу с минимальным горизонтальным разрешением 400px. Войдите, пожалуйста, с другого устройства.
                </Text>
            </div>
        );
    }
    // --- Конец ДОБАВЛЕНО ---


    // Если ширина экрана 320px или больше, рендерим обычное приложение
    return (
        <>
            {isInitializing
                ? (<Loader/>) // Показываем лоадер при инициализации
                : (<Router> {/* Обычная структура приложения после инициализации */}
                        <LayoutWithHeader/>
                    </Router>
                )}
        </>
    );
}

export default App;