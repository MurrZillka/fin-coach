// src/App.jsx
import { useEffect, useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import useGoalsStore from './stores/goalsStore';
import LayoutWithHeader from './components/LayoutWithHeader';

/**
 * Главный компонент приложения: инициализирует авторизацию и загружает данные.
 */
function App() {
    const { initAuth, isAuthenticated, status } = useAuthStore();
    const isInitialized = useRef(false);
    const hasFetchedData = useRef(false);

    useEffect(() => {
        if (!isInitialized.current && status === 'idle') {
            console.log("App.jsx: Running initial auth check (initAuth)...");
            initAuth();
            isInitialized.current = true;
        }
    }, [status]);

    useEffect(() => {
        if (isAuthenticated && isInitialized.current && !hasFetchedData.current) {
            // Запускаем данные только после явного логина, а не токена
            const isLoggedInManually = localStorage.getItem('lastLogin') === new Date().toISOString(); // Проверка последнего логина
            if (isLoggedInManually) {
                console.log("App.jsx: User is authenticated, triggering initial data fetches...");
                useAuthStore.getState().fetchInitialUserData();
                console.log("App.jsx: Also fetching current goal data...");
                useGoalsStore.getState().getCurrentGoal();
                hasFetchedData.current = true;
            }
        }
    }, [isAuthenticated]);

    return (
        <Router>
            <LayoutWithHeader />
        </Router>
    );
}

export default App;