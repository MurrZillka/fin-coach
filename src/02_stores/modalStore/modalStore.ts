// src/02_stores/modalStore/modalStore.ts
import { create } from 'zustand';

export type ModalType = string | null;

export interface ModalStoreState {
    modalType: ModalType;
    modalProps: Record<string, any>;
    submissionError: string | null;
}

export interface ModalStoreActions {
    openModal: (type: string, props?: Record<string, any>) => void;
    closeModal: () => void;
    setModalSubmissionError: (message: string | null) => void;
}

export type ModalStore = ModalStoreState & ModalStoreActions;

const useModalStore = create<ModalStore>((set, get) => ({
    modalType: null,
    modalProps: {},
    submissionError: null,

    openModal: (type, props = {}) => {
        set({
            modalType: type,
            modalProps: props,
            submissionError: null,
        });
        // Для отладки, можно оставить или убрать
        // const currentState = get();
        // console.log(currentState);
    },

    closeModal: () => set({
        modalType: null,
        modalProps: {},
        submissionError: null,
    }),

    setModalSubmissionError: (message) => set({ submissionError: message }),
}));

export default useModalStore;
