// src/stores/storeInitializer.js
// Этот файл инициализирует подписки между сторами ПОСЛЕ того, как все сторы определены.

// Импортируем все сторы. Важно, чтобы все сторы были импортированы здесь.
import useAuthStore from './authStore';
import useBalanceStore from './balanceStore';
import useCreditStore from './creditStore';
import useSpendingsStore from './spendingsStore';
import useCategoryStore from './categoryStore';

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

console.log('storeInitializer: Store subscriptions initialization finished.'); // Лог завершения

// Этот файл не экспортирует ничего, его просто нужно импортировать в корневом файле приложения.