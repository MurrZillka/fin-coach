// src/04_components/ui/Modals/Modal.types.ts

export interface Field {
    name: string;
    type?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    options?: Array<{ value: string | number; label: string }>;
    tooltip?: string;
}

export interface SubmissionError {
    message?: string;
    field?: string;
}

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    fields: Field[];
    initialData?: Record<string, any>;
    onSubmit: (data: Record<string, any>) => void;
    submitText?: string;
    onFieldChange?: (name: string, value: any, formData: Record<string, any>) => Field[] | void;
    submissionError?: string | SubmissionError | null;
}
