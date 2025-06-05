// src/utils/handleCategoryApiError.test.ts
import { describe, it, expect } from 'vitest'
import { handleCategoryApiError } from './handleCategoryApiError'

describe('handleCategoryApiError', () => {
    describe('known error messages', () => {
        it('should handle "category_not_found" error', () => {
            const error = {
                message: 'category_not_found',
                status: 404
            }

            const result = handleCategoryApiError(error)

            expect(result).toEqual({
                message: 'Категория не найдена',
                status: 404
            })
        })

        it('should handle "Category name must be unique" error', () => {
            const error = {
                message: 'Category name must be unique',
                status: 400
            }

            const result = handleCategoryApiError(error)

            expect(result).toEqual({
                message: 'Категория с таким названием уже существует, выберите, пожалуйста, другое',
                status: 400
            })
        })

        it('should handle "category_in_use" error', () => {
            const error = {
                message: 'category_in_use',
                status: 400
            }

            const result = handleCategoryApiError(error)

            expect(result).toEqual({
                message: 'Нельзя удалить категорию, которая используется в расходах',
                status: 400
            })
        })
    })

    describe('unknown error messages', () => {
        it('should handle client errors (4xx) with generic message', () => {
            const error = {
                message: 'Some unknown client error',
                status: 422
            }

            const result = handleCategoryApiError(error)

            expect(result).toEqual({
                message: 'Ошибка в данных категории. Проверьте введённую информацию.',
                status: 422
            })
        })

        it('should handle client error 400 with generic message', () => {
            const error = {
                message: 'Bad request',
                status: 400
            }

            const result = handleCategoryApiError(error)

            expect(result).toEqual({
                message: 'Ошибка в данных категории. Проверьте введённую информацию.',
                status: 400
            })
        })

        it('should handle client error 499 with generic message', () => {
            const error = {
                message: 'Client closed request',
                status: 499
            }

            const result = handleCategoryApiError(error)

            expect(result).toEqual({
                message: 'Ошибка в данных категории. Проверьте введённую информацию.',
                status: 499
            })
        })

        it('should handle server errors (5xx) with generic message', () => {
            const error = {
                message: 'Internal server error',
                status: 500
            }

            const result = handleCategoryApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                status: 500
            })
        })

        it('should handle server error 502 with generic message', () => {
            const error = {
                message: 'Bad gateway',
                status: 502
            }

            const result = handleCategoryApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                status: 502
            })
        })

        it('should handle errors with status 0 as server error', () => {
            const error = {
                message: 'Network error',
                status: 0
            }

            const result = handleCategoryApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                status: 500
            })
        })

        it('should handle errors with status 399 as server error', () => {
            const error = {
                message: 'Some 3xx error',
                status: 399
            }

            const result = handleCategoryApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                status: 399
            })
        })

        it('should handle errors without status with default 500', () => {
            const error = {
                message: 'Network error',
                status: undefined as any
            }

            const result = handleCategoryApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                status: 500
            })
        })
    })

    describe('edge cases', () => {
        it('should handle empty error message', () => {
            const error = {
                message: '',
                status: 400
            }

            const result = handleCategoryApiError(error)

            expect(result).toEqual({
                message: 'Ошибка в данных категории. Проверьте введённую информацию.',
                status: 400
            })
        })

        it('should handle null error message', () => {
            const error = {
                message: null as any,
                status: 500
            }

            const result = handleCategoryApiError(error)

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

            const result = handleCategoryApiError(error)

            expect(result).toEqual({
                message: 'Ошибка в данных категории. Проверьте введённую информацию.',
                status: 400
            })
        })
    })
})
