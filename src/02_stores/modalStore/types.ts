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