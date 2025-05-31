// storeCoordinator.js
import useAuthStore from './stores/authStore';
import useBalanceStore from './stores/balanceStore';
import useCreditStore from './stores/creditStore';
import useSpendingsStore from './stores/spendingsStore';
import useCategoryStore from './stores/categoryStore';
import useGoalsStore from './stores/goalsStore';
import useMainPageStore from './stores/mainPageStore';

export function initializeStoreCoordinator() {
    // Подписка на изменения isAuthenticated
    useAuthStore.subscribe(
        (state) => state.isAuthenticated,
        (isAuthenticated, previousIsAuthenticated) => {
            console.log('storeCoordinator: Subscription triggered. isAuthenticated:', isAuthenticated, 'previousIsAuthenticated:', previousIsAuthenticated);
            if (isAuthenticated && !previousIsAuthenticated) {
                console.log('storeCoordinator: User authenticated, triggering dependent store updates...');
                useBalanceStore.getState().fetchBalance();
                useCreditStore.getState().fetchCredits();
                useSpendingsStore.getState().fetchSpendings();
                useCategoryStore.getState().fetchCategories();
                useGoalsStore.getState().fetchGoals();
                useGoalsStore.getState().getCurrentGoal();
                useMainPageStore.getState().fetchRecommendations();
            }
        }
    );

    // Проверяем начальное состояние после подписки
    const initialIsAuthenticated = useAuthStore.getState().isAuthenticated;
    if (initialIsAuthenticated) {
        console.log('storeCoordinator: Initial state check after subscription - User is authenticated, triggering dependent store updates...');
        useBalanceStore.getState().fetchBalance();
        useCreditStore.getState().fetchCredits();
        useSpendingsStore.getState().fetchSpendings();
        useCategoryStore.getState().fetchCategories();
        useGoalsStore.getState().fetchGoals();
        useGoalsStore.getState().getCurrentGoal();
        useMainPageStore.getState().fetchRecommendations();
    }

    console.log('storeCoordinator: Initialized subscriptions.');
}