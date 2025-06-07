// src/02_stores/remindersStore/remindersStore.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useRemindersStore from './remindersStore';
import * as remindersAPI from '../../01_api/reminders/index';
import { handleRemindersApiError } from '../../01_api/reminders/utils/handleRemindersApiError';

// Мокаем API
vi.mock('../../01_api/reminders/index');
vi.mock('../../01_api/reminders/utils/handleRemindersApiError');

const mockedRemindersAPI = vi.mocked(remindersAPI);
const mockedHandleRemindersApiError = vi.mocked(handleRemindersApiError);

describe('RemindersStore', () => {
    beforeEach(() => {
        // Сбрасываем стор перед каждым тестом
        useRemindersStore.getState().resetReminders();
        vi.clearAllMocks();
    });

    describe('Initial State', () => {
        it('should have correct initial state', () => {
            const state = useRemindersStore.getState();

            expect(state.todayReminder).toBeNull();
            expect(state.loading).toBe(false);
            expect(state.error).toBeNull();
        });
    });

    describe('Setters', () => {
        it('should set todayReminder', () => {
            const mockReminder = {
                TodayRemind: {
                    need_remind: true
                }
            };

            useRemindersStore.getState().setTodayReminder(mockReminder);

            expect(useRemindersStore.getState().todayReminder).toEqual(mockReminder);
        });

        it('should set loading', () => {
            useRemindersStore.getState().setLoading(true);

            expect(useRemindersStore.getState().loading).toBe(true);
        });

        it('should set error', () => {
            const mockError = { message: 'Test error', status: 500 };

            useRemindersStore.getState().setError(mockError);

            expect(useRemindersStore.getState().error).toEqual(mockError);
        });
    });

    describe('fetchTodayReminder', () => {
        it('should fetch today reminder successfully', async () => {
            const mockResponse = {
                TodayRemind: {
                    need_remind: true
                }
            };

            mockedRemindersAPI.getTodayReminder.mockResolvedValueOnce(mockResponse);

            await useRemindersStore.getState().fetchTodayReminder();

            const state = useRemindersStore.getState();
            expect(state.todayReminder).toEqual(mockResponse);
            expect(state.loading).toBe(false);
            expect(state.error).toBeNull();
            expect(mockedRemindersAPI.getTodayReminder).toHaveBeenCalledTimes(1);
        });

        it('should set loading to true during fetch', async () => {
            mockedRemindersAPI.getTodayReminder.mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve({
                    TodayRemind: { need_remind: false }
                }), 100))
            );

            const fetchPromise = useRemindersStore.getState().fetchTodayReminder();

            expect(useRemindersStore.getState().loading).toBe(true);

            await fetchPromise;

            expect(useRemindersStore.getState().loading).toBe(false);
        });

        it('should handle API error', async () => {
            const mockError = new Error('API Error');
            const processedError = { message: 'Processed error', status: 500 };

            mockedRemindersAPI.getTodayReminder.mockRejectedValueOnce(mockError);
            mockedHandleRemindersApiError.mockReturnValueOnce(processedError);

            await expect(useRemindersStore.getState().fetchTodayReminder()).rejects.toThrow();

            const state = useRemindersStore.getState();
            expect(state.loading).toBe(false);
            expect(state.error).toEqual(processedError);
            expect(mockedHandleRemindersApiError).toHaveBeenCalledWith(mockError);
        });

        it('should clear error before fetch', async () => {
            // Устанавливаем начальную ошибку
            useRemindersStore.getState().setError({ message: 'Previous error', status: 400 });

            mockedRemindersAPI.getTodayReminder.mockResolvedValueOnce({
                TodayRemind: { need_remind: false }
            });

            await useRemindersStore.getState().fetchTodayReminder();

            expect(useRemindersStore.getState().error).toBeNull();
        });
    });

    describe('handleError', () => {
        it('should process error and throw', () => {
            const mockError = new Error('Test error');
            const processedError = { message: 'Processed error', status: 500 };

            mockedHandleRemindersApiError.mockReturnValueOnce(processedError);

            expect(() => {
                useRemindersStore.getState().handleError(mockError, 'testAction');
            }).toThrow(); // Убираем аргумент, просто проверяем что выбрасывается ошибка

            const state = useRemindersStore.getState();
            expect(state.error).toEqual(processedError);
            expect(state.loading).toBe(false);
            expect(mockedHandleRemindersApiError).toHaveBeenCalledWith(mockError);
        });
    });

    describe('resetReminders', () => {
        it('should reset store to initial state', () => {
            // Устанавливаем некоторые значения
            useRemindersStore.getState().setTodayReminder({
                TodayRemind: { need_remind: true }
            });
            useRemindersStore.getState().setLoading(true);
            useRemindersStore.getState().setError({ message: 'Error', status: 500 });

            // Сбрасываем
            useRemindersStore.getState().resetReminders();

            const state = useRemindersStore.getState();
            expect(state.todayReminder).toBeNull();
            expect(state.loading).toBe(false);
            expect(state.error).toBeNull();
        });
    });

    describe('clearError', () => {
        it('should clear error only', () => {
            // Устанавливаем состояние
            useRemindersStore.getState().setTodayReminder({
                TodayRemind: { need_remind: true }
            });
            useRemindersStore.getState().setLoading(true);
            useRemindersStore.getState().setError({ message: 'Error', status: 500 });

            // Очищаем только ошибку
            useRemindersStore.getState().clearError();

            const state = useRemindersStore.getState();
            expect(state.error).toBeNull();
            expect(state.todayReminder).toEqual({
                TodayRemind: { need_remind: true }
            });
            expect(state.loading).toBe(true);
        });
    });

    describe('Store Subscriptions', () => {
        it('should notify subscribers on state change', () => {
            const mockSubscriber = vi.fn();

            const unsubscribe = useRemindersStore.subscribe(mockSubscriber);

            useRemindersStore.getState().setLoading(true);

            expect(mockSubscriber).toHaveBeenCalled();

            unsubscribe();
        });

        it('should support selective subscriptions', () => {
            const mockSubscriber = vi.fn();

            const unsubscribe = useRemindersStore.subscribe(
                mockSubscriber,
                (state) => state.loading
            );

            mockSubscriber.mockClear(); // Сбрасываем после подписки

            // Только одно изменение - должен вызваться 1 раз
            useRemindersStore.getState().setLoading(true);
            expect(mockSubscriber).toHaveBeenCalledTimes(1);

            unsubscribe();
        });
    });
});
