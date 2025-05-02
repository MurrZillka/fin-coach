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
    { path: '/main', element: <MainPage /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/signup', element: <SignupPage /> },
    { path: '/categories', element: <CategoriesPage /> },
    { path: '/credits', element: <CreditsPage /> },
    { path: '/spendings', element: <SpendingsPage /> },
];

export default routes;