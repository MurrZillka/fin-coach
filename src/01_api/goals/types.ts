// Одна цель
export interface Goal {
    id: number;
    user_id: number;
    amount: number;
    description: string;
    wish_date: string;          // ISO-строка даты
    achievement_date: string;   // ISO-строка даты
    is_achieved: boolean;
    is_current: boolean;
    is_delete: boolean;
}

// Запрос на создание/обновление цели
export interface GoalRequest {
    description: string;
    amount: number;
    wish_date: string; // 'YYYY-MM-DD'
}

// Ответ на действия с целью
export interface GoalActionResponse {
    message: string;
}
