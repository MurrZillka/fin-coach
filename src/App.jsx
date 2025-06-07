import {useEffect, useState} from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import useAuthStore from './02_stores/authStore/authStore.ts';
import LayoutWithHeader from './04_components/LayoutWithHeader';
import Loader from './04_components/ui/Loader.tsx';
import Text from './04_components/ui/Text.tsx';
import {dataCoordinator} from "./dataCoordinator.js";

function App() {
    const {isAuthenticated, status} = useAuthStore();
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
        // Только подписка на auth, остальное явно
        const unsubscribe = useAuthStore.subscribe(
            (state) => state.isAuthenticated,
            (isAuthenticated, previousIsAuthenticated) => {
                if (isAuthenticated && !previousIsAuthenticated) {
                    dataCoordinator.loadAllData();
                }
            }
        );

        // Проверка начального состояния
        if (useAuthStore.getState().isAuthenticated) {
            dataCoordinator.loadAllData();
        }

        return unsubscribe;
    }, []);

    useEffect(() => {
        const handleStorageChange = (event) => {
            // Слушаем только событие logout
            if (event.key === 'logout_event') {
                console.log('App.jsx: Logout detected in another tab');
                // Вызываем logout в текущем окне
                useAuthStore.getState().logoutLocal();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    console.log('App.jsx: Rendering, status:', status, 'isAuthenticated:', isAuthenticated);

    if (screenWidth < 350) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-secondary-50 text-center px-4">
                <Text variant="h3" className="text-red-600">
                    Извините, но наше приложение рассчитано на работу с минимальным горизонтальным разрешением
                    350px.
                    Войдите, пожалуйста, с другого устройства.
                </Text>
            </div>
        );
    }

    return (
        <>
            {status === 'initializing' ? (
                <Loader/>
            ) : (
                <Router>
                    <LayoutWithHeader/>
                </Router>
            )}
        </>
    );
}

export default App;