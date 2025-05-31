import useAuthStore from './stores/authStore';
import useBalanceStore from './stores/balanceStore';
import useCreditStore from './stores/creditStore';
import useSpendingsStore from './stores/spendingsStore';
import useCategoryStore from './stores/categoryStore';
import useGoalsStore from './stores/goalsStore';
import useMainPageStore from './stores/mainPageStore';

function fetchAll () {
    useBalanceStore.getState().fetchBalance();
    useCreditStore.getState().fetchCredits();
    useSpendingsStore.getState().fetchSpendings();
    useCategoryStore.getState().fetchCategories();
    useGoalsStore.getState().fetchGoals();
    useGoalsStore.getState().getCurrentGoal();
    useMainPageStore.getState().fetchRecommendations();
}

function resetAll () {
    useBalanceStore.getState().resetBalance();
    // useCreditStore.getState().resetCredits();
    // useSpendingsStore.getState().resetSpendings();
    // useCategoryStore.getState().resetCategories();
    // useGoalsStore.getState().resetGoals();
    // useMainPageStore.getState().resetRecommendations();
}

export function initializeStoreCoordinator() {
    useAuthStore.subscribe(
        (state) => state.isAuthenticated,
        (isAuthenticated, previousIsAuthenticated) => {
            console.log('storeCoordinator: Subscription triggered. isAuthenticated:', isAuthenticated, 'previousIsAuthenticated:', previousIsAuthenticated);
            if (isAuthenticated && !previousIsAuthenticated) {
                console.log('storeCoordinator: User authenticated, triggering dependent store updates...');
                fetchAll();
            } else if (!isAuthenticated && previousIsAuthenticated) {
                console.log('storeCoordinator: User logged out, resetting dependent stores...');
                resetAll()
            }
        }
    );

    const initialIsAuthenticated = useAuthStore.getState().isAuthenticated;
    if (initialIsAuthenticated) {
        console.log('storeCoordinator: Initial state check after subscription - User is authenticated, triggering dependent store updates...');
        fetchAll();
    }

    console.log('storeCoordinator: Initialized subscriptions.');
}