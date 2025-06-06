import type { ApiErrorWithMessage } from '../../01_api/apiTypes';

export interface BalanceResponse {
    balance: number;
}

export interface BalanceStoreState {
    balance: number | null;
    loading: boolean;
    error: ApiErrorWithMessage | null;
}

export interface BalanceStoreActions {
    setBalance: (balance: number | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: ApiErrorWithMessage | null) => void;
    handleError: (error: any, actionName: string) => never;
    fetchBalance: () => Promise<void>;
    resetBalance: () => void;
    clearError: () => void;
}

export type BalanceStore = BalanceStoreState & BalanceStoreActions;
