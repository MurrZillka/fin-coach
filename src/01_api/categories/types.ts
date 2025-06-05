// Одна категория
export interface Category {
    id: number;
    name: string;
    description: string;
    is_delete: boolean;
    user_id: number;
}

// Ответ на GET /Categories
export interface GetCategoriesResponse {
    Categories: Category[];
}

// Запрос на создание/обновление категории
export interface CategoryRequest {
    name: string;
    description: string;
}

// Ответ на добавление/удаление/обновление
export interface CategoryActionResponse {
    message: string;
}

// Ответ на GET /CategoriesMonth
export interface CategoriesMonthResponse {
    Categories: Record<string, number>;
    // Пример: { Categories: { "Деффки34": 45345, "Разное": 34556 } }
}
