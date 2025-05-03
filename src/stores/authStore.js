import { create } from 'zustand';
// Убедись, что путь к api/auth корректный
import { login as loginApi, signup as signupApi, logout as logoutApi } from '../api/auth';

const useAuthStore = create((set) => ({
    // Состояние
    user: null, // Теперь user будет содержать { userName, access_token, ...другие_данные }
    isAuthenticated: false,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,

    // Действия
    login: async (credentials) => {
        set({ status: 'loading', error: null });
        try {
            // Предполагаем, что loginApi возвращает { data: { access_token, userName, ... }, error: null } или { data: null, error: ... }
            const { data, error } = await loginApi(credentials);

            if (error) {
                // Если API вернуло ошибку, обновляем состояние стора
                set({ status: 'failed', error });
                throw error; // Пробрасываем ошибку для обработки в компоненте (например, в LoginPage)
            }

            // --- ДОБАВЛЕННАЯ ЛОГИКА: СОХРАНЕНИЕ ТОКЕНА И USERNAME В LOCALSTORAGE ---
            if (data && data.access_token) {
                localStorage.setItem('token', data.access_token);
            }
            if (data && data.userName) {
                localStorage.setItem('userName', data.userName);
            }
            // --- КОНЕЦ ДОБАВЛЕННОЙ ЛОГИКИ ---


            // Обновляем состояние стора с полученными данными (включая токен в data)
            set({
                user: data, // data теперь содержит access_token
                isAuthenticated: true,
                status: 'succeeded'
            });

            return data; // Возвращаем данные, если нужно компоненту
        } catch (error) {
            console.error('Ошибка входа в API:', error); // Логируем ошибку API

            // Обрабатываем ошибки, которые могли возникнуть до вызова API или из API (если throw error был выше)
            const apiError = error.error || { message: error.message || 'Неизвестная ошибка при входе' };
            set({ status: 'failed', error: apiError });

            throw error; // Пробрасываем ошибку дальше
        }
    },

    signup: async (userData) => {
        set({ status: 'loading', error: null });
        try {
            // Предполагаем, что signupApi возвращает { data: ..., error: ... }
            const { data, error } = await signupApi(userData);

            if (error) {
                set({ status: 'failed', error });
                throw error;
            }

            // Для регистрации обычно не требуется сохранять токен сразу,
            // пользователь должен войти после регистрации

            set({ status: 'succeeded' });
            return data;
        } catch (error) {
            console.error('Ошибка регистрации в API:', error);
            const apiError = error.error || { message: error.message || 'Неизвестная ошибка при регистрации' };
            set({ status: 'failed', error: apiError });
            throw error;
        }
    },

    logout: async () => { // Убрали прием токена как аргумента, будем брать его из localStorage или состояния
        set({ status: 'loading' });
        const token = localStorage.getItem('token'); // Берем токен для API вызова

        try {
            // Вызываем API выхода только если есть токен
            if (token) {
                await logoutApi(token);
            }

            // Очищаем localStorage независимо от успеха API выхода
            localStorage.removeItem('userName');
            localStorage.removeItem('token');

            // Сбрасываем состояние стора
            set({
                user: null,
                isAuthenticated: false,
                status: 'idle',
                error: null
            });
        } catch (error) {
            console.error('Ошибка при выходе (API logout может и не отработать, это нормально):', error);
            // Даже при ошибке API logout, очищаем данные пользователя локально
            localStorage.removeItem('userName');
            localStorage.removeItem('token');

            set({
                user: null,
                isAuthenticated: false,
                status: 'idle',
                error: null
            });
            // Обычно при выходе ошибку не пробрасывают дальше, но можно добавить throw error; если нужно
        }
    },

    clearError: () => set({ error: null }),

    // --- ДОБАВЛЕННАЯ ЛОГИКА: ИНИЦИАЛИЗАЦИЯ ИЗ LOCALSTORAGE ---
    initAuth: () => {
        const token = localStorage.getItem('token');
        const userName = localStorage.getItem('userName'); // Читаем userName

        if (token) {
            // Если токен есть в localStorage, восстанавливаем состояние
            // user может содержать минимальные данные, например, userName и сам токен
            set({
                isAuthenticated: true,
                // Создаем объект user с токеном и userName, если есть
                user: {
                    access_token: token,
                    userName: userName || 'Пользователь' // Используем сохраненный userName или дефолтное значение
                    // Можно добавить другие поля, если они сохраняются в localStorage при логине
                },
                status: 'succeeded' // Считаем инициализацию успешной
            });
        } else {
            // Если токена нет, явно устанавливаем состояние как неаутентифицированное
            set({
                isAuthenticated: false,
                user: null,
                status: 'idle',
                error: null
            });
        }
    }
    // --- КОНЕЦ ДОБАВЛЕННОЙ ЛОГИКИ ---
}));

export default useAuthStore;