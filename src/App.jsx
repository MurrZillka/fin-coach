//src/App.jsx
import {useEffect} from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import useAuthStore from './stores/authStore';
import LayoutWithHeader from './components/LayoutWithHeader';

function App() {
    const {status, restoreAuth} = useAuthStore();

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (savedToken && status === 'idle') {
            restoreAuth(savedToken);
        }
    }, [status, restoreAuth]);

    return (
        <Router>
            <LayoutWithHeader/>
        </Router>
    );
}

export default App;