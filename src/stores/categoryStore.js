// src/stores/categoryStore.js
import { create } from 'zustand';
// Убедись, что путь к api/category корректен
import * as categoryAPI from '../api/categories/index'; // Предполагаем, что тут есть addCategory, updateCategoryById, deleteCategoryById, getCategories
// Импортируем authStore для получения токена
import useAuthStore from './authStore';
// Импортируем сторы баланса, расходов и доходов, если fetchInitialUserData в authStore
// вызывает их фетчи из categoryStore (хотя это маловероятно, но для полноты импортов)
// import useBalanceStore from './balanceStore'; // Маловероятно, но можно добавить, если нужно
// import useSpendingsStore from './spendingsStore'; // Маловероятно
// import useCreditStore from './creditStore'; // Маловероятно


const useCategoryStore = create((set, get) => ({
    // --- Состояние (State) ---
    categories: null, // Инициализируем как null (для индикации, что данные еще не загружены)
    loading: false, // Индикатор загрузки (для общих операций fetch/CUD)
    // Можно добавить отдельные loading для CUD операций, если нужно более детальное управление
    // 예를 들어: adding: false, updating: false, deleting: false,
    error: null, // Информация об ошибке

    // --- Вспомогательная функция: Получение токена ---
    getToken: () => {
        const token = useAuthStore.getState().user?.access_token;
        console.log('categoryStore: getToken called. Token found:', !!token); // Лог наличия токена
        if (!token) {
            // Здесь не устанавливаем ошибку в этом сторе, т.к. authStore уже должен был ее установить.
            console.error('categoryStore: Authentication error in getToken - No token available.'); // Лог ошибки
            return null;
        }
        return token;
    },

    // --- Действия (Actions) ---

    // Действие для загрузки списка категорий
    fetchCategories: async () => {
        console.log('categoryStore: fetchCategories started'); // Лог начала действия

        // --- ВОССТАНОВЛЕНО: Логика загрузки без сброса categories в null в начале ---
        // Предполагаем, что в рабочей версии не было явного set({ categories: null, ... }) тут.
        if (!get().loading) {
            set({ loading: true, error: null });
        } else {
            set({ error: null });
        }
        console.log('categoryStore: State update before fetch (loading).'); // Лог обновления состояния

        const token = get().getToken();
        if (!token) {
            console.log('categoryStore: fetchCategories - No token, stopping fetch.'); // Лог остановки
            // Если токен не получен, getToken уже логировал ошибку.
            // loading уже установлен в true выше, но мы должны его сбросить, т.к. fetch не будет выполнен.
            if (!get().loading) set({ loading: false }); // Убедимся, что loading сбрасывается, если fetch не пошел
            return;
        }
        console.log('categoryStore: fetchCategories - Token found, proceeding with API call.'); // Лог вызова API

        try {
            const result = await categoryAPI.getCategories(token);
            console.log('categoryStore: API getCategories result:', result); // Лог результата API

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('categoryStore: Error fetching categories from API:', result.error); // Лог ошибки
            } else {
                // Если успешно, обновляем список категорий.
                // Если API вернуло null или undefined для Categories, используем пустой массив.
                const categoriesArray = result.data?.Categories || []; // Берем массив под ключом "Categories"
                set({ categories: categoriesArray, loading: false, error: null }); // Устанавливаем новые категории
                console.log('categoryStore: Categories updated successfully.', categoriesArray.length, 'items.'); // Лог успеха
            }

        } catch (error) {
            const unexpectedError = {
                message: error.message || 'Произошла непредвиденная ошибка при загрузке категорий.',
                status: error.status,
            };
            if (error.response && error.response.data && error.response.data.message) {
                unexpectedError.message = error.response.data.message;
            } else if (error.message === "Failed to fetch") {
                unexpectedError.message = "Не удалось подключиться к серверу. Проверьте ваше интернет-соединение.";
            }
            console.error('categoryStore: Unexpected error in fetchCategories:', error); // Лог непредвиденной ошибки или ошибки API

            set({
                error: unexpectedError,
                loading: false
            });
            // Не пробрасываем ошибку дальше, если ее не нужно обрабатывать в компоненте
            // throw error;
        } finally {
            console.log('categoryStore: fetchCategories finished.'); // Лог завершения
        }
    },

    // --- ВОССТАНОВЛЕНО: Действие для добавления новой категории ---
    addCategory: async (categoryData) => {
        console.log('categoryStore: addCategory started with data:', categoryData); // Лог начала действия с данными
        set({ loading: true, error: null }); // Устанавливаем loading

        const token = get().getToken(); // Получаем токен
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован'); // Пробрасываем ошибку, т.к. вызывающий код может ее ожидать (Modal)
        }
        console.log('categoryStore: addCategory - Token found, proceeding with API call.'); // Лог вызова API

        try {
            // Вызываем API функцию для добавления категории
            const result = await categoryAPI.addCategory(categoryData, token);
            console.log('categoryStore: API addCategory result:', result); // Лог результата API

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('categoryStore: Error adding category from API:', result.error); // Лог ошибки
                throw result.error; // Пробрасываем ошибку API дальше
            } else {
                // Если успешно: перезагружаем список категорий
                console.log('categoryStore: Category added successfully. Triggering fetchCategories...'); // Лог успеха
                await get().fetchCategories(); // fetchCategories сам установит loading=false и обновит categories
                // Здесь не нужно обновлять баланс, т.к. категории не влияют на баланс напрямую

                return result.data; // Возвращаем ответ от API
            }

        } catch (error) {
            const unexpectedError = {
                message: error.message || 'Произошла непредвиденная ошибка при добавлении категории.',
                status: error.status,
            };
            if (error.response && error.response.data && error.response.data.message) {
                unexpectedError.message = error.response.data.message;
            } else if (error.message === "Failed to fetch") {
                unexpectedError.message = "Не удалось подключиться к серверу. Проверьте ваше интернет-соединение.";
            }
            console.error('categoryStore: Error in addCategory:', error); // Лог ошибки

            set({
                error: unexpectedError,
                loading: false
            });
            throw error; // Пробрасываем ошибку дальше
        } finally {
            console.log('categoryStore: addCategory finished.'); // Лог завершения
        }
    },

    // --- ВОССТАНОВЛЕНО: Действие для обновления категории по ID ---
    updateCategory: async (id, categoryData) => {
        console.log(`categoryStore: updateCategory started for ID: ${id} with data:`, categoryData); // Лог начала действия
        set({ loading: true, error: null }); // Устанавливаем loading

        const token = get().getToken(); // Получаем токен
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован');
        }
        console.log('categoryStore: updateCategory - Token found, proceeding with API call.'); // Лог вызова API

        try {
            // Вызываем API функцию для обновления категории
            const result = await categoryAPI.updateCategoryById(id, categoryData, token);
            console.log(`categoryStore: API updateCategoryById result for ID ${id}:`, result); // Лог результата API

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error(`categoryStore: Error updating category ID ${id} from API:`, result.error); // Лог ошибки
                throw result.error; // Пробрасываем ошибку API дальше
            } else {
                // Если успешно, перезагружаем список
                console.log(`categoryStore: Category ID ${id} updated successfully. Triggering fetchCategories...`); // Лог успеха
                await get().fetchCategories(); // fetchCategories сам установит loading=false и обновит categories
                // Не нужно обновлять баланс

                return result.data; // Возвращаем ответ от API
            }

        } catch (error) {
            const unexpectedError = {
                message: error.message || 'Произошла непредвиденная ошибка при обновлении категории.',
                status: error.status,
            };
            if (error.response && error.response.data && error.response.data.message) {
                unexpectedError.message = error.response.data.message;
            } else if (error.message === "Failed to fetch") {
                unexpectedError.message = "Не удалось подключиться к серверу. Проверьте ваше интернет-соединение.";
            }
            set({
                error: unexpectedError,
                loading: false
            });
            console.error(`categoryStore: Error in updateCategory ID ${id}:`, error); // Лог ошибки
            throw error; // Пробрасываем ошибку дальше
        } finally {
            console.log(`categoryStore: updateCategory finished for ID: ${id}.`); // Лог завершения
        }
    },

    // --- ВОССТАНОВЛЕНО: Действие для удаления категории по ID ---
    deleteCategory: async (id) => {
        console.log(`categoryStore: deleteCategory started for ID: ${id}`); // Лог начала действия
        set({ loading: true, error: null }); // Устанавливаем loading

        const token = get().getToken(); // Получаем токен
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован');
        }
        console.log('categoryStore: deleteCategory - Token found, proceeding with API call.'); // Лог вызова API

        try {
            // Вызываем API функцию для удаления категории
            const result = await categoryAPI.deleteCategoryById(id, token);
            console.log(`categoryStore: API deleteCategoryById result for ID ${id}:`, result); // Лог результата API

            if (result.error) {
                set({ error: result.error, loading: false });
                // --- ИСПРАВЛЕНО: Синтаксис строки в console.error ---
                console.error(`categoryStore: Error deleting category ID ${id} from API:`, result.error); // Лог ошибки
                // --- КОНЕЦ ИСПРАВЛЕНИЯ ---
                throw result.error; // Пробрасываем ошибку API дальше
            } else {
                // Если успешно, перезагружаем список
                console.log(`categoryStore: Category ID ${id} deleted successfully. Triggering fetchCategories...`); // Лог успеха
                await get().fetchCategories(); // fetchCategories сам установит loading=false и обновит categories
                // Не нужно обновлять баланс

                return result.data; // Возвращаем ответ от API
            }

        } catch (error) {
            const unexpectedError = {
                message: error.message || 'Произошла непредвиденная ошибка при удалении категории.',
                status: error.status,
            };
            if (error.response && error.response.data && error.response.data.message) {
                unexpectedError.message = error.response.data.message;
            } else if (error.message === "Failed to fetch") {
                unexpectedError.message = "Не удалось подключиться к серверу. Проверьте ваше интернет-соединение.";
            }
            set({
                error: unexpectedError,
                loading: false
            });
            console.error(`categoryStore: Error in deleteCategory ID ${id}:`, error); // Лог ошибки
            throw error; // Пробрасываем ошибку дальше
        } finally {
            console.log(`categoryStore: deleteCategory finished for ID: ${id}.`); // Лог завершения
        }
    },


    // Действие для сброса состояния стора категорий (используется при выходе пользователя или смене)
    // Эта функция вызывается из authStore
    resetCategories: () => {
        console.log('categoryStore: resetCategories called.'); // Лог вызова сброса
        set({ categories: null, loading: false, error: null }); // Сбрасываем к начальному состоянию null
    },

    // Действие для сброса только ошибки
    clearError: () => {
        console.log('categoryStore: clearError called.'); // Лог вызова сброса ошибки
        set({ error: null });
    }
}));

export default useCategoryStore;