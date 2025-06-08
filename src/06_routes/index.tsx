// src/routes/index.tsx
import { Navigate } from 'react-router-dom';
import LoginPage from '../03_pages/LoginPage/LoginPage';
import SignupPage from '../03_pages/SignupPage';
import CategoriesPage from '../03_pages/CategoriesPage';
import CreditsPage from '../03_pages/CreditsPage';
import SpendingsPage from '../03_pages/SpendingsPage/ui/SpendingsPage';
import DemoPage from '../03_pages/DemoPage';
import MainPage from '../03_pages/MainPage/MainPage';
import GoalsPage from '../03_pages/GoalsPage/ui/GoalsPage';
import PageNotFound from "../03_pages/PageNotFound";
import {RouteItem} from "./types";
import React from "react";

const routes: RouteItem[] = [
    { path: '/', element: <Navigate to="/demo" /> },
    { path: '/demo', element: <DemoPage /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/signup', element: <SignupPage /> },

    { path: '/main', element: <MainPage />, isProtected: true },
    { path: '/categories', element: <CategoriesPage />, isProtected: true },
    { path: '/credits', element: <CreditsPage />, isProtected: true },
    { path: '/spendings', element: <SpendingsPage />, isProtected: true },
    { path: '/goals', element: <GoalsPage />, isProtected: true },
    { path: '*', element: <PageNotFound /> }
];

export default routes;
