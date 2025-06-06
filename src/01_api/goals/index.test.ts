// src/api/goals/index.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
    getGoals,
    addGoal,
    updateGoalById,
    deleteGoalById,
    getCurrentGoal,
    setCurrentGoal
} from './index'
import apiClient from '../client'

vi.mock('../client')

const mockedApiClient = apiClient as any

describe('goals API', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('getGoals', () => {
        it('should return goals data on successful request', async () => {
            const mockData = [
                {
                    id: 1,
                    user_id: 1,
                    amount: 1000000,
                    description: "Машина",
                    wish_date: "2025-12-31T00:00:00Z",
                    achievement_date: "0001-01-01T00:00:00Z",
                    is_achieved: false,
                    is_current: false,
                    is_delete: false
                }
            ]
            mockedApiClient.get.mockResolvedValue({ data: mockData })

            const result = await getGoals()

            expect(result).toEqual(mockData)
            expect(mockedApiClient.get).toHaveBeenCalledWith('/Goals')
        })

        it('should return empty array if no goals', async () => {
            mockedApiClient.get.mockResolvedValue({ data: [] })

            const result = await getGoals()

            expect(result).toEqual([])
        })

        it('should throw error on server error', async () => {
            mockedApiClient.get.mockRejectedValue(new Error('Server error'))

            await expect(getGoals()).rejects.toThrow('Server error')
        })
    })

    describe('addGoal', () => {
        it('should add goal successfully', async () => {
            const goalData = {
                description: "Квартира",
                amount: 5000000,
                wish_date: "2027-01-01"
            }
            const mockResponse = { message: "Goal added successfully" }
            mockedApiClient.post.mockResolvedValue({ data: mockResponse })

            const result = await addGoal(goalData)

            expect(result).toEqual(mockResponse)
            expect(mockedApiClient.post).toHaveBeenCalledWith('/AddGoal', goalData)
        })

        it('should throw error when goal data is invalid', async () => {
            mockedApiClient.post.mockRejectedValue(new Error('invalid_goal_amount'))

            await expect(addGoal({
                description: "Test",
                amount: -100,
                wish_date: "2025-01-01"
            })).rejects.toThrow('invalid_goal_amount')
        })

        it('should throw error on server error', async () => {
            mockedApiClient.post.mockRejectedValue(new Error('Server error'))

            await expect(addGoal({
                description: "Test",
                amount: 100000,
                wish_date: "2025-01-01"
            })).rejects.toThrow('Server error')
        })
    })

    describe('updateGoalById', () => {
        it('should update goal successfully', async () => {
            const goalData = {
                description: "Машина обновленная",
                amount: 1200000,
                wish_date: "2026-01-01"
            }
            const mockResponse = { message: "Goal updated successfully" }
            mockedApiClient.put.mockResolvedValue({ data: mockResponse })

            const result = await updateGoalById(1, goalData)

            expect(result).toEqual(mockResponse)
            expect(mockedApiClient.put).toHaveBeenCalledWith('/Goal/1', goalData)
        })

        it('should throw error when goal not found', async () => {
            mockedApiClient.put.mockRejectedValue(new Error('goal_not_found'))

            await expect(updateGoalById(999, {
                description: "Test",
                amount: 100000,
                wish_date: "2025-01-01"
            })).rejects.toThrow('goal_not_found')
        })

        it('should throw error on server error', async () => {
            mockedApiClient.put.mockRejectedValue(new Error('Server error'))

            await expect(updateGoalById(1, {
                description: "Test",
                amount: 100000,
                wish_date: "2025-01-01"
            })).rejects.toThrow('Server error')
        })
    })

    describe('deleteGoalById', () => {
        it('should delete goal successfully', async () => {
            const mockResponse = { message: "Goal deleted successfully" }
            mockedApiClient.delete.mockResolvedValue({ data: mockResponse })

            const result = await deleteGoalById(1)

            expect(result).toEqual(mockResponse)
            expect(mockedApiClient.delete).toHaveBeenCalledWith('/Goal/1')
        })

        it('should throw error when goal not found', async () => {
            mockedApiClient.delete.mockRejectedValue(new Error('goal_not_found'))

            await expect(deleteGoalById(999)).rejects.toThrow('goal_not_found')
        })

        it('should throw error on server error', async () => {
            mockedApiClient.delete.mockRejectedValue(new Error('Server error'))

            await expect(deleteGoalById(1)).rejects.toThrow('Server error')
        })
    })

    describe('getCurrentGoal', () => {
        it('should return current goal on successful request', async () => {
            const mockData = {
                id: 1,
                user_id: 1,
                amount: 1000000,
                description: "Машина",
                wish_date: "2025-12-31T00:00:00Z",
                achievement_date: "0001-01-01T00:00:00Z",
                is_achieved: false,
                is_current: true,
                is_delete: false
            }
            mockedApiClient.get.mockResolvedValue({ data: mockData })

            const result = await getCurrentGoal()

            expect(result).toEqual(mockData)
            expect(mockedApiClient.get).toHaveBeenCalledWith('/CurrentGoal')
        })

        it('should throw error if no current goal found', async () => {
            mockedApiClient.get.mockRejectedValue(new Error('no current goal found'))

            await expect(getCurrentGoal()).rejects.toThrow('no current goal found')
        })

        it('should throw error on server error', async () => {
            mockedApiClient.get.mockRejectedValue(new Error('Server error'))

            await expect(getCurrentGoal()).rejects.toThrow('Server error')
        })
    })

    describe('setCurrentGoal', () => {
        it('should set current goal successfully', async () => {
            const mockResponse = { message: "Goal updated successfully" }
            mockedApiClient.put.mockResolvedValue({ data: mockResponse })

            const result = await setCurrentGoal(1)

            expect(result).toEqual(mockResponse)
            expect(mockedApiClient.put).toHaveBeenCalledWith('/CurrentGoal/1', null)
        })

        it('should throw error when goal not found', async () => {
            mockedApiClient.put.mockRejectedValue(new Error('goal_not_found'))

            await expect(setCurrentGoal(999)).rejects.toThrow('goal_not_found')
        })

        it('should throw error on server error', async () => {
            mockedApiClient.put.mockRejectedValue(new Error('Server error'))

            await expect(setCurrentGoal(1)).rejects.toThrow('Server error')
        })
    })
})
