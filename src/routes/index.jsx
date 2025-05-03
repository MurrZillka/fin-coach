// routes/index.jsx
import { Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import CategoriesPage from '../pages/CategoriesPage';
import CreditsPage from '../pages/CreditsPage';
import SpendingsPage from '../pages/SpendingsPage';
import DemoPage from '../pages/DemoPage';
import MainPage from '../pages/MainPage';

const routes = [
    { path: '/', element: <Navigate to="/demo" /> },
    { path: '/demo', element: <DemoPage /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/signup', element: <SignupPage /> },

    // Защищенные маршруты
    { path: '/main', element: <MainPage />, isProtected: true },
    { path: '/categories', element: <CategoriesPage />, isProtected: true },
    { path: '/credits', element: <CreditsPage />, isProtected: true },
    { path: '/spendings', element: <SpendingsPage />, isProtected: true },
];

export default routes;