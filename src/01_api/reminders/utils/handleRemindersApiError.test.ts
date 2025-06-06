// src/utils/handleRemindersApiError.test.ts

import { describe, it, expect } from 'vitest'
import { handleRemindersApiError } from './handleRemindersApiError'
import { ApiError } from '../../apiTypes'

describe('handleRemindersApiError', () => {
    describe('known error messages', () => {
        it('should handle "no_reminders_found" error', () => {
            const error: ApiError = {
                message: 'no_reminders_found',
                status: 404
            }

            const result = handleRemindersApiError(error)

            expect(result).toEqual({
                message: 'Напоминания не найдены',
                status: 404
            })
        })

        it('should handle "reminder_not_available" error', () => {
            const error: ApiError = {
                message: 'reminder_not_available',
                status: 503
            }

            const result = handleRemindersApiError(error)

            expect(result).toEqual({
                message: 'Напоминания временно недоступны',
                status: 503
            })
        })
    })

    describe('unknown error messages', () => {
        it('should handle client errors (4xx) with generic message', () => {
            const error: ApiError = {
                message: 'Some unknown client error',
                status: 422
            }

            const result = handleRemindersApiError(error)

            expect(result).toEqual({
                message: 'Ошибка получения напоминаний. Попробуйте позже.',
                status: 422
            })
        })

        it('should handle server errors (5xx) with generic message', () => {
            const error: ApiError = {
                message: 'Internal server error',
                status: 500
            }

            const result = handleRemindersApiError(error)

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

            const result = handleRemindersApiError(error)

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

            const result = handleRemindersApiError(error)

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

            const result = handleRemindersApiError(error)

            expect(result).toEqual({
                message: 'Ошибка получения напоминаний. Попробуйте позже.',
                status: 400
            })
        })

        it('should handle null error message', () => {
            const error = {
                message: null as any,
                status: 500
            }

            const result = handleRemindersApiError(error)

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

            const result = handleRemindersApiError(error)

            expect(result).toEqual({
                message: 'Ошибка получения напоминаний. Попробуйте позже.',
                status: 400
            })
        })
    })
})
