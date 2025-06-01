import {useEffect, useState} from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import useAuthStore from './stores/authStore';
import LayoutWithHeader from './components/LayoutWithHeader';
import Loader from './components/ui/Loader.jsx';
import Text from './components/ui/Text.jsx';
import {initializeStoreCoordinator} from "./storeCoordinator.js";

function App() {
    const {isAuthenticated, status} = useAuthStore();
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
        return initializeStoreCoordinator();
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