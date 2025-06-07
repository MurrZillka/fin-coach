// src/02_stores/storeInitializer/storeInitializer.ts

import useAuthStore from '../authStore/authStore';
import useBalanceStore from '../balanceStore/balanceStore';
import useCreditStore from '../creditsStore/creditStore';
import useSpendingsStore from '../spendingsStore/spendingsStore';
import useCategoryStore from '../categoryStore/categoryStore';
import useGoalsStore from '../goalsStore/goalsStore';
import useMainPageStore from '../mainPageStore/mainPageStore';
import useRemindersStore from '../remindersStore/remindersStore';

console.log('storeInitializer: Initializing store subscriptions...');

// --- BalanceStore ---
useAuthStore.subscribe(
    state => state.isAuthenticated,
    (isAuthenticated, prev) => {
        const balanceStoreState = useBalanceStore.getState();
        if (!isAuthenticated && balanceStoreState.balance !== null) {
            balanceStoreState.resetBalance();
        }
    }
);

// --- CreditStore ---
useAuthStore.subscribe(
    state => state.isAuthenticated,
    (isAuthenticated, prev) => {
        const creditStoreState = useCreditStore.getState();
        if (!isAuthenticated && creditStoreState.credits !== null) {
            creditStoreState.resetCredits();
        }
    }
);

// --- SpendingsStore ---
useAuthStore.subscribe(
    state => state.isAuthenticated,
    (isAuthenticated, prev) => {
        const spendingsStoreState = useSpendingsStore.getState();
        if (!isAuthenticated && spendingsStoreState.spendings !== null) {
            spendingsStoreState.resetSpendings();
        }
    }
);

// --- CategoryStore ---
useAuthStore.subscribe(
    state => state.isAuthenticated,
    (isAuthenticated, prev) => {
        const categoryStoreState = useCategoryStore.getState();
        if (!isAuthenticated && categoryStoreState.categories !== null) {
            categoryStoreState.resetCategories();
        }
    }
);

// --- GoalsStore ---
useAuthStore.subscribe(
    state => state.isAuthenticated,
    (isAuthenticated, prev) => {
        const goalsStoreState = useGoalsStore.getState();
        if (
            !isAuthenticated &&
            (goalsStoreState.goals.length > 0 || goalsStoreState.currentGoal !== null)
        ) {
            goalsStoreState.resetGoals();
        }
    }
);

// --- MainPageStore ---
useAuthStore.subscribe(
    state => state.isAuthenticated,
    (isAuthenticated, prev) => {
        const mainPageStoreState = useMainPageStore.getState();
        if (!isAuthenticated && mainPageStoreState.recommendations !== null) {
            mainPageStoreState.resetRecommendations();
        }
    }
);

// --- RemindersStore ---
useAuthStore.subscribe(
    state => state.isAuthenticated,
    (isAuthenticated, prev) => {
        const remindersStoreState = useRemindersStore.getState();
        if (!isAuthenticated && remindersStoreState.todayReminder !== null) {
            remindersStoreState.resetReminders();
        }
    }
);

console.log('storeInitializer: Store subscriptions initialization finished.');
