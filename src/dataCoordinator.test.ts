// src/dataCoordinator.test.js
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dataCoordinator } from './dataCoordinator';

// Мокаем сторы как модули, а не как функции
vi.mock('./02_stores/authStore/authStore', () => ({
    default: {
        getState: vi.fn()
    }
}));

vi.mock('./02_stores/balanceStore/balanceStore', () => ({
    default: {
        getState: vi.fn()
    }
}));

vi.mock('./02_stores/creditsStore/creditStore', () => ({
    default: {
        getState: vi.fn()
    }
}));

vi.mock('./02_stores/spendingsStore/spendingsStore', () => ({
    default: {
        getState: vi.fn()
    }
}));

vi.mock('./02_stores/categoryStore/categoryStore', () => ({
    default: {
        getState: vi.fn()
    }
}));

vi.mock('./02_stores/goalsStore/goalsStore', () => ({
    default: {
        getState: vi.fn()
    }
}));

vi.mock('./02_stores/mainPageStore/mainPageStore', () => ({
    default: {
        getState: vi.fn()
    }
}));

vi.mock('./02_stores/remindersStore/remindersStore', () => ({
    default: {
        getState: vi.fn()
    }
}));

// Импортируем замоканные сторы
import useAuthStore from './02_stores/authStore/authStore';
import useBalanceStore from './02_stores/balanceStore/balanceStore';
import useCreditStore from './02_stores/creditsStore/creditStore';
import useSpendingsStore from './02_stores/spendingsStore/spendingsStore';
import useCategoryStore from './02_stores/categoryStore/categoryStore';
import useGoalsStore from './02_stores/goalsStore/goalsStore';
import useMainPageStore from './02_stores/mainPageStore/mainPageStore';
import useRemindersStore from './02_stores/remindersStore/remindersStore';

