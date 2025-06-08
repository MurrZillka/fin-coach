// src/04_components/ui/Modals/Modal.tsx
import { useEffect, useRef, useState } from 'react';
import Text from '../../Text';
import Input from '../../Input';
import TextButton from '../../TextButton';
import Tooltip from '../../Tooltip';
import { XMarkIcon } from '@heroicons/react/24/outline';
import IconButton from '../../IconButton';
import useModalStore from '../../../../02_stores/modalStore/modalStore';
import { clearServerFieldErrors, mapServerErrorToFieldError } from '../utils/fieldErrorMapping.js';
import type { ModalProps, Field, SubmissionError } from './types';

const Modal: React.FC<ModalProps> = ({
                                         isOpen,
                                         onClose,
                                         title,
                                         fields,
                                         initialData = {},
                                         onSubmit,
                                         submitText = 'Сохранить',
                                         onFieldChange,
                                         submissionError = null,
                                     }) => {
    const [formData, setFormData] = useState<Record<string, any>>(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentFields, setCurrentFields] = useState<Field[]>(fields);
    const firstInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const today = new Date();
        const fullYear = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = `${fullYear}-${month}-${day}`;

        const initialFormData = fields.reduce((acc, field) => {
            const initialValue = initialData[field.name];
            if (field.type === 'checkbox') {
                acc[field.name] = initialValue === undefined || initialValue === null ? false : !!initialValue;
            } else if (field.type === 'select') {
                acc[field.name] = initialValue === undefined || initialValue === null ? '' : String(initialValue);
            } else if (field.type === 'date') {
                if (
                    initialValue === '' ||
                    initialValue === null ||
                    initialValue === undefined ||
                    initialValue === '0001-01-01' ||
                    initialValue === '0001-01-01T00:00:00Z'
                ) {
                    acc[field.name] = todayString;
                } else {
                    try {
                        const date = new Date(initialValue);
                        if (!isNaN(date.getTime())) {
                            const y = date.getFullYear();
                            const m = String(date.getMonth() + 1).padStart(2, '0');
                            const d = String(date.getDate()).padStart(2, '0');
                            acc[field.name] = `${y}-${m}-${d}`;
                        } else {
                            acc[field.name] = String(initialValue);
                        }
                    } catch {
                        acc[field.name] = String(initialValue);
                    }
                }
            } else {
                acc[field.name] = initialValue === undefined || initialValue === null ? '' : initialValue;
            }
            return acc;
        }, {} as Record<string, any>);
        setFormData(initialFormData);
        setErrors({});
        setCurrentFields(fields);
    }, [initialData, fields]);

    useEffect(() => {
        if (isOpen && firstInputRef.current) {
            firstInputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if ((submissionError as SubmissionError)?.field) {
            const fieldError = mapServerErrorToFieldError(submissionError);
            if (fieldError) {
                setErrors((prev) => ({
                    ...prev,
                    [fieldError.field!]: fieldError.message!,
            }));
            }
        } else if (submissionError === null) {
            setErrors((prev) => clearServerFieldErrors(prev));
        }
    }, [submissionError]);

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
        }
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleChange = (name: string, value: any) => {
        let fieldValue = value;
        const fieldDefinition = currentFields.find((f) => f.name === name);
        if (fieldDefinition && fieldDefinition.type === 'date' && value === '') {
            const today = new Date();
            const fullYear = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            fieldValue = `${fullYear}-${month}-${day}`;
        }
        setFormData((prev) => {
            const newFormData = { ...prev, [name]: fieldValue };
            if (onFieldChange) {
                const newFields = onFieldChange(name, value, newFormData);
                if (newFields && Array.isArray(newFields)) {
                    setCurrentFields(newFields);
                }
            }
            return newFormData;
        });
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
        queueMicrotask(() => {
            useModalStore.getState().setModalSubmissionError(null);
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        const dataToSend: Record<string, any> = { ...formData };

        currentFields.forEach((field) => {
            const fieldName = field.name;
            const fieldType = field.type || 'text';
            const fieldValue = dataToSend[fieldName];

            if (field.required) {
                let isMissing = false;
                if (fieldValue === undefined || fieldValue === null) {
                    isMissing = true;
                } else if (fieldType === 'checkbox') {
                    if (fieldValue !== true) isMissing = true;
                } else {
                    if (String(fieldValue).trim() === '') isMissing = true;
                    if (fieldType === 'date' && String(fieldValue) === '0001-01-01') {
                        isMissing = true;
                    }
                }
                if (isMissing) {
                    newErrors[fieldName] = `Вы обязаны выбрать. Отправка формы невозможна`;
                }
            }

            if (fieldName === 'amount') {
                const valueAsString = String(fieldValue).trim();
                if (valueAsString !== '') {
                    const amountValue = parseFloat(valueAsString);
                    if (isNaN(amountValue) || amountValue <= 0) {
                        newErrors[fieldName] = 'Сумма должна быть больше нуля';
                    }
                }
            }

            if (fieldType === 'number') {
                const valueAsString = String(fieldValue);
                if (valueAsString.trim() !== '') {
                    const parsedAmount = parseFloat(valueAsString);
                    dataToSend[fieldName] = isNaN(parsedAmount) ? 0 : parsedAmount;
                } else {
                    dataToSend[fieldName] = 0;
                }
            } else if (fieldType === 'checkbox') {
                dataToSend[fieldName] = !!fieldValue;
            } else if (fieldType === 'select') {
                if (
                    String(fieldValue).trim() === '' ||
                    fieldValue === null ||
                    fieldValue === undefined
                ) {
                    dataToSend[fieldName] = null;
                } else {
                    const parsedValue = Number(fieldValue);
                    dataToSend[fieldName] = isNaN(parsedValue) ? String(fieldValue) : parsedValue;
                }
            } else if (fieldType === 'date') {
                const dateValue = String(fieldValue).trim();
                dataToSend[fieldName] = dateValue === '' ? '0001-01-01' : dateValue;
            } else {
                if (
                    String(fieldValue).trim() === '' ||
                    fieldValue === null ||
                    fieldValue === undefined
                ) {
                    dataToSend[fieldName] = null;
                } else {
                    dataToSend[fieldName] = String(fieldValue);
                }
            }
        });

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            useModalStore.getState().setModalSubmissionError(null);
        }
        if (Object.keys(newErrors).length === 0) {
            onSubmit(dataToSend);
        }
    };

    return (
        <div
            className="fixed inset-0 flex justify-center z-50 items-start pt-[10vh] backdrop-blur-xs bg-black/20 w-full"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="p-4 rounded-lg shadow-2xl w-full max-w-md bg-green-100 border border-gray-300 relative max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-1">
                    <Text variant="h2">{title}</Text>
                    <IconButton
                        icon={XMarkIcon}
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    />
                </div>
                {submissionError && (
                    <div className="mb-4 py-2 px-3 bg-red-100 text-sm border rounded-md text-[var(--color-form-error)] border-[var(--color-form-error)]">
                        {typeof submissionError === 'string'
                            ? submissionError
                            : submissionError.message || ''}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-0">
                    {currentFields.map((field, index) => (
                        <div key={field.name} className="relative">
                            <Input
                                ref={index === 0 ? firstInputRef : null}
                                label={field.label}
                                name={field.name}
                                type={field.type || 'text'}
                                value={
                                    field.type === 'checkbox'
                                        ? !!formData[field.name]
                                        : formData[field.name] || ''
                                }
                                onChange={handleChange}
                                error={errors[field.name]}
                                placeholder={field.placeholder}
                                disabled={field.disabled}
                                required={field.required}
                                options={field.options}
                            />
                            {field.tooltip && (
                                <Tooltip text={field.tooltip} className="absolute right-2 top-2">
                                    <span>?</span>
                                </Tooltip>
                            )}
                        </div>
                    ))}
                    <div className="flex justify-end gap-2">
                        <TextButton
                            onClick={onClose}
                            type="button"
                            variant="secondary"
                        >
                            Отмена
                        </TextButton>
                        <TextButton
                            type="submit"
                            variant="primary"
                        >
                            {submitText}
                        </TextButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Modal;
