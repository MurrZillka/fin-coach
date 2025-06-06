// src/02_stores/creditStore/types.ts

import type { Credit, CreditRequest, CreditActionResponse, CreditFieldError } from '../../01_api/credit/types';

export interface CreditStoreState {
    credits: Credit[] | null;
    loading: boolean;
    error: CreditFieldError | null;
}

export interface CreditStoreActions {
    setCredits: (credits: Credit[] | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: CreditFieldError | null) => void;
    handleError: (error: any, actionName: string) => never;

    fetchCredits: () => Promise<void>;
    addCredit: (creditData: CreditRequest) => Promise<CreditActionResponse | undefined>;
    updateCredit: (id: number, creditData: CreditRequest) => Promise<CreditActionResponse | undefined>;
    deleteCredit: (id: number) => Promise<CreditActionResponse | undefined>;
    resetCredits: () => void;
    clearError: () => void;
}

export type CreditStore = CreditStoreState & CreditStoreActions;
