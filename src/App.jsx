import {useEffect} from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import useAuthStore from './stores/authStore';
import LayoutWithHeader from './components/LayoutWithHeader';
import TestApi from "./pages/TestApi.jsx";
import Modal from "./components/ui/Modal.jsx";

function App() {
    const { status, restoreAuth } = useAuthStore();

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (savedToken && status === 'idle') {
            restoreAuth(savedToken);
        }
    }, [status, restoreAuth]);

    return (
        <Router>
            <LayoutWithHeader />
        </Router>
    );
}

export default App;