describe('dataCoordinator', () => {
    // Создаем моки для функций сторов
    const createMockStoreFunctions = () => ({
        fetchBalance: vi.fn().mockResolvedValue(undefined),
        fetchCredits: vi.fn().mockResolvedValue(undefined),
        fetchSpendings: vi.fn().mockResolvedValue(undefined),
        fetchCategories: vi.fn().mockResolvedValue(undefined),
        getCategoriesMonth: vi.fn().mockResolvedValue(undefined),
        fetchGoals: vi.fn().mockResolvedValue(undefined),
        getCurrentGoal: vi.fn().mockResolvedValue(undefined),
        fetchRecommendations: vi.fn().mockResolvedValue(undefined),
        fetchTodayReminder: vi.fn().mockResolvedValue(undefined),
        addCredit: vi.fn(),
        updateCredit: vi.fn(),
        deleteCredit: vi.fn(),
        addSpending: vi.fn(),
        updateSpending: vi.fn(),
        deleteSpending: vi.fn(),
        addGoal: vi.fn(),
        updateGoal: vi.fn(),
        deleteGoal: vi.fn(),
        setCurrentGoalById: vi.fn(),
        addCategory: vi.fn(),
        updateCategory: vi.fn(),
        deleteCategory: vi.fn(),
        clearError: vi.fn(),
    });

    let mockFunctions;
    let mockAuthState;

    beforeEach(() => {
        mockFunctions = createMockStoreFunctions();
        mockAuthState = { isAuthenticated: true };

        // Настраиваем моки для getState
        vi.mocked(useAuthStore.getState).mockReturnValue(mockAuthState);
        vi.mocked(useBalanceStore.getState).mockReturnValue(mockFunctions);
        vi.mocked(useCreditStore.getState).mockReturnValue(mockFunctions);
        vi.mocked(useSpendingsStore.getState).mockReturnValue(mockFunctions);
        vi.mocked(useCategoryStore.getState).mockReturnValue(mockFunctions);
        vi.mocked(useGoalsStore.getState).mockReturnValue(mockFunctions);
        vi.mocked(useMainPageStore.getState).mockReturnValue(mockFunctions);
        vi.mocked(useRemindersStore.getState).mockReturnValue(mockFunctions);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('loadAllData', () => {
        it('should load all data when user is authenticated', async () => {
            // Act
            await dataCoordinator.loadAllData();

            // Assert
            expect(mockFunctions.fetchBalance).toHaveBeenCalledTimes(1);
            expect(mockFunctions.fetchCredits).toHaveBeenCalledTimes(1);
            expect(mockFunctions.fetchSpendings).toHaveBeenCalledTimes(1);
            expect(mockFunctions.fetchCategories).toHaveBeenCalledTimes(1);
            expect(mockFunctions.getCategoriesMonth).toHaveBeenCalledTimes(1);
            expect(mockFunctions.fetchGoals).toHaveBeenCalledTimes(1);
            expect(mockFunctions.getCurrentGoal).toHaveBeenCalledTimes(1);
            expect(mockFunctions.fetchRecommendations).toHaveBeenCalledTimes(1);
            expect(mockFunctions.fetchTodayReminder).toHaveBeenCalledTimes(1);
        });

        it('should not load data when user is not authenticated', async () => {
            // Arrange
            mockAuthState.isAuthenticated = false;

            // Act
            await dataCoordinator.loadAllData();

            // Assert
            expect(mockFunctions.fetchBalance).not.toHaveBeenCalled();
            expect(mockFunctions.fetchCredits).not.toHaveBeenCalled();
        });
    });

    describe('Credit operations', () => {
        const mockCreditData = {
            name: 'Test Credit',
            amount: 1000,
            rate: 5,
            description: 'Test credit description',
            date: '2025-01-01',
            is_permanent: false,
            end_date: '2025-12-31'
        };
        const mockCreditResponse = { ok: true, message: 'Success' };

        it('should add credit and update dependencies', async () => {
            // Arrange
            mockFunctions.addCredit.mockResolvedValue(mockCreditResponse);

            // Act
            const result = await dataCoordinator.addCredit(mockCreditData);

            // Assert
            expect(mockFunctions.addCredit).toHaveBeenCalledWith(mockCreditData);
            expect(mockFunctions.fetchBalance).toHaveBeenCalledTimes(1);
            expect(mockFunctions.fetchGoals).toHaveBeenCalledTimes(1);
            expect(mockFunctions.getCurrentGoal).toHaveBeenCalledTimes(1);
            expect(mockFunctions.fetchRecommendations).toHaveBeenCalledTimes(1);
            expect(mockFunctions.fetchTodayReminder).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockCreditResponse);
        });

        it('should update credit and update dependencies', async () => {
            // Arrange
            const creditId = 1;
            mockFunctions.updateCredit.mockResolvedValue(mockCreditResponse);

            // Act
            const result = await dataCoordinator.updateCredit(creditId, mockCreditData);

            // Assert
            expect(mockFunctions.updateCredit).toHaveBeenCalledWith(creditId, mockCreditData);
            expect(mockFunctions.fetchBalance).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockCreditResponse);
        });

        it('should delete credit and update dependencies', async () => {
            // Arrange
            const creditId = 1;
            mockFunctions.deleteCredit.mockResolvedValue(mockCreditResponse);

            // Act
            const result = await dataCoordinator.deleteCredit(creditId);

            // Assert
            expect(mockFunctions.deleteCredit).toHaveBeenCalledWith(creditId);
            expect(mockFunctions.fetchBalance).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockCreditResponse);
        });

        it('should throw error when user is not authenticated', async () => {
            // Arrange
            mockAuthState.isAuthenticated = false;

            // Act & Assert
            await expect(dataCoordinator.addCredit(mockCreditData))
                .rejects.toThrow('User not authenticated');
        });
    });

    describe('Spending operations', () => {
        const mockSpendingData = {
            amount: 100,
            category_id: 1,
            description: 'Test spending',
            date: '2025-01-01',
            is_permanent: false,
            end_date: '2025-12-31'
        };
        const mockSpendingResponse = { ok: true, message: 'Success' };

        it('should add spending and update dependencies', async () => {
            // Arrange
            mockFunctions.addSpending.mockResolvedValue(mockSpendingResponse);

            // Act
            const result = await dataCoordinator.addSpending(mockSpendingData);

            // Assert
            expect(mockFunctions.addSpending).toHaveBeenCalledWith(mockSpendingData);
            expect(mockFunctions.fetchBalance).toHaveBeenCalledTimes(1);
            expect(mockFunctions.getCategoriesMonth).toHaveBeenCalledTimes(1);
            expect(mockFunctions.fetchGoals).toHaveBeenCalledTimes(1);
            expect(mockFunctions.getCurrentGoal).toHaveBeenCalledTimes(1);
            expect(mockFunctions.fetchRecommendations).toHaveBeenCalledTimes(1);
            expect(mockFunctions.fetchTodayReminder).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockSpendingResponse);
        });

        it('should update spending and update dependencies', async () => {
            // Arrange
            const spendingId = 1;
            mockFunctions.updateSpending.mockResolvedValue(mockSpendingResponse);

            // Act
            const result = await dataCoordinator.updateSpending(spendingId, mockSpendingData);

            // Assert
            expect(mockFunctions.updateSpending).toHaveBeenCalledWith(spendingId, mockSpendingData);
            expect(mockFunctions.fetchBalance).toHaveBeenCalledTimes(1);
            expect(mockFunctions.getCategoriesMonth).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockSpendingResponse);
        });

        it('should delete spending and update dependencies', async () => {
            // Arrange
            const spendingId = 1;
            mockFunctions.deleteSpending.mockResolvedValue(mockSpendingResponse);

            // Act
            const result = await dataCoordinator.deleteSpending(spendingId);

            // Assert
            expect(mockFunctions.deleteSpending).toHaveBeenCalledWith(spendingId);
            expect(result).toBe(mockSpendingResponse);
        });
    });

    describe('Goal operations', () => {
        const mockGoalData = {
            name: 'Save Money',
            amount: 5000,
            description: 'Test goal description',
            deadline: '2025-12-31',
            wish_date: '2025-06-01'
        };
        const mockGoalResponse = { ok: true, message: 'Success' };

        it('should add goal and update dependencies', async () => {
            // Arrange
            mockFunctions.addGoal.mockResolvedValue(mockGoalResponse);

            // Act
            const result = await dataCoordinator.addGoal(mockGoalData);

            // Assert
            expect(mockFunctions.addGoal).toHaveBeenCalledWith(mockGoalData);
            expect(mockFunctions.fetchRecommendations).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockGoalResponse);
        });

        it('should update goal and update dependencies', async () => {
            // Arrange
            const goalId = 1;
            mockFunctions.updateGoal.mockResolvedValue(mockGoalResponse);

            // Act
            const result = await dataCoordinator.updateGoal(goalId, mockGoalData);

            // Assert
            expect(mockFunctions.updateGoal).toHaveBeenCalledWith(goalId, mockGoalData);
            expect(mockFunctions.fetchRecommendations).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockGoalResponse);
        });

        it('should delete goal and update dependencies', async () => {
            // Arrange
            const goalId = 1;
            mockFunctions.deleteGoal.mockResolvedValue(mockGoalResponse);

            // Act
            const result = await dataCoordinator.deleteGoal(goalId);

            // Assert
            expect(mockFunctions.deleteGoal).toHaveBeenCalledWith(goalId);
            expect(result).toBe(mockGoalResponse);
        });

        it('should set current goal and update dependencies', async () => {
            // Arrange
            const goalId = 1;
            mockFunctions.setCurrentGoalById.mockResolvedValue(mockGoalResponse);

            // Act
            const result = await dataCoordinator.setCurrentGoalById(goalId);

            // Assert
            expect(mockFunctions.setCurrentGoalById).toHaveBeenCalledWith(goalId);
            expect(mockFunctions.fetchRecommendations).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockGoalResponse);
        });
    });

    describe('Category operations', () => {
        const mockCategoryData = {
            name: 'Food',
            description: 'Food expenses'
        };
        const mockCategoryResponse = { message: 'Success' };

        it('should add category and update dependencies', async () => {
            // Arrange
            mockFunctions.addCategory.mockResolvedValue(mockCategoryResponse);

            // Act
            const result = await dataCoordinator.addCategory(mockCategoryData);

            // Assert
            expect(mockFunctions.addCategory).toHaveBeenCalledWith(mockCategoryData);
            expect(mockFunctions.fetchSpendings).toHaveBeenCalledTimes(1);
            expect(mockFunctions.getCategoriesMonth).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockCategoryResponse);
        });

        it('should update category and update dependencies', async () => {
            // Arrange
            const categoryId = 1;
            mockFunctions.updateCategory.mockResolvedValue(mockCategoryResponse);

            // Act
            const result = await dataCoordinator.updateCategory(categoryId, mockCategoryData);

            // Assert
            expect(mockFunctions.updateCategory).toHaveBeenCalledWith(categoryId, mockCategoryData);
            expect(mockFunctions.fetchSpendings).toHaveBeenCalledTimes(1);
            expect(mockFunctions.getCategoriesMonth).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockCategoryResponse);
        });

        it('should delete category and update dependencies', async () => {
            // Arrange
            const categoryId = 1;
            mockFunctions.deleteCategory.mockResolvedValue(mockCategoryResponse);

            // Act
            const result = await dataCoordinator.deleteCategory(categoryId);

            // Assert
            expect(mockFunctions.deleteCategory).toHaveBeenCalledWith(categoryId);
            expect(result).toBe(mockCategoryResponse);
        });
    });

    describe('Error handling', () => {
        it('should handle errors in credit operations', async () => {
            // Arrange
            const mockError = new Error('API Error');
            mockFunctions.addCredit.mockRejectedValue(mockError);

            const mockCreditData = {
                name: 'Test Credit',
                amount: 1000,
                rate: 5,
                description: 'Test credit description',
                date: '2025-01-01',
                is_permanent: false,
                end_date: '2025-12-31'
            };

            // Act & Assert
            await expect(dataCoordinator.addCredit(mockCreditData))
                .rejects.toThrow('API Error');
        });

        it('should handle errors in spending operations', async () => {
            // Arrange
            const mockError = new Error('Spending API Error');
            mockFunctions.addSpending.mockRejectedValue(mockError);

            const mockSpendingData = {
                amount: 100,
                category_id: 1,
                description: 'Test spending',
                date: '2025-01-01',
                is_permanent: false,
                end_date: '2025-12-31'
            };

            // Act & Assert
            await expect(dataCoordinator.addSpending(mockSpendingData))
                .rejects.toThrow('Spending API Error');
        });

        it('should handle errors in goal operations', async () => {
            // Arrange
            const mockError = new Error('Goal API Error');
            mockFunctions.addGoal.mockRejectedValue(mockError);

            const mockGoalData = {
                name: 'Test Goal',
                amount: 1000,
                description: 'Test goal description',
                deadline: '2025-12-31',
                wish_date: '2025-06-01'
            };

            // Act & Assert
            await expect(dataCoordinator.addGoal(mockGoalData))
                .rejects.toThrow('Goal API Error');
        });

        it('should handle errors in category operations', async () => {
            // Arrange
            const mockError = new Error('Category API Error');
            mockFunctions.addCategory.mockRejectedValue(mockError);

            // Act & Assert
            await expect(dataCoordinator.addCategory({ name: 'Test Category', description: 'Test' }))
                .rejects.toThrow('Category API Error');
        });
    });
});