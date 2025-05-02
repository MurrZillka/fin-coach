// src/routes/index.js
import LoginPage from '../pages/LoginPage.jsx';
import CategoriesPage from '../pages/CategoriesPage.jsx';
import CreditsPage from '../pages/CreditsPage.jsx';
import SpendingsPage from '../pages/SpendingsPage.jsx';
import SignupPage from '../pages/SignupPage.jsx';

export const routes = [
    { path: '/login', element: <LoginPage />, isProtected: false },
    { path: '/signup', element: <SignupPage />, isProtected: false },
    { path: '/categories', element: <CategoriesPage />, isProtected: true },
    { path: '/credits', element: <CreditsPage />, isProtected: true },
    { path: '/spendings', element: <SpendingsPage />, isProtected: true },
    { path: '/', element: <LoginPage />, isProtected: false },
];

export default routes;