export interface ApiError {
    message: string;
    status: number;
}

export interface BackendError {
    error: string;
}

export interface ApiResponse<T> {
    data: T;
    error: null;
}

//types auth

export interface SignupRequest {
    user_name: string;
    login: string;
    password: string;
}

export interface SignupResponse {
    ok: boolean;
}

export interface LoginRequest {
    login: string;
    password: string;
}

export interface LoginResponse {
    expires_in: number;
    access_token: string;
    token_type: string;
    role: number;
    userName: string;
    userid: number;
}

export interface BalanceResponse {
    balance: number;
}

//types Balance
// Тип возвращаемого значения — статус всегда обязателен
export interface ApiErrorWithMessage {
    message: string;
    status: number;
}