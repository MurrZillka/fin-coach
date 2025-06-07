//src/01_api/credit/types.ts
export interface Credit {
    id: number;
    user_id: number;
    amount: number;
    description: string;
    is_permanent: boolean;
    date: string;        // ISO-строка даты
    is_delete: boolean;
    end_date: string;    // ISO-строка даты
    full_amount: number;
}

// Ответ на GET /GetCredits
export interface GetCreditsResponse {
    Credits: Credit[];
}

// Запрос на добавление/обновление кредита
export interface CreditRequest {
    description: string;
    amount: number;
    date: string;         // 'YYYY-MM-DD'
    is_permanent: boolean;
    end_date: string;     // 'YYYY-MM-DD' или '0001-01-01'
}

// Ответ на действия с кредитом
export interface CreditActionResponse {
    message: string;
}

export interface CreditFieldError {
    message: string;
    field: string | null;
    status: number;
}