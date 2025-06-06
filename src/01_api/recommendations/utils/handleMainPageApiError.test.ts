import { describe, it, expect } from 'vitest'
import { handleMainPageApiError } from './handleMainPageApiError'
import { ApiError } from '../../apiTypes'

describe('handleMainPageApiError', () => {
    describe('known error messages', () => {
        it('should handle "no_recommendations_available" error', () => {
            const error: ApiError = {
                message: 'no_recommendations_available',
                status: 404
            }

            const result = handleMainPageApiError(error)

            expect(result).toEqual({
                message: 'Рекомендации пока недоступны',
                status: 404
            })
        })

        it('should handle "insufficient_data" error', () => {
            const error: ApiError = {
                message: 'insufficient_data',
                status: 400
            }

            const result = handleMainPageApiError(error)

            expect(result).toEqual({
                message: 'Недостаточно данных для формирования рекомендаций',
                status: 400
            })
        })
    })

    describe('unknown error messages', () => {
        it('should handle client errors (4xx) with generic message', () => {
            const error: ApiError = {
                message: 'Some unknown client error',
                status: 422
            }

            const result = handleMainPageApiError(error)

            expect(result).toEqual({
                message: 'Ошибка получения рекомендаций. Попробуйте позже.',
                status: 422
            })
        })

        it('should handle server errors (5xx) with generic message', () => {
            const error: ApiError = {
                message: 'Internal server error',
                status: 500
            }

            const result = handleMainPageApiError(error)

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

            const result = handleMainPageApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                status: 500 // ← 0 || 500 = 500
            })
        })

        it('should handle errors without status with default 500', () => {
            const error = {
                message: 'Network error',
                status: undefined as any
            }

            const result = handleMainPageApiError(error)

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

            const result = handleMainPageApiError(error)

            expect(result).toEqual({
                message: 'Ошибка получения рекомендаций. Попробуйте позже.',
                status: 400
            })
        })

        it('should handle null error message', () => {
            const error = {
                message: null as any,
                status: 500
            }

            const result = handleMainPageApiError(error)

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

            const result = handleMainPageApiError(error)

            expect(result).toEqual({
                message: 'Ошибка получения рекомендаций. Попробуйте позже.',
                status: 400
            })
        })
    })
})
