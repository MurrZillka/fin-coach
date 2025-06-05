// src/api/categories/index.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
    getCategories,
    addCategory,
    getCategoryById,
    updateCategoryById,
    deleteCategoryById,
    getCategoriesMonth
} from './index'
import apiClient from '../client'

vi.mock('../client')

const mockedApiClient = apiClient as any

describe('categories API', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('getCategories', () => {
        it('should return categories data on successful request', async () => {
            const mockData = {
                Categories: [
                    {
                        id: 1,
                        name: "Еда",
                        description: "Продукты питания",
                        is_delete: false,
                        user_id: 3
                    },
                    {
                        id: 2,
                        name: "Транспорт",
                        description: "Проезд в городском транспорте",
                        is_delete: false,
                        user_id: 3
                    }
                ]
            }
            mockedApiClient.get.mockResolvedValue({ data: mockData })

            const result = await getCategories()

            expect(result).toEqual(mockData)
            expect(mockedApiClient.get).toHaveBeenCalledWith('/Categories')
        })

        it('should return empty categories array', async () => {
            const mockData = { Categories: [] }
            mockedApiClient.get.mockResolvedValue({ data: mockData })

            const result = await getCategories()

            expect(result).toEqual(mockData)
            expect(result.Categories).toHaveLength(0)
        })

        it('should throw error on server error', async () => {
            mockedApiClient.get.mockRejectedValue(new Error('Server error'))

            await expect(getCategories()).rejects.toThrow('Server error')
        })
    })

    describe('addCategory', () => {
        it('should add category successfully', async () => {
            const categoryData = { name: "Кафе", description: "Походы в кафе" }
            const mockResponse = { message: "Category added successfully" }
            mockedApiClient.post.mockResolvedValue({ data: mockResponse })

            const result = await addCategory(categoryData)

            expect(result).toEqual(mockResponse)
            expect(mockedApiClient.post).toHaveBeenCalledWith('/AddCategory', categoryData)
        })

        it('should throw error when category name already exists', async () => {
            const categoryData = { name: "Еда", description: "Уже существует" }
            mockedApiClient.post.mockRejectedValue(new Error('Category name must be unique'))

            await expect(addCategory(categoryData)).rejects.toThrow('Category name must be unique')
        })

        it('should throw error on server error', async () => {
            const categoryData = { name: "Test", description: "Test" }
            mockedApiClient.post.mockRejectedValue(new Error('Server error'))

            await expect(addCategory(categoryData)).rejects.toThrow('Server error')
        })
    })

    describe('getCategoryById', () => {
        it('should return category by id', async () => {
            const mockCategory = {
                id: 1,
                name: "Еда",
                description: "Продукты питания",
                is_delete: false,
                user_id: 3
            }
            mockedApiClient.get.mockResolvedValue({ data: mockCategory })

            const result = await getCategoryById(1)

            expect(result).toEqual(mockCategory)
            expect(mockedApiClient.get).toHaveBeenCalledWith('/Category/1')
        })

        it('should throw error when category not found', async () => {
            mockedApiClient.get.mockRejectedValue(new Error('category_not_found'))

            await expect(getCategoryById(999)).rejects.toThrow('category_not_found')
            expect(mockedApiClient.get).toHaveBeenCalledWith('/Category/999')
        })

        it('should throw error on server error', async () => {
            mockedApiClient.get.mockRejectedValue(new Error('Server error'))

            await expect(getCategoryById(1)).rejects.toThrow('Server error')
        })
    })

    describe('updateCategoryById', () => {
        it('should update category successfully', async () => {
            const categoryData = { name: "Еда обновленная", description: "Новое описание" }
            const mockResponse = { message: "Category updated successfully" }
            mockedApiClient.put.mockResolvedValue({ data: mockResponse })

            const result = await updateCategoryById(1, categoryData)

            expect(result).toEqual(mockResponse)
            expect(mockedApiClient.put).toHaveBeenCalledWith('/Category/1', categoryData)
        })

        it('should throw error when category not found', async () => {
            const categoryData = { name: "Test", description: "Test" }
            mockedApiClient.put.mockRejectedValue(new Error('category_not_found'))

            await expect(updateCategoryById(999, categoryData)).rejects.toThrow('category_not_found')
        })

        it('should throw error when new name already exists', async () => {
            const categoryData = { name: "Транспорт", description: "Уже есть такое имя" }
            mockedApiClient.put.mockRejectedValue(new Error('Category name must be unique'))

            await expect(updateCategoryById(1, categoryData)).rejects.toThrow('Category name must be unique')
        })

        it('should throw error on server error', async () => {
            const categoryData = { name: "Test", description: "Test" }
            mockedApiClient.put.mockRejectedValue(new Error('Server error'))

            await expect(updateCategoryById(1, categoryData)).rejects.toThrow('Server error')
        })
    })

    describe('deleteCategoryById', () => {
        it('should delete category successfully', async () => {
            const mockResponse = { message: "Category deleted successfully" }
            mockedApiClient.delete.mockResolvedValue({ data: mockResponse })

            const result = await deleteCategoryById(1)

            expect(result).toEqual(mockResponse)
            expect(mockedApiClient.delete).toHaveBeenCalledWith('/Category/1')
        })

        it('should throw error when category not found', async () => {
            mockedApiClient.delete.mockRejectedValue(new Error('category_not_found'))

            await expect(deleteCategoryById(999)).rejects.toThrow('category_not_found')
        })

        it('should throw error when category is in use', async () => {
            mockedApiClient.delete.mockRejectedValue(new Error('category_in_use'))

            await expect(deleteCategoryById(1)).rejects.toThrow('category_in_use')
        })

        it('should throw error on server error', async () => {
            mockedApiClient.delete.mockRejectedValue(new Error('Server error'))

            await expect(deleteCategoryById(1)).rejects.toThrow('Server error')
        })
    })

    describe('getCategoriesMonth', () => {
        it('should return categories month data', async () => {
            const mockData = {
                Categories: {
                    "Еда": 34536,
                    "Транспорт": 12000,
                    "Разное": 38008
                }
            }
            mockedApiClient.get.mockResolvedValue({ data: mockData })

            const result = await getCategoriesMonth()

            expect(result).toEqual(mockData)
            expect(mockedApiClient.get).toHaveBeenCalledWith('/CategoriesMonth')
        })

        it('should return empty categories month data', async () => {
            const mockData = { Categories: {} }
            mockedApiClient.get.mockResolvedValue({ data: mockData })

            const result = await getCategoriesMonth()

            expect(result).toEqual(mockData)
            expect(Object.keys(result.Categories)).toHaveLength(0)
        })

        it('should throw error on server error', async () => {
            mockedApiClient.get.mockRejectedValue(new Error('Server error'))

            await expect(getCategoriesMonth()).rejects.toThrow('Server error')
        })

        it('should throw error on network error', async () => {
            mockedApiClient.get.mockRejectedValue(new Error('Network Error'))

            await expect(getCategoriesMonth()).rejects.toThrow('Network Error')
        })
    })
})
