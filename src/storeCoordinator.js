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
    try {
        useBalanceStore.getState().fetchBalance();
        useCreditStore.getState().fetchCredits();
        useSpendingsStore.getState().fetchSpendings();
        useCategoryStore.getState().fetchCategories();
        useCategoryStore.getState().getCategoriesMonth();
        useGoalsStore.getState().fetchGoals();
        useGoalsStore.getState().getCurrentGoal();
        useMainPageStore.getState().fetchRecommendations();
    } catch (error) {
        console.error('storeCoordinator: Error in fetchAll:', error);
    }

}

function resetAll() {
    try {
        useBalanceStore.getState().resetBalance();
        useCreditStore.getState().resetCredits();
        useSpendingsStore.getState().resetSpendings();
        useCategoryStore.getState().resetCategories();
        useGoalsStore.getState().resetGoals();
        useCategoryStore.getState().getCategoriesMonth();
        // useMainPageStore.getState().resetRecommendations();
    } catch (error) {
        console.error('storeCoordinator: Error in resetAll:', error);
    }
}

// Обновления при изменении кредитов
function updateCreditStore() {
    if (!isUserAuthenticated()) {
        console.log('storeCoordinator: User not authenticated, skipping updateCreditStore');
        return;
    }
    try {
        useBalanceStore.getState().fetchBalance();
        useGoalsStore.getState().fetchGoals();
        useGoalsStore.getState().getCurrentGoal();
        useMainPageStore.getState().fetchRecommendations();
        useRemindersStore.getState().fetchTodayReminder();
    } catch (error) {
        console.log('storeCoordinator: Error in updateCreditStore:', error);
    }
}

// Обновления при изменении расходов
function updateSpendingsStore() {
    if (!isUserAuthenticated()) {
        console.log('storeCoordinator: User not authenticated, skipping updateSpendingsStore');
        return;
    }
    try {
        useBalanceStore.getState().fetchBalance();
        // useCategoryStore.getState().fetchCategories();
        useCategoryStore.getState().getCategoriesMonth();
        useGoalsStore.getState().fetchGoals();
        useGoalsStore.getState().getCurrentGoal();
        useMainPageStore.getState().fetchRecommendations();
        useRemindersStore.getState().fetchTodayReminder();
    } catch (error) {
        console.log('storeCoordinator: Error in updateSpendingsStore:', error);
    }
}

// При изменении категорий - только расходы и месячные категории
function updateCategoryStore() {
    if (!isUserAuthenticated()) {
        console.log('storeCoordinator: User not authenticated, skipping updateCategoryStore');
        return;
    }
    try {
        useSpendingsStore.getState().fetchSpendings(); // Расходы зависят от категорий
    } catch (error) {
        console.log('storeCoordinator: Error in updateCategoryStore:', error);
    }
}

// При изменении целей - возможно вообще ничего не обновлять
function updateGoalsStore() {
    if (!isUserAuthenticated()) {
        console.log('storeCoordinator: User not authenticated, skipping updateGoalsStore');
        return;
    }
    try {
        // Пока оставляем пустым - цели довольно независимы
        // Возможно только рекомендации зависят от целей?
        // useMainPageStore.getState().fetchRecommendations();
    } catch (error) {
        console.log('storeCoordinator: Error in updateGoalsStore:', error);
    }
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

    // Подписка на кредиты
    const unsubscribeCredits = useCreditStore.subscribe(
        (state) => state.credits,
        () => {
            console.log('storeCoordinator: Credits changed, updating dependent stores...');
            updateCreditStore();
        }
    );

    // Подписка на расходы
    const unsubscribeSpendings = useSpendingsStore.subscribe(
        (state) => state.spendings,
        () => {
            console.log('storeCoordinator: Spendings changed, updating dependent stores...');
            updateSpendingsStore();
        }
    );

    // Подписка на категории
    const unsubscribeCategories = useCategoryStore.subscribe(
        (state) => state.categories,
        () => {
            console.log('storeCoordinator: Categories changed, updating dependent stores...');
            updateCategoryStore();
        }
    );

    // Подписка на цели (пока с пустой функцией)
    const unsubscribeGoals = useGoalsStore.subscribe(
        (state) => state.goals,
        () => {
            console.log('storeCoordinator: Goals changed, updating dependent stores...');
            updateGoalsStore();
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
        unsubscribeSpendings();
        unsubscribeGoals();
        unsubscribeCategories();
        console.log('storeCoordinator: All subscriptions cleaned up.');
    };
}
