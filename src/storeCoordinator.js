import useAuthStore from './stores/authStore';
import useBalanceStore from './stores/balanceStore';
import useCreditStore from './stores/creditStore';
import useSpendingsStore from './stores/spendingsStore';
import useCategoryStore from './stores/categoryStore';
import useGoalsStore from './stores/goalsStore';
import useMainPageStore from './stores/mainPageStore';
import useRemindersStore from "./stores/remindersStore.js";

function isUserAuthenticated() {
    return useAuthStore.getState().isAuthenticated;
}

function fetchAll() {
    if (!isUserAuthenticated()) {
        console.log('storeCoordinator: User not authenticated, skipping fetchAll');
        return;
    }
    useBalanceStore.getState().fetchBalance();
    useCreditStore.getState().fetchCredits();
    useSpendingsStore.getState().fetchSpendings();
    useCategoryStore.getState().fetchCategories();
    useGoalsStore.getState().fetchGoals();
    useGoalsStore.getState().getCurrentGoal();
    useMainPageStore.getState().fetchRecommendations();
}

function resetAll() {
    useBalanceStore.getState().resetBalance();
    useCreditStore.getState().resetCredits();
    // useSpendingsStore.getState().resetSpendings();
    // useCategoryStore.getState().resetCategories();
    // useGoalsStore.getState().resetGoals();
    // useMainPageStore.getState().resetRecommendations();
}

function updateCreditStore() {
    if (!isUserAuthenticated()) {
        console.log('storeCoordinator: User not authenticated, skipping fetchAll');
        return;
    }
    useBalanceStore.getState().fetchBalance();
    useSpendingsStore.getState().fetchSpendings();
    useCategoryStore.getState().fetchCategories();
    useGoalsStore.getState().fetchGoals();
    useGoalsStore.getState().getCurrentGoal();
    useMainPageStore.getState().fetchRecommendations();
    useRemindersStore.getState().fetchTodayReminder();
}

export function initializeStoreCoordinator() {
    // Подписка на аутентификацию
    const unsubscribeAuth = useAuthStore.subscribe(
        (state) => state.isAuthenticated,
        (isAuthenticated, previousIsAuthenticated) => {
            console.log('storeCoordinator: Auth changed:', isAuthenticated, 'previous:', previousIsAuthenticated);

            if (isAuthenticated && !previousIsAuthenticated) {
                console.log('storeCoordinator: User authenticated, fetching all data...');
                fetchAll();
            } else if (!isAuthenticated && previousIsAuthenticated) {
                console.log('storeCoordinator: User logged out, resetting stores...');
                resetAll();
            }
        }
    );

    // Подписка на кредиты - убираем лишнюю проверку и исключаем fetchCredits из updateCreditStore
    const unsubscribeCredits = useCreditStore.subscribe(
        (state) => state.credits,
        () => {
            console.log('storeCoordinator: Credits changed, updating dependent stores...');
            // Обновляем только зависимые сторы, НЕ сам кредитный стор
            updateCreditStore();
        }
    );

    // Проверка начального состояния
    const initialIsAuthenticated = useAuthStore.getState().isAuthenticated;
    if (initialIsAuthenticated) {
        console.log('storeCoordinator: Initial auth check - fetching data...');
        fetchAll();
    }

    console.log('storeCoordinator: Subscriptions initialized.');

    // Возвращаем функцию для отписки от всех подписок
    return () => {
        unsubscribeAuth();
        unsubscribeCredits();
        console.log('storeCoordinator: All subscriptions cleaned up.');
    };
}