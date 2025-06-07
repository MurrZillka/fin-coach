// src/02_stores/storeInitializer/storeInitializer.test.ts
import { describe, it, beforeEach, expect, vi, afterEach } from 'vitest';

// Создаём vi.fn() для всех reset-методов и subscribe
const mockSubscribe = vi.fn();
const mockResetBalance = vi.fn();
const mockResetCredits = vi.fn();
const mockResetSpendings = vi.fn();
const mockResetCategories = vi.fn();
const mockResetGoals = vi.fn();
const mockResetRecommendations = vi.fn();
const mockResetReminders = vi.fn();

beforeEach(() => {
    vi.resetModules();
    vi.doMock('../authStore/authStore', () => ({
        default: { subscribe: mockSubscribe }
    }));
    vi.doMock('../balanceStore/balanceStore', () => ({
        default: { getState: () => ({ balance: 123, resetBalance: mockResetBalance }) }
    }));
    vi.doMock('../creditsStore/creditStore', () => ({
        default: { getState: () => ({ credits: [1], resetCredits: mockResetCredits }) }
    }));
    vi.doMock('../spendingsStore/spendingsStore', () => ({
        default: { getState: () => ({ spendings: [1], resetSpendings: mockResetSpendings }) }
    }));
    vi.doMock('../categoryStore/categoryStore', () => ({
        default: { getState: () => ({ categories: [1], resetCategories: mockResetCategories }) }
    }));
    vi.doMock('../goalsStore/goalsStore', () => ({
        default: { getState: () => ({ goals: [1], currentGoal: null, resetGoals: mockResetGoals }) }
    }));
    vi.doMock('../mainPageStore/mainPageStore', () => ({
        default: { getState: () => ({ recommendations: [1], resetRecommendations: mockResetRecommendations }) }
    }));
    vi.doMock('../remindersStore/remindersStore', () => ({
        default: { getState: () => ({ todayReminder: { TodayRemind: { need_remind: true } }, resetReminders: mockResetReminders }) }
    }));
});

afterEach(() => {
    vi.clearAllMocks();
});

describe('storeInitializer', () => {
    it('подписывает все сторы на useAuthStore', async () => {
        await import('./storeInitializer');
        expect(mockSubscribe).toHaveBeenCalledTimes(7);
    });

    it('сбрасывает balanceStore при выходе пользователя', async () => {
        await import('./storeInitializer');
        const [selector, listener] = mockSubscribe.mock.calls[0];
        listener(false, true);
        expect(mockResetBalance).toHaveBeenCalledTimes(1);
    });

    it('сбрасывает creditStore при выходе пользователя', async () => {
        await import('./storeInitializer');
        const [selector, listener] = mockSubscribe.mock.calls[1];
        listener(false, true);
        expect(mockResetCredits).toHaveBeenCalledTimes(1);
    });

    it('сбрасывает spendingsStore при выходе пользователя', async () => {
        await import('./storeInitializer');
        const [selector, listener] = mockSubscribe.mock.calls[2];
        listener(false, true);
        expect(mockResetSpendings).toHaveBeenCalledTimes(1);
    });

    it('сбрасывает categoryStore при выходе пользователя', async () => {
        await import('./storeInitializer');
        const [selector, listener] = mockSubscribe.mock.calls[3];
        listener(false, true);
        expect(mockResetCategories).toHaveBeenCalledTimes(1);
    });

    it('сбрасывает goalsStore при выходе пользователя', async () => {
        await import('./storeInitializer');
        const [selector, listener] = mockSubscribe.mock.calls[4];
        listener(false, true);
        expect(mockResetGoals).toHaveBeenCalledTimes(1);
    });

    it('сбрасывает mainPageStore при выходе пользователя', async () => {
        await import('./storeInitializer');
        const [selector, listener] = mockSubscribe.mock.calls[5];
        listener(false, true);
        expect(mockResetRecommendations).toHaveBeenCalledTimes(1);
    });

    it('сбрасывает remindersStore при выходе пользователя', async () => {
        await import('./storeInitializer');
        const [selector, listener] = mockSubscribe.mock.calls[6];
        listener(false, true);
        expect(mockResetReminders).toHaveBeenCalledTimes(1);
    });

    it('не сбрасывает balanceStore при входе пользователя', async () => {
        await import('./storeInitializer');
        const [selector, listener] = mockSubscribe.mock.calls[0];
        listener(true, false);
        expect(mockResetBalance).not.toHaveBeenCalled();
    });

    it('не сбрасывает remindersStore если todayReminder === null', async () => {
        vi.doMock('../remindersStore/remindersStore', () => ({
            default: { getState: () => ({ todayReminder: null, resetReminders: mockResetReminders }) }
        }));
        await import('./storeInitializer');
        const [selector, listener] = mockSubscribe.mock.calls[6];
        listener(false, true);
        expect(mockResetReminders).not.toHaveBeenCalled();
    });
});
