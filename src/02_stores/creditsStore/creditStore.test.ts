// src/02_stores/creditStore/creditStore.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from '@testing-library/react'
import useCreditStore from './creditStore'
import * as creditAPI from '../../01_api/credit/index'
import * as errorUtils from '../../01_api/credit/utils/handleCreditApiError'

const mockCredits = [
    {
        id: 1,
        user_id: 1,
        amount: 1000,
        description: "Зарплата",
        is_permanent: true,
        date: "2024-01-01T00:00:00Z",
        is_delete: false,
        end_date: "0001-01-01T00:00:00Z",
        full_amount: 12000
    }
]

describe('useCreditStore', () => {
    beforeEach(() => {
        useCreditStore.setState({
            credits: null,
            loading: false,
            error: null
        })
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('setCredits изменяет credits', () => {
        useCreditStore.getState().setCredits(mockCredits)
        expect(useCreditStore.getState().credits).toEqual(mockCredits)
        useCreditStore.getState().setCredits(null)
        expect(useCreditStore.getState().credits).toBeNull()
    })

    it('setLoading изменяет loading', () => {
        useCreditStore.getState().setLoading(true)
        expect(useCreditStore.getState().loading).toBe(true)
        useCreditStore.getState().setLoading(false)
        expect(useCreditStore.getState().loading).toBe(false)
    })

    it('setError изменяет error', () => {
        const err = { message: 'Ошибка', field: null, status: 400 }
        useCreditStore.getState().setError(err)
        expect(useCreditStore.getState().error).toEqual(err)
        useCreditStore.getState().setError(null)
        expect(useCreditStore.getState().error).toBeNull()
    })

    it('clearError сбрасывает ошибку', () => {
        useCreditStore.setState({ error: { message: 'Ошибка', field: null, status: 400 } as any })
        useCreditStore.getState().clearError()
        expect(useCreditStore.getState().error).toBeNull()
    })

    it('resetCredits сбрасывает всё', () => {
        useCreditStore.setState({
            credits: mockCredits,
            loading: true,
            error: { message: 'Ошибка', field: null, status: 400 }
        })
        useCreditStore.getState().resetCredits()
        expect(useCreditStore.getState().credits).toBeNull()
        expect(useCreditStore.getState().loading).toBe(false)
        expect(useCreditStore.getState().error).toBeNull()
    })

    it('handleError обрабатывает ошибку и кидает её', () => {
        const rawError = new Error('fail')
        const processed = { message: 'Ошибка', field: null, status: 403 }
        const spy = vi.spyOn(errorUtils, 'handleCreditApiError').mockReturnValue(processed)

        try {
            useCreditStore.getState().handleError(rawError, 'fetchCredits')
            expect(false).toBe(true)
        } catch (e) {
            expect(e).toEqual(processed)
        }
        expect(useCreditStore.getState().error).toEqual(processed)
        expect(useCreditStore.getState().loading).toBe(false)
        expect(spy).toHaveBeenCalledWith(rawError)
    })

    it('fetchCredits: успешный запрос', async () => {
        vi.spyOn(creditAPI, 'getCredits').mockResolvedValue({ Credits: mockCredits })

        await act(async () => {
            await useCreditStore.getState().fetchCredits()
        })

        expect(useCreditStore.getState().credits).toEqual(mockCredits)
        expect(useCreditStore.getState().loading).toBe(false)
        expect(useCreditStore.getState().error).toBeNull()
    })

    it('fetchCredits: ошибка запроса', async () => {
        const error = new Error('fail')
        const processed = { message: 'Ошибка', field: null, status: 500 }
        vi.spyOn(creditAPI, 'getCredits').mockRejectedValue(error)
        vi.spyOn(errorUtils, 'handleCreditApiError').mockReturnValue(processed)

        await act(async () => {
            try {
                await useCreditStore.getState().fetchCredits()
            } catch (e) {
                expect(e).toEqual(processed)
            }
        })

        expect(useCreditStore.getState().credits).toBeNull()
        expect(useCreditStore.getState().loading).toBe(false)
        expect(useCreditStore.getState().error).toEqual(processed)
    })

    // Аналогично можно покрыть addCredit, updateCredit, deleteCredit
})
