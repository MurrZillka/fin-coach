// routes/index.jsx
import {Navigate} from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import CategoriesPage from '../pages/CategoriesPage';
import CreditsPage from '../pages/CreditsPage';
import SpendingsPage from '../pages/SpendingsPage/ui/SpendingsPage.jsx';
import DemoPage from '../pages/DemoPage';
import MainPage from '../pages/MainPage';
// --- ДОБАВЛЕНО: Импортируем страницу Целей ---
import GoalsPage from '../pages/GoalsPage/ui/GoalsPage.jsx';
import PageNotFound from "../pages/PageNotFound.jsx";
// --- Конец ДОБАВЛЕННОГО ---

const routes = [
    { path: '/', element: <Navigate to="/demo" /> },
    { path: '/demo', element: <DemoPage /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/signup', element: <SignupPage /> },

    // Защищенные маршруты (требуют аутентификации)
    { path: '/main', element: <MainPage />, isProtected: true },
    { path: '/categories', element: <CategoriesPage />, isProtected: true },
    { path: '/credits', element: <CreditsPage />, isProtected: true },
    { path: '/spendings', element: <SpendingsPage />, isProtected: true },
    // --- ДОБАВЛЕНО: Маршрут для страницы Целей ---
    { path: '/goals', element: <GoalsPage />, isProtected: true },
    { path: '*', element: <PageNotFound /> }// Добавляем маршрут для страницы Целей
    // --- Конец ДОБАВЛЕННОГО ---
];

export default routes;