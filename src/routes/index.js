import LoginPage from '../pages/LoginPage.jsx';
import CategoriesPage from '../pages/CategoriesPage.jsx';
import TestApi from '../pages/TestApi.jsx';

export const routes = [
    { path: '/login', element: <LoginPage />, isProtected: false },
    { path: '/categories', element: <CategoriesPage />, isProtected: true },
    { path: '/test-api', element: <TestApi />, isProtected: false },
    { path: '/', element: <LoginPage />, isProtected: false },
];

export default routes;