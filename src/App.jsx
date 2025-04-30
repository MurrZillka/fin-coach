import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreAuth } from './store/authSlice';
import TestApi from './pages/TestApi.jsx';

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            dispatch(restoreAuth(token));
        }
    }, [dispatch]);

    return (
        <div>
            <h1>Financial Coach</h1>
            <TestApi />
        </div>
    );
}

export default App;