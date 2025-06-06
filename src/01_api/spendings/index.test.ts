// src/api/spendings/index.test.ts

import { describe, it, expect, vi, afterEach } from 'vitest'
import {
    addSpending,
    getSpendings,
    getSpendingsPermanent,
    getSpendingById,
    updateSpendingById,
    deleteSpendingById
} from './index'
import apiClient from '../client'

vi.mock('../client')

const mockedApiClient = apiClient as any

describe('spendings API', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('getSpendings', () => {
        it('should return spendings data on successful request', async () => {
            const mockData = {
                Spendings: [
                    {
                        id: 39,
                        user_id: 3,
                        is_delete: false,
                        amount: 34556,
                        description: "фыва",
                        is_permanent: true,
                        date: "2025-02-27T00:00:00Z",
                        category_id: 7,
                        end_date: "0001-01-01T00:00:00Z",
                        full_amount: 138224
                    }
                ]
            }
            mockedApiClient.get.mockResolvedValue({ data: mockData })

            const result = await getSpendings()

            expect(result).toEqual(mockData)
            expect(mockedApiClient.get).toHaveBeenCalledWith('/Spendings')
        })
    })

    describe('getSpendingsPermanent', () => {
        it('should return permanent spendings data on successful request', async () => {
            const mockData = {
                Spendings: [
                    {
                        id: 39,
                        user_id: 3,
                        is_delete: false,
                        amount: 34556,
                        description: "фыва",
                        is_permanent: true,
                        date: "2025-02-27T00:00:00Z",
                        category_id: 7,
                        end_date: "0001-01-01T00:00:00Z",
                        full_amount: 138224
                    }
                ]
            }
            mockedApiClient.get.mockResolvedValue({ data: mockData })

            const result = await getSpendingsPermanent()

            expect(result).toEqual(mockData)
            expect(mockedApiClient.get).toHaveBeenCalledWith('/Spendings?permanent=true')
        })
    })

    describe('getSpendingById', () => {
        it('should return spending by id on successful request', async () => {
            const mockData = {
                id: 39,
                user_id: 3,
                is_delete: false,
                amount: 34556,
                description: "фыва",
                is_permanent: true,
                date: "2025-02-27T00:00:00Z",
                category_id: 7,
                end_date: "0001-01-01T00:00:00Z",
                full_amount: 138224
            }
            mockedApiClient.get.mockResolvedValue({ data: mockData })

            const result = await getSpendingById(39)

            expect(result).toEqual(mockData)
            expect(mockedApiClient.get).toHaveBeenCalledWith('/Spending/39')
        })
    })

    describe('addSpending', () => {
        it('should add spending successfully', async () => {
            const spendingData = {
                description: "2345432",
                amount: 4524352,
                category_id: 7,
                date: "2025-06-06",
                is_permanent: false,
                end_date: "0001-01-01"
            }
            const mockResponse = { message: "Spending added successfully" }
            mockedApiClient.post.mockResolvedValue({ data: mockResponse })

            const result = await addSpending(spendingData)

            expect(result).toEqual(mockResponse)
            expect(mockedApiClient.post).toHaveBeenCalledWith('/AddSpending', spendingData)
        })
    })

    describe('updateSpendingById', () => {
        it('should update spending successfully', async () => {
            const spendingData = {
                description: "2345432",
                amount: 4524352,
                category_id: 7,
                date: "2025-06-05",
                is_permanent: false,
                end_date: "0001-01-01"
            }
            const mockResponse = { message: "Spending updated successfully" }
            mockedApiClient.put.mockResolvedValue({ data: mockResponse })

            const result = await updateSpendingById(45, spendingData)

            expect(result).toEqual(mockResponse)
            expect(mockedApiClient.put).toHaveBeenCalledWith('/Spending/45', spendingData)
        })
    })

    describe('deleteSpendingById', () => {
        it('should delete spending successfully', async () => {
            const mockResponse = { message: "Spending deleted successfully" }
            mockedApiClient.delete.mockResolvedValue({ data: mockResponse })

            const result = await deleteSpendingById(44)

            expect(result).toEqual(mockResponse)
            expect(mockedApiClient.delete).toHaveBeenCalledWith('/Spending/44')
        })
    })
})
