// src/02_stores/goalsStore/goalsStore.test.ts
import {afterEach, describe, expect, it, vi} from 'vitest'
import {act, renderHook} from '@testing-library/react'
import useGoalsStore from './goalsStore'
import * as goalsAPI from '../../01_api/goals/index'
import type {Goal, GoalActionResponse, GoalRequest} from '../../01_api/goals/types'
import type {ApiError} from '../../01_api/apiTypes'

// Типы для удобства
type MockGoal = Goal
type MockGoalRequest = GoalRequest
type MockGoalActionResponse = GoalActionResponse

// Дефолтные моки
const mockGoal: MockGoal = {
    id: 1,
    user_id: 1,
    amount: 1000000,
    description: 'Тестовая цель',
    wish_date: '2025-01-01T00:00:00Z',
    achievement_date: '0001-01-01T00:00:00Z',
    is_achieved: false,
    is_current: false,
    is_delete: false,
}

const mockGoalRequest: MockGoalRequest = {
    description: 'Новая цель',
    amount: 2000000,
    wish_date: '2025-03-01'
}

const mockGoalActionResponse: MockGoalActionResponse = {
    message: 'Goal updated successfully'
}

const mockApiError: ApiError = {
    message: 'test_error',
    status: 500
}

const mockApiErrorNoCurrent: ApiError = {
    message: 'no current goal found',
    status: 404
}

