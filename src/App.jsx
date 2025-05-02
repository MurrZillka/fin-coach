import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { restoreAuth } from './store/authSlice';
import LayoutWithHeader from './components/LayoutWithHeader';
import TestApi from "./pages/TestApi.jsx";

function App() {
    const dispatch = useDispatch();
    const { status } = useSelector((state) => state.auth);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (savedToken && status === 'idle') {
            dispatch(restoreAuth(savedToken));
        }
    }, [dispatch, status]);

    return (
        <Router>
            <LayoutWithHeader />
            <TestApi/>
        </Router>
    );
}

export default App;