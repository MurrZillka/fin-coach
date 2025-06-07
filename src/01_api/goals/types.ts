// src/01_api/goals/types.ts
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

export interface GoalRequest {
    description: string;
    amount: number;
    wish_date: string; // 'YYYY-MM-DD'
}

export interface GoalActionResponse {
    message: string;
}

export interface GoalsResponse {
    Goals: Goal[];
}

export interface CurrentGoalResponse {
    Goal: Goal | null;
}
