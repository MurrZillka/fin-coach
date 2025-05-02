// src/App.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { restoreAuth } from './store/authSlice';
import routes from './routes/index.js';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Header from './components/Header.jsx';

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
            <Header />
            <div className="min-h-screen bg-secondary-50">
                <Routes>
                    {routes.map((route, index) => (
                        <Route
                            key={index}
                            path={route.path}
                            element={
                                route.isProtected ? (
                                    <ProtectedRoute>{route.element}</ProtectedRoute>
                                ) : (
                                    route.element
                                )
                            }
                        />
                    ))}
                </Routes>
            </div>
        </Router>
    );
}

export default App;