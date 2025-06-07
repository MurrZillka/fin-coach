// src/02_stores/spendingsStore/types.ts
import type { Spending, SpendingRequest, SpendingActionResponse } from '../../01_api/spendings/types';
import type { SpendingFieldError } from '../../01_api/spendings/utils/handleSpendingApiError';

export interface SpendingsStoreState {
    spendings: Spending[] | null;
    loading: boolean;
    error: SpendingFieldError | null;
}

export interface SpendingsStoreActions {
    setSpendings: (spendings: Spending[] | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: SpendingFieldError | null) => void;
    handleError: (error: unknown, actionName: string) => never;
    fetchSpendings: () => Promise<void>;
    addSpending: (spendingData: SpendingRequest) => Promise<SpendingActionResponse>;
    updateSpending: (id: number, spendingData: SpendingRequest) => Promise<SpendingActionResponse>;
    deleteSpending: (id: number) => Promise<SpendingActionResponse>;
    resetSpendings: () => void;
    clearError: () => void;
}

export type SpendingsStore = SpendingsStoreState & SpendingsStoreActions;
