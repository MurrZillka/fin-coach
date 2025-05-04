// src/App.jsx
import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom'; // У тебя Router оборачивает LayoutWithHeader
// Убедись, что путь к stores/authStore корректный
import useAuthStore from './stores/authStore'; // Импортируем стор авторизации

import LayoutWithHeader from './components/LayoutWithHeader';


function App() {
    // Получаем действия и состояние из стора авторизации
    // initAuth для первичной проверки токена
    // isAuthenticated для запуска эффекта загрузки данных
    // fetchInitialUserData для вызова действия загрузки данных (получаем через useAuthStore.getState() в useEffect)
    const { initAuth, isAuthenticated } = useAuthStore(); // Получаем initAuth и isAuthenticated

    // --- Первый useEffect: Инициализация авторизации при загрузке приложения ---
    // Этот эффект запускается один раз при монтировании компонента App.
    // Он вызывает initAuth из стора авторизации, который проверяет localStorage на наличие токена.
    useEffect(() => {
        console.log("App.jsx: Running initial auth check (initAuth)...");
        // Вызываем действие initAuth из стора авторизации
        initAuth();
    }, [initAuth]); // Зависимость на initAuth экшен криейтор. Гарантирует, что эффект не сработает без initAuth и выполнится при его изменении (хотя в Zustand экшен криейторы обычно стабильны). [] тоже вариант, если уверены в стабильности.

    // --- Второй useEffect: Загрузка первичных данных пользователя при авторизации ---
    // Этот эффект запускается, когда isAuthenticated меняется.
    // Если пользователь становится авторизован (isAuthenticated === true), запускаем загрузку данных.
    useEffect(() => {
        // Получаем доступ к действию fetchInitialUserData из стора авторизации
        // Используем useAuthStore.getState() для доступа к действиям вне зависимостей хука
        const { fetchInitialUserData } = useAuthStore.getState();

        // Если пользователь авторизован...
        if (isAuthenticated) {
            console.log("App.jsx: User is authenticated, triggering fetchInitialUserData...");
            // Вызываем действие fetchInitialUserData из стора авторизации.
            // Это действие, в свою очередь, вызовет fetchBalance, fetchCategories и т.д.
            fetchInitialUserData();
        }
        // Нет else блока здесь. Если пользователь не авторизован, fetchInitialUserData
        // сама сбросит состояние других сторов (как мы реализовали).

    }, [isAuthenticated]); // Зависимость на isAuthenticated. Эффект сработает при true -> false и false -> true.

    return (
        <Router>
            {/* LayoutWithHeader содержит логику рендеринга HeaderAuth/Header
                и ProtectedRoute для маршрутов */}
            <LayoutWithHeader/>
        </Router>
    );
}

export default App;