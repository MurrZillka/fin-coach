// src/02_stores/storeInitializer.js
// Этот файл инициализирует подписки между сторами ПОСЛЕ того, как все сторы определены.

// Импортируем все сторы. Важно, чтобы все сторы были импортированы здесь.
import useAuthStore from './authStore/authStore.ts';
import useBalanceStore from './balanceStore/balanceStore.ts';
import useCreditStore from './creditStore';
import useSpendingsStore from './spendingsStore';
import useCategoryStore from './categoryStore';
// --- ДОБАВЛЕНО: Импортируем стор Целей ---
import useGoalsStore from './goalsStore';
import useMainPageStore from './mainPageStore'; // ДОБАВЛЕНО: Импорт mainPageStore
// --- Конец ДОБАВЛЕНИЯ ---
import useRemindersStore from './remindersStore'; // Убедись, что путь корректен
// --- Конец ДОБАВЛЕНИЯ ---


console.log('storeInitializer: Initializing store subscriptions...'); // Лог начала инициализации

// --- Настройка подписки для BalanceStore ---
useAuthStore.subscribe(
    (authState) => {
        console.log('storeInitializer: BalanceStore subscription triggered by auth state change.', authState);
        const balanceStoreState = useBalanceStore.getState();
        if (!authState.isAuthenticated && balanceStoreState.balance !== null) {
            console.log('storeInitializer: User became unauthenticated, triggering balanceStore reset.');
            balanceStoreState.resetBalance();
        }
    },
    (state) => ({ isAuthenticated: state.isAuthenticated })
);
console.log('storeInitializer: BalanceStore subscription set up.'); // Лог установки

// --- Настройка подписки для CreditStore ---
useAuthStore.subscribe(
    (authState) => {
        console.log('storeInitializer: CreditStore subscription triggered by auth state change.', authState);
        const creditStoreState = useCreditStore.getState();
        if (!authState.isAuthenticated && creditStoreState.credits !== null) {
            console.log('storeInitializer: User became unauthenticated, triggering creditStore reset.');
            creditStoreState.resetCredits();
        }
    },
    (state) => ({ isAuthenticated: state.isAuthenticated })
);
console.log('storeInitializer: CreditStore subscription set up.'); // Лог установки

// --- Настройка подписки для SpendingsStore ---
useAuthStore.subscribe(
    (authState) => {
        console.log('storeInitializer: SpendingsStore subscription triggered by auth state change.', authState);
        const spendingsStoreState = useSpendingsStore.getState();
        if (!authState.isAuthenticated && spendingsStoreState.spendings !== null) {
            console.log('storeInitializer: User became unauthenticated, triggering spendingsStore reset.');
            spendingsStoreState.resetSpendings();
        }
    },
    (state) => ({ isAuthenticated: state.isAuthenticated })
);
console.log('storeInitializer: SpendingsStore subscription set up.'); // Лог установки


// --- Настройка подписки для CategoryStore ---
useAuthStore.subscribe(
    (authState) => {
        console.log('storeInitializer: CategoryStore subscription triggered by auth state change.', authState);
        const categoryStoreState = useCategoryStore.getState();
        if (!authState.isAuthenticated && categoryStoreState.categories !== null) {
            console.log('storeInitializer: User became unauthenticated, triggering categoryStore reset.');
            categoryStoreState.resetCategories();
        }
    },
    (state) => ({ isAuthenticated: state.isAuthenticated })
);
console.log('storeInitializer: CategoryStore subscription set up.'); // Лог установки

// --- ДОБАВЛЕНО: Настройка подписки для GoalsStore ---
useAuthStore.subscribe(
    (authState) => {
        console.log('storeInitializer: GoalsStore subscription triggered by auth state change.', authState);
        const goalsStoreState = useGoalsStore.getState();
        // Сбрасываем цели, если пользователь становится не аутентифицирован И если в сторе целей есть данные, которые нужно сбросить.
        // Проверяем, если goals !== null ИЛИ currentGoal !== null
        if (!authState.isAuthenticated && (goalsStoreState.goals !== null || goalsStoreState.currentGoal !== null)) {
            console.log('storeInitializer: User became unauthenticated, triggering goalsStore reset.');
            goalsStoreState.resetGoals(); // Вызываем действие сброса в goalsStore
        }
    },
    (state) => ({ isAuthenticated: state.isAuthenticated })
);
console.log('storeInitializer: GoalsStore subscription set up.'); // Лог установки
// --- Конец ДОБАВЛЕНИЯ ---
useAuthStore.subscribe(
    (authState) => {
        console.log('storeInitializer: MainPageStore subscription triggered by auth state change.', authState);
        const mainPageStoreState = useMainPageStore.getState();
        if (!authState.isAuthenticated && (mainPageStoreState.recommendations !== null || mainPageStoreState.financialEntries !== null)) {
            console.log('storeInitializer: User became unauthenticated, triggering mainPageStore reset.');
            mainPageStoreState.resetMainPage();
        }
    },
    (state) => ({ isAuthenticated: state.isAuthenticated })
);
console.log('storeInitializer: MainPageStore subscription set up.');

// --- ДОБАВЛЕНО: Настройка подписки для RemindersStore ---
useAuthStore.subscribe(
    (authState) => {
        console.log('storeInitializer: RemindersStore subscription triggered by auth state change.', authState);
        const remindersStoreState = useRemindersStore.getState();
        // Сбрасываем напоминания, если пользователь становится не аутентифицирован
        // И если в сторе напоминаний есть данные (todayReminder не null).
        if (!authState.isAuthenticated && remindersStoreState.todayReminder !== null) {
            console.log('storeInitializer: User became unauthenticated, triggering remindersStore reset.');
            remindersStoreState.resetReminders(); // Вызываем действие сброса в remindersStore
        }
    },
    (state) => ({ isAuthenticated: state.isAuthenticated })
);
console.log('storeInitializer: RemindersStore subscription set up.');
// --- Конец ДОБАВЛЕНИЯ ---


console.log('storeInitializer: Store subscriptions initialization finished.'); // Лог завершения

// Этот файл не экспортирует ничего, его просто нужно импортировать в корневом файле приложения (например, в main.jsx или App.jsx).