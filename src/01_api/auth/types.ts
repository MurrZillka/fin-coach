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