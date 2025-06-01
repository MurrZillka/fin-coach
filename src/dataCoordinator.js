// src/dataCoordinator.js
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

// Начальная загрузка всех данных
async function loadAllData() {
    if (!isUserAuthenticated()) {
        console.log('dataCoordinator: User not authenticated, skipping loadAllData');
        return;
    }

    try {
        console.log('dataCoordinator: Loading all data...');

        // Загружаем все данные параллельно
        await Promise.all([
            useBalanceStore.getState().fetchBalance(),
            useCreditStore.getState().fetchCredits(),
            useSpendingsStore.getState().fetchSpendings(),
            useCategoryStore.getState().fetchCategories(),
            useCategoryStore.getState().getCategoriesMonth(),
            useGoalsStore.getState().fetchGoals(),
            useGoalsStore.getState().getCurrentGoal(),
            useMainPageStore.getState().fetchRecommendations(),
            useRemindersStore.getState().fetchTodayReminder(),
        ]);

        console.log('dataCoordinator: All data loaded successfully');
    } catch (error) {
        console.error('dataCoordinator: Error loading data:', error);
    }
}

async function addCredit(creditData) {
    if (!isUserAuthenticated()) {
        throw new Error('User not authenticated');
    }

    try {
        console.log('dataCoordinator: Adding credit...');

        // 1. Добавляем кредит
        const result = await useCreditStore.getState().addCredit(creditData);

        // 2. Обновляем зависимые данные в нужном порядке
        await Promise.all([
            useBalanceStore.getState().fetchBalance(),
            useGoalsStore.getState().fetchGoals(),
            useGoalsStore.getState().getCurrentGoal(),
            useMainPageStore.getState().fetchRecommendations(),
            useRemindersStore.getState().fetchTodayReminder(),
        ]);

        console.log('dataCoordinator: Credit added and dependencies updated');
        return result;
    } catch (error) {
        console.error('dataCoordinator: Error adding credit:', error);
        throw error;
    }
}

async function updateCredit(id, creditData) {
    if (!isUserAuthenticated()) {
        throw new Error('User not authenticated');
    }

    try {
        console.log('dataCoordinator: Updating credit...');

        const result = await useCreditStore.getState().updateCredit(id, creditData);

        // Те же зависимости, что и при добавлении
        await Promise.all([
            useBalanceStore.getState().fetchBalance(),
            useGoalsStore.getState().fetchGoals(),
            useGoalsStore.getState().getCurrentGoal(),
            useMainPageStore.getState().fetchRecommendations(),
            useRemindersStore.getState().fetchTodayReminder(),
        ]);

        console.log('dataCoordinator: Credit updated and dependencies updated');
        return result;
    } catch (error) {
        console.error('dataCoordinator: Error updating credit:', error);
        throw error;
    }
}

async function deleteCredit(id) {
    if (!isUserAuthenticated()) {
        throw new Error('User not authenticated');
    }

    try {
        console.log('dataCoordinator: Deleting credit...');

        const result = await useCreditStore.getState().deleteCredit(id);

        // Те же зависимости
        await Promise.all([
            useBalanceStore.getState().fetchBalance(),
            useGoalsStore.getState().fetchGoals(),
            useGoalsStore.getState().getCurrentGoal(),
            useMainPageStore.getState().fetchRecommendations(),
            useRemindersStore.getState().fetchTodayReminder(),
        ]);

        console.log('dataCoordinator: Credit deleted and dependencies updated');
        return result;
    } catch (error) {
        console.error('dataCoordinator: Error deleting credit:', error);
        throw error;
    }
}

// Методы для работы с расходами
async function addSpending(spendingData) {
    if (!isUserAuthenticated()) {
        throw new Error('User not authenticated');
    }

    try {
        console.log('dataCoordinator: Adding spending...');

        // 1. Добавляем расход
        const result = await useSpendingsStore.getState().addSpending(spendingData);

        // 2. Обновляем зависимые данные
        await Promise.all([
            useBalanceStore.getState().fetchBalance(),
            useCategoryStore.getState().getCategoriesMonth(), // Месячные категории зависят от расходов
            useGoalsStore.getState().fetchGoals(),
            useGoalsStore.getState().getCurrentGoal(),
            useMainPageStore.getState().fetchRecommendations(),
            useRemindersStore.getState().fetchTodayReminder(),
        ]);

        console.log('dataCoordinator: Spending added and dependencies updated');
        return result;
    } catch (error) {
        console.error('dataCoordinator: Error adding spending:', error);
        throw error;
    }
}

