// src/utils/handleGoalsApiError.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { handleGoalsApiError } from './handleGoalsApiError'
import { ApiError } from '../../apiTypes'

describe('handleGoalsApiError', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('known error messages', () => {
        it('should handle "goal_not_found" error', () => {
            const error: ApiError = {
                message: 'goal_not_found',
                status: 404
            }

            const result = handleGoalsApiError(error)

            expect(result).toEqual({
                message: 'Цель не найдена',
                status: 404
            })
        })

        it('should handle "invalid_goal_amount" error', () => {
            const error: ApiError = {
                message: 'invalid_goal_amount',
                status: 400
            }

            const result = handleGoalsApiError(error)

            expect(result).toEqual({
                message: 'Некорректная сумма цели',
                status: 400
            })
        })

        it('should handle "invalid_date" error', () => {
            const error: ApiError = {
                message: 'invalid_date',
                status: 400
            }

            const result = handleGoalsApiError(error)

            expect(result).toEqual({
                message: 'Некорректная дата',
                status: 400
            })
        })

        it('should handle "no current goal found" error', () => {
            const error: ApiError = {
                message: 'no current goal found',
                status: 404
            }

            const result = handleGoalsApiError(error)

            expect(result).toEqual({
                message: 'У вас пока нет активной цели',
                status: 404
            })
        })

        it('should use default status 500 when status is not provided for known errors', () => {
            const error: ApiError = {
                message: 'goal_not_found',
                status: undefined
            }

            const result = handleGoalsApiError(error)

            expect(result.status).toBe(500)
        })
    })

    describe('unknown error messages', () => {
        it('should handle client errors (4xx) with generic message', () => {
            const error: ApiError = {
                message: 'Some unknown client error',
                status: 422
            }

            const result = handleGoalsApiError(error)

            expect(result).toEqual({
                message: 'Ошибка в данных цели. Проверьте введённую информацию.',
                status: 422
            })
        })

        it('should handle server errors (5xx) with generic message', () => {
            const error: ApiError = {
                message: 'Internal server error',
                status: 500
            }

            const result = handleGoalsApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                status: 500
            })
        })

        it('should handle errors with status 0 as server error', () => {
            const error: ApiError = {
                message: 'Network error',
                status: 0
            }

            const result = handleGoalsApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                status: 500
            })
        })

        it('should handle errors without status with default 500', () => {
            const error: ApiError = {
                message: 'Network error',
                status: undefined
            }

            const result = handleGoalsApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                status: 500
            })
        })
    })

    describe('edge cases', () => {
        it('should handle empty error message', () => {
            const error: ApiError = {
                message: '',
                status: 400
            }

            const result = handleGoalsApiError(error)

            expect(result).toEqual({
                message: 'Ошибка в данных цели. Проверьте введённую информацию.',
                status: 400
            })
        })

        it('should handle null error message', () => {
            const error = {
                message: null as any,
                status: 500
            }

            const result = handleGoalsApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                status: 500
            })
        })

        it('should handle undefined error message', () => {
            const error = {
                message: undefined as any,
                status: 400
            }

            const result = handleGoalsApiError(error)

            expect(result).toEqual({
                message: 'Ошибка в данных цели. Проверьте введённую информацию.',
                status: 400
            })
        })
    })
})
