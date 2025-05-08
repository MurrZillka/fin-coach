// src/stores/categoryStore.js
import { create } from 'zustand';
// Убедись, что путь к файлу categories/index.js корректный
import * as categoriesAPI from '../api/categories/index';
// Импортируем authStore для получения токена
import useAuthStore from './authStore'; // Этот импорт остаётся, так как getToken его использует


// --- УДАЛЕНО: Подписка на изменения в authStore (Теперь эта подписка находится в файле storeInitializer.js) ---
// useAuthStore.subscribe(
//     (authState) => {
//         console.log('categoryStore: Auth state changed detected by subscription.', authState);
//         const categoryStoreState = useCategoryStore.getState();
//         if (!authState.isAuthenticated && categoryStoreState.categories !== null) {
//             console.log('categoryStore: User became unauthenticated, triggering resetCategories...');
//             categoryStoreState.resetCategories();
//         }
//     },
//     (state) => ({ isAuthenticated: state.isAuthenticated })
// );
// --- Конец УДАЛЕНИЯ ---


const useCategoryStore = create((set, get) => ({
    // Состояние
    categories: null, // <--- Инициализировано как null
    loading: false,
    error: null,

    // Вспомогательная функция для получения токена и обработки ошибок аутентификации
    getToken: () => {
        const token = useAuthStore.getState().user?.access_token;
        if (!token) {
            const authError = { message: 'Пользователь не аутентифицирован. Пожалуйста, войдите.' };
            set({ error: authError, loading: false });
            console.error('Ошибка аутентификации в categoryStore:', authError);
            return null;
        }
        return token;
    },

    // Действия

    // Загрузка списка категорий
    fetchCategories: async () => {
        console.log('categoryStore: fetchCategories started'); // Добавлен лог
        // Проверка, нужно ли устанавливать loading в true.
        // Не устанавливаем, если уже идет загрузка (например, CUD операция).
        if (!get().loading) { // Проверяем именно loading из текущего стора
            set({ loading: true, error: null });
        } else {
            set({ error: null });
        }


        // Получаем токен перед вызовом API
        const token = get().getToken();

        if (!token) {
            console.log('categoryStore: fetchCategories - No token, stopping fetch.'); // Добавлен лог
            // Если getToken вернул null (нет токена), функция уже установила ошибку и статус loading=false (если не было CUD)
            if (!get().loading) set({ loading: false }); // Устанавливаем loading=false только если не было активной CUD операции
            return; // Прерываем выполнение
        }
        console.log('categoryStore: fetchCategories - Token found, proceeding with API call.'); // Добавлен лог


        try {
            // Вызываем API функцию, передавая токен
            const result = await categoriesAPI.getCategories(token);
            console.log('categoryStore: API getCategories result:', result); // Добавлен лог


            // Обрабатываем ответ в формате { data, error }
            if (result.error) {
                // Если API вернуло ошибку, устанавливаем ее в состояние
                set({ error: result.error, loading: false });
                console.error('Ошибка загрузки категорий от API:', result.error);
            } else {
                // Если успешно, обновляем список категорий в состоянии
                // Предполагаем, что result.data содержит { categories: [...] }
                set({ categories: result.data.categories || [], loading: false }); // Учитываем случай пустого массива
                console.log('categoryStore: Categories updated successfully.'); // Добавлен лог
            }

        } catch (error) {
            // Ловим непредвиденные ошибки (например, проблемы с сетью)
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при загрузке категорий.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('Непредвиденная ошибка fetchCategories:', error);
        }
        console.log('categoryStore: fetchCategories finished.'); // Добавлен лог

    },

    // Добавление новой категории
    addCategory: async (categoryData) => {
        console.log('categoryStore: addCategory started', categoryData); // Добавлен лог
        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false }); // Устанавливаем loading=false
            throw new Error('Пользователь не аутентифицирован'); // Пробрасываем ошибку дальше
        }
        console.log('categoryStore: addCategory - Token found, proceeding with API call.'); // Добавлен лог


        try {
            // Вызываем API функцию, передавая данные и токен
            const result = await categoriesAPI.addCategory(categoryData, token);
            console.log('categoryStore: API addCategory result:', result); // Добавлен лог


            // Обрабатываем ответ в формате { data, error }
            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('Ошибка добавления категории от API:', result.error);
                throw result.error; // Пробрасываем ошибку API дальше
            } else {
                // Если успешно (API вернуло сообщение об успехе), перезагружаем список
                // Это гарантирует, что новая категория появится в списке в сторе
                await get().fetchCategories(); // fetchCategories сам установит loading=false

                console.log('categoryStore: addCategory success, fetching categories.'); // Добавлен лог
                return result.data; // result.data содержит { message: "..." }
            }

        } catch (error) {
            // Ловим непредвиденные ошибки
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при добавлении категории.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('Непредвиденная ошибка addCategory:', error);
            throw error; // Пробрасываем ошибку дальше
        } finally {
            console.log('categoryStore: addCategory finished.'); // Добавлен лог
        }
    },

    // Обновление категории по ID
    updateCategory: async (id, categoryData) => {
        console.log('categoryStore: updateCategory started', id, categoryData); // Добавлен лог
        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован');
        }
        console.log('categoryStore: updateCategory - Token found, proceeding with API call.'); // Добавлен лог


        try {
            // Вызываем API функцию, передавая ID, данные и токен
            const result = await categoriesAPI.updateCategoryById(id, categoryData, token);
            console.log('categoryStore: API updateCategory result:', result); // Добавлен лог


            // Обрабатываем ответ в формате { data, error }
            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('Ошибка обновления категории от API:', result.error);
                throw result.error;
            } else {
                // Если успешно, перезагружаем список
                await get().fetchCategories(); // fetchCategories сам установит loading=false

                console.log('categoryStore: updateCategory success, fetching categories.'); // Добавлен лог
                return result.data; // result.data содержит { message: "..." }
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при обновлении категории.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('Непредвиденная ошибка updateCategory:', error);
            throw error;
        } finally {
            console.log('categoryStore: updateCategory finished.'); // Добавлен лог
        }
    },

    // Удаление категории по ID
    deleteCategory: async (id) => {
        console.log('categoryStore: deleteCategory started', id); // Добавлен лог
        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован');
        }
        console.log('categoryStore: deleteCategory - Token found, proceeding with API call.'); // Добавлен лог


        try {
            // Вызываем API функцию, передавая ID и токен
            const result = await categoriesAPI.deleteCategoryById(id, token);
            console.log('categoryStore: API deleteCategory result:', result); // Добавлен лог


            // Обрабатываем ответ в формате { data, error }
            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('Ошибка удаления категории от API:', result.error);
                throw result.error;
            } else {
                // Если успешно, перезагружаем список
                // Это самый простой способ убедиться, что категория удалена из списка в сторе
                await get().fetchCategories(); // fetchCategories сам установит loading=false

                console.log(`categoryStore: Категория ${id} успешно удалена, fetching categories.`); // Добавлен лог
                return result.data; // result.data содержит { message: "..." }
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при удалении категории.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('Непредвиденная ошибка deleteCategory:', error);
            throw error;
        } finally {
            console.log('categoryStore: deleteCategory finished.'); // Добавлен лог
        }
    },

    // --- Добавлено: Действие для сброса состояния стора категорий ---
    // Эта функция будет вызываться подпиской из storeInitializer.js
    resetCategories: () => {
        console.log('categoryStore: resetCategories called.'); // Добавлен лог
        set({ categories: null, loading: false, error: null }); // <--- Сброс к null
    },
    // --- Конец добавления ---


    // Сброс ошибки
    clearError: () => {
        console.log('categoryStore: clearError called.'); // Добавлен лог
        set({ error: null });
    }
}));

export default useCategoryStore;