async function updateSpending(id, spendingData) {
    if (!isUserAuthenticated()) {
        throw new Error('User not authenticated');
    }

    try {
        console.log('dataCoordinator: Updating spending...');

        const result = await useSpendingsStore.getState().updateSpending(id, spendingData);

        // Те же зависимости, что и при добавлении
        await Promise.all([
            useBalanceStore.getState().fetchBalance(),
            useCategoryStore.getState().getCategoriesMonth(),
            useGoalsStore.getState().fetchGoals(),
            useGoalsStore.getState().getCurrentGoal(),
            useMainPageStore.getState().fetchRecommendations(),
            useRemindersStore.getState().fetchTodayReminder(),
        ]);

        console.log('dataCoordinator: Spending updated and dependencies updated');
        return result;
    } catch (error) {
        console.error('dataCoordinator: Error updating spending:', error);
        throw error;
    }
}

async function deleteSpending(id) {
    if (!isUserAuthenticated()) {
        throw new Error('User not authenticated');
    }

    try {
        console.log('dataCoordinator: Deleting spending...');

        const result = await useSpendingsStore.getState().deleteSpending(id);

        // Те же зависимости
        await Promise.all([
            useBalanceStore.getState().fetchBalance(),
            useCategoryStore.getState().getCategoriesMonth(),
            useGoalsStore.getState().fetchGoals(),
            useGoalsStore.getState().getCurrentGoal(),
            useMainPageStore.getState().fetchRecommendations(),
            useRemindersStore.getState().fetchTodayReminder(),
        ]);

        console.log('dataCoordinator: Spending deleted and dependencies updated');
        return result;
    } catch (error) {
        console.error('dataCoordinator: Error deleting spending:', error);
        throw error;
    }
}

// После методов для расходов добавить:

// Методы для работы с целями
async function addGoal(goalData) {
    if (!isUserAuthenticated()) {
        throw new Error('User not authenticated');
    }

    try {
        console.log('dataCoordinator: Adding goal...');

        // 1. Добавляем цель
        const result = await useGoalsStore.getState().addGoal(goalData);

        // 2. Обновляем зависимые данные
        // Цели довольно независимы, но могут влиять на рекомендации
        await Promise.all([
            useMainPageStore.getState().fetchRecommendations(),
        ]);

        console.log('dataCoordinator: Goal added and dependencies updated');
        return result;
    } catch (error) {
        console.error('dataCoordinator: Error adding goal:', error);
        throw error;
    }
}

async function updateGoal(id, goalData) {
    if (!isUserAuthenticated()) {
        throw new Error('User not authenticated');
    }

    try {
        console.log('dataCoordinator: Updating goal...');

        const result = await useGoalsStore.getState().updateGoal(id, goalData);

        // Те же зависимости, что и при добавлении
        await Promise.all([
            useMainPageStore.getState().fetchRecommendations(),
        ]);

        console.log('dataCoordinator: Goal updated and dependencies updated');
        return result;
    } catch (error) {
        console.error('dataCoordinator: Error updating goal:', error);
        throw error;
    }
}

async function deleteGoal(id) {
    if (!isUserAuthenticated()) {
        throw new Error('User not authenticated');
    }

    try {
        console.log('dataCoordinator: Deleting goal...');

        const result = await useGoalsStore.getState().deleteGoal(id);

        // Те же зависимости
        await Promise.all([
            useMainPageStore.getState().fetchRecommendations(),
        ]);

        console.log('dataCoordinator: Goal deleted and dependencies updated');
        return result;
    } catch (error) {
        console.error('dataCoordinator: Error deleting goal:', error);
        throw error;
    }
}

async function setCurrentGoal(id) {
    if (!isUserAuthenticated()) {
        throw new Error('User not authenticated');
    }

    try {
        console.log('dataCoordinator: Setting current goal...');

        const result = await useGoalsStore.getState().setCurrentGoalById(id);

        // При установке текущей цели могут измениться рекомендации
        await Promise.all([
            useMainPageStore.getState().fetchRecommendations(),
        ]);

        console.log('dataCoordinator: Current goal set and dependencies updated');
        return result;
    } catch (error) {
        console.error('dataCoordinator: Error setting current goal:', error);
        throw error;
    }
}

// Обновить экспорт
export const dataCoordinator = {
    loadAllData,
    addCredit,
    updateCredit,
    deleteCredit,
    addSpending,
    updateSpending,
    deleteSpending,
    addGoal,
    updateGoal,
    deleteGoal,
    setCurrentGoal,
};