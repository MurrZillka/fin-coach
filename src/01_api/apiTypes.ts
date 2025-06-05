export interface ApiError {
    message: string;
    status: number;
}

export interface ApiErrorWithMessage {
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