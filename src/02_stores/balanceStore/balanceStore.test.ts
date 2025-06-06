// src/02_stores/balanceStore/balanceStore.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from '@testing-library/react'
import useBalanceStore from './balanceStore'
import * as balanceApi from '../../01_api/balance/index'
import * as errorUtils from '../../01_api/balance/utils/handleBalanceApiError'

describe('useBalanceStore', () => {
    beforeEach(() => {
        useBalanceStore.setState({
            balance: null,
            loading: false,
            error: null
        })
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('setBalance изменяет баланс', () => {
        useBalanceStore.getState().setBalance(12345)
        expect(useBalanceStore.getState().balance).toBe(12345)
        useBalanceStore.getState().setBalance(null)
        expect(useBalanceStore.getState().balance).toBeNull()
    })

    it('setLoading изменяет loading', () => {
        useBalanceStore.getState().setLoading(true)
        expect(useBalanceStore.getState().loading).toBe(true)
        useBalanceStore.getState().setLoading(false)
        expect(useBalanceStore.getState().loading).toBe(false)
    })

    it('setError изменяет error', () => {
        const err = { message: 'Ошибка', status: 400 }
        useBalanceStore.getState().setError(err)
        expect(useBalanceStore.getState().error).toEqual(err)
        useBalanceStore.getState().setError(null)
        expect(useBalanceStore.getState().error).toBeNull()
    })

    it('clearError сбрасывает ошибку', () => {
        useBalanceStore.setState({ error: { message: 'Ошибка', status: 400 } as any })
        useBalanceStore.getState().clearError()
        expect(useBalanceStore.getState().error).toBeNull()
    })

    it('resetBalance сбрасывает всё', () => {
        useBalanceStore.setState({
            balance: 100,
            loading: true,
            error: { message: 'Ошибка', status: 400 }
        })
        useBalanceStore.getState().resetBalance()
        expect(useBalanceStore.getState().balance).toBeNull()
        expect(useBalanceStore.getState().loading).toBe(false)
        expect(useBalanceStore.getState().error).toBeNull()
    })

    it('handleError обрабатывает ошибку и кидает её', () => {
        const rawError = new Error('fail')
        const processed = { message: 'Ошибка', status: 403 }
        const spy = vi.spyOn(errorUtils, 'handleBalanceApiError').mockReturnValue(processed)

        try {
            useBalanceStore.getState().handleError(rawError, 'fetchBalance')
            // Если не выбросило — ошибка теста
            expect(false).toBe(true)
        } catch (e) {
            expect(e).toEqual(processed)
        }
        expect(useBalanceStore.getState().error).toEqual(processed)
        expect(useBalanceStore.getState().loading).toBe(false)
        expect(spy).toHaveBeenCalledWith(rawError)
    })

    it('fetchBalance: успешный запрос', async () => {
        const apiResult = { balance: 777 }
        vi.spyOn(balanceApi, 'getBalance').mockResolvedValue(apiResult)

        await act(async () => {
            await useBalanceStore.getState().fetchBalance()
        })

        expect(useBalanceStore.getState().balance).toBe(777)
        expect(useBalanceStore.getState().loading).toBe(false)
        expect(useBalanceStore.getState().error).toBeNull()
    })

    it('fetchBalance: ошибка запроса', async () => {
        const error = new Error('fail')
        const processed = { message: 'Ошибка', status: 500 }
        vi.spyOn(balanceApi, 'getBalance').mockRejectedValue(error)
        const spy = vi.spyOn(errorUtils, 'handleBalanceApiError').mockReturnValue(processed)

        await act(async () => {
            try {
                await useBalanceStore.getState().fetchBalance()
                // Если не выбросило — ошибка теста
                expect(false).toBe(true)
            } catch (e) {
                expect(e).toEqual(processed)
            }
        })

        expect(useBalanceStore.getState().balance).toBeNull()
        expect(useBalanceStore.getState().loading).toBe(false)
        expect(useBalanceStore.getState().error).toEqual(processed)
        expect(spy).toHaveBeenCalledWith(error)
    })

    // --- EDGE CASES ---

    it('fetchBalance: если два вызова подряд, loading корректно сбрасывается', async () => {
        const apiResult = { balance: 100 }
        vi.spyOn(balanceApi, 'getBalance').mockResolvedValue(apiResult)

        await act(async () => {
            const promise1 = useBalanceStore.getState().fetchBalance()
            const promise2 = useBalanceStore.getState().fetchBalance()
            await Promise.all([promise1, promise2])
        })

        expect(useBalanceStore.getState().loading).toBe(false)
        expect(useBalanceStore.getState().balance).toBe(100)
    })

    it('fetchBalance: если первый вызов завершился ошибкой, второй успехом — баланс обновляется, ошибка сбрасывается', async () => {
        const error = new Error('fail')
        const processed = { message: 'Ошибка', status: 500 }
        const getBalanceSpy = vi.spyOn(balanceApi, 'getBalance')
        getBalanceSpy
            .mockRejectedValueOnce(error)
            .mockResolvedValueOnce({ balance: 200 })

        vi.spyOn(errorUtils, 'handleBalanceApiError').mockReturnValue(processed)

        await act(async () => {
            try {
                await useBalanceStore.getState().fetchBalance()
            } catch (e) {
                expect(e).toEqual(processed)
            }
            await useBalanceStore.getState().fetchBalance()
        })

        expect(useBalanceStore.getState().balance).toBe(200)
        expect(useBalanceStore.getState().loading).toBe(false)
        expect(useBalanceStore.getState().error).toBeNull()
    })

    it('fetchBalance: если оба вызова завершились ошибкой — ошибка сохраняется', async () => {
        const error = new Error('fail')
        const processed = { message: 'Ошибка', status: 500 }
        vi.spyOn(balanceApi, 'getBalance').mockRejectedValue(error)
        vi.spyOn(errorUtils, 'handleBalanceApiError').mockReturnValue(processed)

        await act(async () => {
            try {
                await useBalanceStore.getState().fetchBalance()
            } catch (e) {
                expect(e).toEqual(processed)
            }
            try {
                await useBalanceStore.getState().fetchBalance()
            } catch (e) {
                expect(e).toEqual(processed)
            }
        })

        expect(useBalanceStore.getState().balance).toBeNull()
        expect(useBalanceStore.getState().error).toEqual(processed)
        expect(useBalanceStore.getState().loading).toBe(false)
    })
})