describe('goalsStore', () => {
    afterEach(() => {
        useGoalsStore.getState().resetGoals()
        vi.restoreAllMocks()
    })

    // --- fetchGoals ---
    describe('fetchGoals', () => {
        it('should fetch and set goals', async () => {
            vi.spyOn(goalsAPI, 'getGoals').mockResolvedValue([mockGoal])
            const { result } = renderHook(() => useGoalsStore())

            await act(async () => {
                await result.current.fetchGoals()
            })

            expect(result.current.goals).toEqual([mockGoal])
            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBe(null)
        })

        it('should handle fetch error', async () => {
            vi.spyOn(goalsAPI, 'getGoals').mockRejectedValue(mockApiError)
            const { result } = renderHook(() => useGoalsStore())

            try {
                await act(async () => {
                    await result.current.fetchGoals()
                })
            } catch (e) {
                // Игнорируем, т.к. ошибка пробрасывается
            }

            expect(result.current.error?.message).toBe('Ошибка связи или сервера. Попробуйте позже.')
            expect(result.current.loading).toBe(false)
        })
    })

    // --- getCurrentGoal ---
    describe('getCurrentGoal', () => {
        it('should set current goal', async () => {
            vi.spyOn(goalsAPI, 'getCurrentGoal').mockResolvedValue(mockGoal)
            const { result } = renderHook(() => useGoalsStore())

            await act(async () => {
                await result.current.getCurrentGoal()
            })

            expect(result.current.currentGoal).toEqual(mockGoal)
            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBe(null)
        })

        it('should set current goal to null if no current found', async () => {
            vi.spyOn(goalsAPI, 'getCurrentGoal').mockRejectedValue(mockApiErrorNoCurrent)
            const { result } = renderHook(() => useGoalsStore())

            try {
                await act(async () => {
                    await result.current.getCurrentGoal()
                })
            } catch (e) {
                // Игнорируем, т.к. ошибка пробрасывается
            }

            expect(result.current.currentGoal).toBe(null)
            expect(result.current.error).toBe(null)
            expect(result.current.loading).toBe(false)
        })

        it('should handle error', async () => {
            vi.spyOn(goalsAPI, 'getCurrentGoal').mockRejectedValue(mockApiError)
            const { result } = renderHook(() => useGoalsStore())

            try {
                await act(async () => {
                    await result.current.getCurrentGoal()
                })
            } catch (e) {
                // Игнорируем, т.к. ошибка пробрасывается
            }

            expect(result.current.error?.message).toBe('Ошибка связи или сервера. Попробуйте позже.')
            expect(result.current.loading).toBe(false)
        })
    })

    // --- addGoal ---
    describe('addGoal', () => {
        it('should add goal and refresh data', async () => {
            vi.spyOn(goalsAPI, 'addGoal').mockResolvedValue(mockGoalActionResponse)
            vi.spyOn(goalsAPI, 'getGoals').mockResolvedValue([mockGoal])
            vi.spyOn(goalsAPI, 'getCurrentGoal').mockResolvedValue(mockGoal)
            const { result } = renderHook(() => useGoalsStore())

            await act(async () => {
                await result.current.addGoal(mockGoalRequest)
            })

            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBe(null)
            expect(result.current.goals).toEqual([mockGoal])
            expect(result.current.currentGoal).toEqual(mockGoal)
        })

        it('should handle error', async () => {
            vi.spyOn(goalsAPI, 'addGoal').mockRejectedValue(mockApiError)
            const { result } = renderHook(() => useGoalsStore())

            try {
                await act(async () => {
                    await result.current.addGoal(mockGoalRequest)
                })
            } catch (e) {
                // Игнорируем, т.к. ошибка пробрасывается
            }

            expect(result.current.error?.message).toBe('Ошибка связи или сервера. Попробуйте позже.')
            expect(result.current.loading).toBe(false)
        })
    })

    // --- updateGoal ---
    describe('updateGoal', () => {
        it('should update goal and refresh data', async () => {
            vi.spyOn(goalsAPI, 'updateGoalById').mockResolvedValue(mockGoalActionResponse)
            vi.spyOn(goalsAPI, 'getGoals').mockResolvedValue([mockGoal])
            vi.spyOn(goalsAPI, 'getCurrentGoal').mockResolvedValue(mockGoal)
            const { result } = renderHook(() => useGoalsStore())

            await act(async () => {
                await result.current.updateGoal(1, mockGoalRequest)
            })

            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBe(null)
            expect(result.current.goals).toEqual([mockGoal])
            expect(result.current.currentGoal).toEqual(mockGoal)
        })

        it('should handle error', async () => {
            vi.spyOn(goalsAPI, 'updateGoalById').mockRejectedValue(mockApiError)
            const { result } = renderHook(() => useGoalsStore())

            try {
                await act(async () => {
                    await result.current.updateGoal(1, mockGoalRequest)
                })
            } catch (e) {
                // Игнорируем, т.к. ошибка пробрасывается
            }

            expect(result.current.error?.message).toBe('Ошибка связи или сервера. Попробуйте позже.')
            expect(result.current.loading).toBe(false)
        })
    })

    // --- deleteGoal ---
    describe('deleteGoal', () => {
        it('should delete goal and refresh data', async () => {
            vi.spyOn(goalsAPI, 'deleteGoalById').mockResolvedValue(mockGoalActionResponse)
            vi.spyOn(goalsAPI, 'getGoals').mockResolvedValue([mockGoal])
            vi.spyOn(goalsAPI, 'getCurrentGoal').mockResolvedValue(mockGoal)
            const { result } = renderHook(() => useGoalsStore())

            await act(async () => {
                await result.current.deleteGoal(1)
            })

            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBe(null)
            expect(result.current.goals).toEqual([mockGoal])
            expect(result.current.currentGoal).toEqual(mockGoal)
        })

        it('should handle error', async () => {
            vi.spyOn(goalsAPI, 'deleteGoalById').mockRejectedValue(mockApiError)
            const { result } = renderHook(() => useGoalsStore())

            try {
                await act(async () => {
                    await result.current.deleteGoal(1)
                })
            } catch (e) {
                // Игнорируем, т.к. ошибка пробрасывается
            }

            expect(result.current.error?.message).toBe('Ошибка связи или сервера. Попробуйте позже.')
            expect(result.current.loading).toBe(false)
        })
    })

    // --- setCurrentGoalById ---
    describe('setCurrentGoalById', () => {
        it('should set current goal and refresh data', async () => {
            vi.spyOn(goalsAPI, 'setCurrentGoal').mockResolvedValue(mockGoalActionResponse)
            vi.spyOn(goalsAPI, 'getGoals').mockResolvedValue([mockGoal])
            vi.spyOn(goalsAPI, 'getCurrentGoal').mockResolvedValue(mockGoal)
            const { result } = renderHook(() => useGoalsStore())

            await act(async () => {
                await result.current.setCurrentGoalById(1)
            })

            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBe(null)
            expect(result.current.goals).toEqual([mockGoal])
            expect(result.current.currentGoal).toEqual(mockGoal)
        })

        it('should handle error', async () => {
            vi.spyOn(goalsAPI, 'setCurrentGoal').mockRejectedValue(mockApiError)
            const { result } = renderHook(() => useGoalsStore())

            try {
                await act(async () => {
                    await result.current.setCurrentGoalById(1)
                })
            } catch (e) {
                // Игнорируем, т.к. ошибка пробрасывается
            }

            expect(result.current.error?.message).toBe('Ошибка связи или сервера. Попробуйте позже.')
            expect(result.current.loading).toBe(false)
        })
    })

    // --- resetGoals ---
    describe('resetGoals', () => {
        it('should reset state', () => {
            const { result } = renderHook(() => useGoalsStore())

            act(() => {
                result.current.setGoals([mockGoal])
                result.current.setCurrentGoal(mockGoal)
                result.current.setError({ message: 'test', status: 500 })
                result.current.setLoading(true)
            })

            expect(result.current.goals).toEqual([mockGoal])
            expect(result.current.currentGoal).toEqual(mockGoal)
            expect(result.current.error).not.toBeNull()
            expect(result.current.loading).toBe(true)

            act(() => {
                result.current.resetGoals()
            })

            expect(result.current.goals).toEqual([])
            expect(result.current.currentGoal).toBe(null)
            expect(result.current.error).toBe(null)
            expect(result.current.loading).toBe(false)
        })
    })

    // --- clearError ---
    describe('clearError', () => {
        it('should clear error', () => {
            const { result } = renderHook(() => useGoalsStore())

            act(() => {
                result.current.setError({ message: 'test', status: 500 })
            })

            expect(result.current.error).not.toBeNull()

            act(() => {
                result.current.clearError()
            })

            expect(result.current.error).toBe(null)
        })
    })
})
