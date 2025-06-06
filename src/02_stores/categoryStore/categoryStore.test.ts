// src/02_stores/categoryStore/categoryStore.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from '@testing-library/react'
import useCategoryStore from './categoryStore'
import * as categoryAPI from '../../01_api/categories/index'
import * as errorUtils from '../../01_api/categories/utils/handleCategoryApiError'
import { CHART_COLORS } from '../../constants/colors'

// Локально определяем Category для теста (если нет глобального типа)
type Category = {
    id: number;
    name: string;
    description: string;
    is_delete: boolean;
    user_id: number;
}

const mockCategories: Category[] = [
    { id: 1, name: "Еда", description: "", is_delete: false, user_id: 1 },
    { id: 2, name: "Транспорт", description: "", is_delete: false, user_id: 1 }
]

describe('useCategoryStore', () => {
    beforeEach(() => {
        useCategoryStore.setState({
            categories: null,
            categoriesMonth: null,
            categoryColorMap: {},
            nextColorIndex: 0,
            loading: false,
            error: null
        })
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('setCategories изменяет categories', () => {
        useCategoryStore.getState().setCategories(mockCategories)
        expect(useCategoryStore.getState().categories).toEqual(mockCategories)
        useCategoryStore.getState().setCategories(null)
        expect(useCategoryStore.getState().categories).toBeNull()
    })

    it('setCategoriesMonth изменяет categoriesMonth', () => {
        const month = { "Еда": 100, "Транспорт": 200 }
        useCategoryStore.getState().setCategoriesMonth(month)
        expect(useCategoryStore.getState().categoriesMonth).toEqual(month)
        useCategoryStore.getState().setCategoriesMonth(null)
        expect(useCategoryStore.getState().categoriesMonth).toBeNull()
    })

    it('setCategoryColorMap изменяет карту цветов', () => {
        const map = { "Еда": "#fff" }
        useCategoryStore.getState().setCategoryColorMap(map)
        expect(useCategoryStore.getState().categoryColorMap).toEqual(map)
    })

    it('setNextColorIndex изменяет индекс', () => {
        useCategoryStore.getState().setNextColorIndex(5)
        expect(useCategoryStore.getState().nextColorIndex).toBe(5)
    })

    it('setLoading изменяет loading', () => {
        useCategoryStore.getState().setLoading(true)
        expect(useCategoryStore.getState().loading).toBe(true)
        useCategoryStore.getState().setLoading(false)
        expect(useCategoryStore.getState().loading).toBe(false)
    })

    it('setError изменяет error', () => {
        const err = { message: 'Ошибка', status: 400 }
        useCategoryStore.getState().setError(err)
        expect(useCategoryStore.getState().error).toEqual(err)
        useCategoryStore.getState().setError(null)
        expect(useCategoryStore.getState().error).toBeNull()
    })

    it('clearError сбрасывает ошибку', () => {
        useCategoryStore.setState({ error: { message: 'Ошибка', status: 400 } as any })
        useCategoryStore.getState().clearError()
        expect(useCategoryStore.getState().error).toBeNull()
    })

    it('resetCategories сбрасывает всё', () => {
        useCategoryStore.setState({
            categories: mockCategories,
            categoriesMonth: { "Еда": 100 },
            categoryColorMap: { "Еда": "#fff" },
            nextColorIndex: 2,
            loading: true,
            error: { message: 'Ошибка', status: 400 }
        })
        useCategoryStore.getState().resetCategories()
        expect(useCategoryStore.getState().categories).toBeNull()
        expect(useCategoryStore.getState().categoriesMonth).toBeNull()
        expect(useCategoryStore.getState().categoryColorMap).toEqual({})
        expect(useCategoryStore.getState().nextColorIndex).toBe(0)
        expect(useCategoryStore.getState().loading).toBe(false)
        expect(useCategoryStore.getState().error).toBeNull()
    })

    it('handleError обрабатывает ошибку и кидает её', () => {
        const rawError = new Error('fail')
        const processed = { message: 'Ошибка', status: 403 }
        const spy = vi.spyOn(errorUtils, 'handleCategoryApiError').mockReturnValue(processed)

        try {
            useCategoryStore.getState().handleError(rawError, 'fetchCategories')
            expect(false).toBe(true)
        } catch (e) {
            expect(e).toEqual(processed)
        }
        expect(useCategoryStore.getState().error).toEqual(processed)
        expect(useCategoryStore.getState().loading).toBe(false)
        expect(spy).toHaveBeenCalledWith(rawError)
    })

    it('fetchCategories: успешный запрос', async () => {
        vi.spyOn(categoryAPI, 'getCategories').mockResolvedValue({ Categories: mockCategories })
        const updateColorMapSpy = vi.spyOn(useCategoryStore.getState(), '_updateCategoryColorMap')

        await act(async () => {
            await useCategoryStore.getState().fetchCategories()
        })

        expect(useCategoryStore.getState().categories).toEqual(mockCategories)
        expect(useCategoryStore.getState().loading).toBe(false)
        expect(useCategoryStore.getState().error).toBeNull()
        expect(updateColorMapSpy).toHaveBeenCalledWith(mockCategories)
    })

    it('fetchCategories: ошибка запроса', async () => {
        const error = new Error('fail')
        const processed = { message: 'Ошибка', status: 500 }
        vi.spyOn(categoryAPI, 'getCategories').mockRejectedValue(error)
        vi.spyOn(errorUtils, 'handleCategoryApiError').mockReturnValue(processed)

        await act(async () => {
            try {
                await useCategoryStore.getState().fetchCategories()
            } catch (e) {
                expect(e).toEqual(processed)
            }
        })

        expect(useCategoryStore.getState().categories).toBeNull()
        expect(useCategoryStore.getState().loading).toBe(false)
        expect(useCategoryStore.getState().error).toEqual(processed)
    })

    it('_updateCategoryColorMap корректно обновляет карту', () => {
        useCategoryStore.setState({
            categoryColorMap: {},
            nextColorIndex: 0
        })
        useCategoryStore.getState()._updateCategoryColorMap(mockCategories)
        const map = useCategoryStore.getState().categoryColorMap
        expect(Object.keys(map)).toEqual(['Еда', 'Транспорт'])
        expect(CHART_COLORS).toContain(map['Еда'])
        expect(CHART_COLORS).toContain(map['Транспорт'])
        expect(useCategoryStore.getState().nextColorIndex).toBe(2)
    })
})
