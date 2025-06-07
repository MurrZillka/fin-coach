// src/02_stores/spendingsStore/spendingsStore.test.ts
import {afterEach, describe, expect, it, vi} from 'vitest';
import {act, renderHook} from '@testing-library/react';
import useSpendingsStore from './spendingsStore';
import * as spendingsAPI from '../../01_api/spendings/index';
import type {Spending, SpendingActionResponse, SpendingRequest} from '../../01_api/spendings/types';
import type {ApiError} from '../../01_api/apiTypes';

// Типы для удобства
type MockSpending = Spending;
type MockSpendingRequest = SpendingRequest;
type MockSpendingActionResponse = SpendingActionResponse;

// Дефолтные моки
const mockSpending: MockSpending = {
    id: 1,
    user_id: 1,
    is_delete: false,
    amount: 10000,
    description: 'Тестовый расход',
    is_permanent: false,
    date: '2025-01-01T00:00:00Z',
    category_id: 1,
    end_date: '2025-01-01T00:00:00Z',
    full_amount: 10000
};

const mockSpendingRequest: MockSpendingRequest = {
    description: 'Новый расход',
    amount: 20000,
    category_id: 1,
    date: '2025-01-01',
    is_permanent: false,
    end_date: '2025-01-01'
};

const mockSpendingActionResponse: MockSpendingActionResponse = {
    message: 'Spending updated successfully'
};

const mockApiError: ApiError = {
    message: 'test_error',
    status: 500
};

describe('spendingsStore', () => {
    afterEach(() => {
        useSpendingsStore.getState().resetSpendings();
        vi.restoreAllMocks();
    });

    // --- fetchSpendings ---
    describe('fetchSpendings', () => {
        it('should fetch and set spendings', async () => {
            vi.spyOn(spendingsAPI, 'getSpendings').mockResolvedValue({ Spendings: [mockSpending] });
            const { result } = renderHook(() => useSpendingsStore());

            await act(async () => {
                await result.current.fetchSpendings();
            });

            expect(result.current.spendings).toEqual([mockSpending]);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBe(null);
        });

        it('should handle fetch error', async () => {
            vi.spyOn(spendingsAPI, 'getSpendings').mockRejectedValue(mockApiError);
            const { result } = renderHook(() => useSpendingsStore());

            try {
                await act(async () => {
                    await result.current.fetchSpendings();
                });
            } catch (e) {
                // Игнорируем, т.к. ошибка пробрасывается
            }

            expect(result.current.error?.message).toMatch(/Ошибка связи или сервера|Ошибка в данных формы/);
            expect(result.current.loading).toBe(false);
        });
    });

    // --- addSpending ---
    describe('addSpending', () => {
        it('should add spending and refresh data', async () => {
            vi.spyOn(spendingsAPI, 'addSpending').mockResolvedValue(mockSpendingActionResponse);
            vi.spyOn(spendingsAPI, 'getSpendings').mockResolvedValue({ Spendings: [mockSpending] });
            const { result } = renderHook(() => useSpendingsStore());

            await act(async () => {
                await result.current.addSpending(mockSpendingRequest);
            });

            expect(result.current.spendings).toEqual([mockSpending]);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBe(null);
        });

        it('should handle error', async () => {
            vi.spyOn(spendingsAPI, 'addSpending').mockRejectedValue(mockApiError);
            const { result } = renderHook(() => useSpendingsStore());

            try {
                await act(async () => {
                    await result.current.addSpending(mockSpendingRequest);
                });
            } catch (e) {
                // Игнорируем, т.к. ошибка пробрасывается
            }

            expect(result.current.error?.message).toMatch(/Ошибка связи или сервера|Ошибка в данных формы/);
            expect(result.current.loading).toBe(false);
        });
    });

    // --- updateSpending ---
    describe('updateSpending', () => {
        it('should update spending and refresh data', async () => {
            vi.spyOn(spendingsAPI, 'updateSpendingById').mockResolvedValue(mockSpendingActionResponse);
            vi.spyOn(spendingsAPI, 'getSpendings').mockResolvedValue({ Spendings: [mockSpending] });
            const { result } = renderHook(() => useSpendingsStore());

            await act(async () => {
                await result.current.updateSpending(1, mockSpendingRequest);
            });

            expect(result.current.spendings).toEqual([mockSpending]);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBe(null);
        });

        it('should handle error', async () => {
            vi.spyOn(spendingsAPI, 'updateSpendingById').mockRejectedValue(mockApiError);
            const { result } = renderHook(() => useSpendingsStore());

            try {
                await act(async () => {
                    await result.current.updateSpending(1, mockSpendingRequest);
                });
            } catch (e) {
                // Игнорируем, т.к. ошибка пробрасывается
            }

            expect(result.current.error?.message).toMatch(/Ошибка связи или сервера|Ошибка в данных формы/);
            expect(result.current.loading).toBe(false);
        });
    });

    // --- deleteSpending ---
    describe('deleteSpending', () => {
        it('should delete spending and refresh data', async () => {
            vi.spyOn(spendingsAPI, 'deleteSpendingById').mockResolvedValue(mockSpendingActionResponse);
            vi.spyOn(spendingsAPI, 'getSpendings').mockResolvedValue({ Spendings: [mockSpending] });
            const { result } = renderHook(() => useSpendingsStore());

            await act(async () => {
                await result.current.deleteSpending(1);
            });

            expect(result.current.spendings).toEqual([mockSpending]);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBe(null);
        });

        it('should handle error', async () => {
            vi.spyOn(spendingsAPI, 'deleteSpendingById').mockRejectedValue(mockApiError);
            const { result } = renderHook(() => useSpendingsStore());

            try {
                await act(async () => {
                    await result.current.deleteSpending(1);
                });
            } catch (e) {
                // Игнорируем, т.к. ошибка пробрасывается
            }

            expect(result.current.error?.message).toMatch(/Ошибка связи или сервера|Ошибка в данных формы/);
            expect(result.current.loading).toBe(false);
        });
    });

    // --- resetSpendings ---
    describe('resetSpendings', () => {
        it('should reset state', () => {
            const { result } = renderHook(() => useSpendingsStore());

            act(() => {
                result.current.setSpendings([mockSpending]);
                result.current.setLoading(true);
                result.current.setError({ message: 'Test error', field: null, status: 500 });
            });

            expect(result.current.spendings).toEqual([mockSpending]);
            expect(result.current.loading).toBe(true);
            expect(result.current.error).not.toBeNull();

            act(() => {
                result.current.resetSpendings();
            });

            expect(result.current.spendings).toBe(null);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBe(null);
        });
    });

    // --- clearError ---
    describe('clearError', () => {
        it('should clear error', () => {
            const { result } = renderHook(() => useSpendingsStore());

            act(() => {
                result.current.setError({ message: 'Test error', field: null, status: 500 });
            });

            expect(result.current.error).not.toBeNull();

            act(() => {
                result.current.clearError();
            });

            expect(result.current.error).toBe(null);
        });
    });
});
