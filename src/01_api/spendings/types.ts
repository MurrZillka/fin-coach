export interface Spending {
    id: number;
    user_id: number;
    is_delete: boolean;
    amount: number;
    description: string;
    is_permanent: boolean;
    date: string;
    category_id: number;
    end_date: string;
    full_amount: number;
}

export interface GetSpendingsResponse {
    Spendings: Spending[];
}

export interface SpendingRequest {
    description: string;
    amount: number;
    category_id: number;
    date: string;
    is_permanent: boolean;
    end_date: string;
}

export interface SpendingActionResponse {
    message: string;
}
