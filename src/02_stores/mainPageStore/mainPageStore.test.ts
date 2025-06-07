// src/02_stores/mainPageStore/mainPageStore.test.ts

import {afterEach, describe, expect, it, vi} from 'vitest';
import {act, renderHook} from '@testing-library/react';
import useMainPageStore from './mainPageStore';
import * as mainPageAPI from '../../01_api/recommendations';
import {ApiError} from '../../01_api/apiTypes';
import {Recommendation} from '../../01_api/recommendations/types';
import {handleMainPageApiError} from '../../01_api/recommendations/utils/handleMainPageApiError'

// Мокаем handleMainPageApiError
vi.mock('../../01_api/recommendations/utils/handleMainPageApiError', () => ({
    handleMainPageApiError: vi.fn((err: ApiError) => ({
        message: 'Ошибка теста',
        status: 500,
    })),
}));

// Мокаем API
vi.mock('../../01_api/recommendations', () => ({
    getRecommendations: vi.fn(),
}));

describe('mainPageStore', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        useMainPageStore.getState().resetRecommendations();
    });

    it('should set recommendations', () => {
        const { result } = renderHook(() => useMainPageStore());
        const testRecommendations: Recommendation[] = [
            { id: 1, name: 'Тест', description: 'Тестовое описание' }
        ];

        act(() => {
            result.current.setRecommendations(testRecommendations);
        });

        expect(result.current.recommendations).toEqual(testRecommendations);
    });

    it('should set loading', () => {
        const { result } = renderHook(() => useMainPageStore());

        act(() => {
            result.current.setLoading(true);
        });

        expect(result.current.loading).toBe(true);
    });

    it('should set error', () => {
        const { result } = renderHook(() => useMainPageStore());
        const testError = { message: 'Test error', status: 400 };

        act(() => {
            result.current.setError(testError);
        });

        expect(result.current.error).toEqual(testError);
    });

    it('should handle error', () => {
        const { result } = renderHook(() => useMainPageStore());
        const testError = { message: 'Test error', status: 400 };

        let thrownError: unknown;
        act(() => {
            try {
                result.current.handleError(testError, 'test');
            } catch (e) {
                thrownError = e;
            }
        });

        expect(thrownError).toEqual({
            message: 'Ошибка теста',
            status: 500,
        });
        expect(result.current.error).toEqual({
            message: 'Ошибка теста',
            status: 500,
        });
        expect(result.current.loading).toBe(false);
    });

    it('should fetch recommendations', async () => {
        const testRecommendations: Recommendation[] = [
            { id: 1, name: 'Тест', description: 'Тестовое описание' }
        ];
        const mockGetRecommendations = vi.mocked(mainPageAPI.getRecommendations);
        mockGetRecommendations.mockResolvedValueOnce({ Recommendations: testRecommendations });

        const { result } = renderHook(() => useMainPageStore());

        await act(async () => {
            await result.current.fetchRecommendations();
        });

        expect(mockGetRecommendations).toHaveBeenCalled();
        expect(result.current.recommendations).toEqual(testRecommendations);
        expect(result.current.loading).toBe(false);
    });

    it('should handle fetch error', async () => {
        // Передаём объект с message и status, чтобы обработка ошибки была корректной
        const testError = { message: 'Test error', status: 400 };
        const mockGetRecommendations = vi.mocked(mainPageAPI.getRecommendations);
        mockGetRecommendations.mockRejectedValueOnce(testError);

        const { result } = renderHook(() => useMainPageStore());

        let thrownError: unknown;
        await act(async () => {
            try {
                await result.current.fetchRecommendations();
            } catch (e) {
                thrownError = e;
            }
        });

        expect(mockGetRecommendations).toHaveBeenCalled();
        expect(thrownError).toEqual({
            message: 'Ошибка теста',
            status: 500,
        });
        expect(result.current.error).toEqual({
            message: 'Ошибка теста',
            status: 500,
        });
        expect(result.current.loading).toBe(false);
    });

    it('should reset recommendations', () => {
        const { result } = renderHook(() => useMainPageStore());
        const testRecommendations: Recommendation[] = [
            { id: 1, name: 'Тест', description: 'Тестовое описание' }
        ];

        act(() => {
            result.current.setRecommendations(testRecommendations);
            result.current.setError({ message: 'Test error', status: 400 });
            result.current.setLoading(true);
        });

        act(() => {
            result.current.resetRecommendations();
        });

        expect(result.current.recommendations).toBeNull();
        expect(result.current.error).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    it('should clear error', () => {
        const { result } = renderHook(() => useMainPageStore());

        act(() => {
            result.current.setError({ message: 'Test error', status: 400 });
            result.current.clearError();
        });

        expect(result.current.error).toBeNull();
    });

    it('should mock handleMainPageApiError', () => {
        // Проверяем, что мок реально работает
        expect(handleMainPageApiError({ message: 'any', status: 123 })).toEqual({
            message: 'Ошибка теста',
            status: 500,
        });
    });
});
