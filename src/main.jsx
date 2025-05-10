import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Инициализируем authStore при загрузке приложения
import useAuthStore from './stores/authStore';
// Вызываем инициализацию состояния
const initAuth = useAuthStore.getState().initAuth;
initAuth();

ReactDOM.createRoot(document.getElementById('root')).render(
    //<React.StrictMode>
        <App />
    //</React.StrictMode>,
);