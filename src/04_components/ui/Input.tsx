// src/components/ui/Input.tsx
import React, { forwardRef, ForwardedRef } from 'react';
import Text from './Text';

interface InputOption {
    value: string | number;
    label: string;
}

interface InputProps {
    label?: string;
    value?: string | number | boolean | null;
    onChange: (name: string, value: string | boolean) => void;
    type?: string;
    name: string;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
    options?: InputOption[];
    required?: boolean;
}

const Input = forwardRef<HTMLInputElement | HTMLSelectElement, InputProps>(({
                                                                                label,
                                                                                value,
                                                                                onChange,
                                                                                type = 'text',
                                                                                name,
                                                                                error,
                                                                                placeholder,
                                                                                disabled = false,
                                                                                options,
                                                                                required = false,
                                                                            }, ref: ForwardedRef<HTMLInputElement | HTMLSelectElement>) => {
    const errorId = `${name}-error`;

    const isCheckbox = type === 'checkbox';
    const isSelect = type === 'select';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, type } = e.target;
        let fieldValue: string | boolean = '';

        if (type === 'checkbox') {
            fieldValue = (e.target as HTMLInputElement).checked;
        } else {
            fieldValue = e.target.value;
        }

        onChange(name, fieldValue);
    };

    return (
        <div className="flex flex-col gap-0">
            {label && (
                <Text variant="label" htmlFor={name}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </Text>
            )}

            {isCheckbox ? (
                <div className="flex items-center gap-2">
                    <input
                        id={name}
                        ref={ref as ForwardedRef<HTMLInputElement>}
                        type="checkbox"
                        name={name}
                        checked={!!value}
                        onChange={handleInputChange}
                        disabled={disabled}
                        aria-invalid={!!error}
                        aria-describedby={error ? errorId : undefined}
                        className={`form-checkbox h-5 w-5 text-primary-600 rounded ${
                            error ? 'border-form-error' : 'border-secondary-200'
                        } ${!disabled ? 'focus:ring-primary-500' : ''} ${
                            disabled ? 'bg-secondary-50 cursor-not-allowed opacity-60' : ''
                        }`}
                    />
                </div>
            ) : isSelect ? (
                <select
                    id={name}
                    ref={ref as ForwardedRef<HTMLSelectElement>}
                    name={name}
                    value={value === undefined || value === null ? '' : String(value)}
                    onChange={handleInputChange}
                    disabled={disabled}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    className={`border rounded-md px-3 py-2 text-base text-secondary-800 bg-background w-full transition-colors duration-300 ease-in-out ${
                        error ? 'border-form-error' : 'border-secondary-200'
                    } ${!disabled ? 'focus:ring-2 focus:ring-primary-500 focus:border-primary-500' : ''} ${
                        disabled ? 'bg-secondary-50 cursor-not-allowed opacity-60' : ''
                    }`}
                >
                    <option value="">-- Выберите категорию --</option>
                    {options && options.map((option) => (
                        <option key={String(option.value)} value={String(option.value)}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    id={name}
                    ref={ref as ForwardedRef<HTMLInputElement>}
                    type={type}
                    name={name}
                    value={value === undefined || value === null ? '' : String(value)}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    required={required}
                    className={`border rounded-md px-3 py-2 text-base text-secondary-800 bg-background w-full transition-colors duration-300 ease-in-out ${
                        error ? 'border-form-error' : 'border-secondary-200'
                    } ${!disabled ? 'focus:ring-2 focus:ring-primary-500 focus:border-primary-500' : ''} ${
                        disabled ? 'bg-secondary-50 cursor-not-allowed opacity-60' : ''
                    }`}
                />
            )}

            <div className="h-[20px] overflow-hidden">
                <Text variant="formError" id={errorId} className={error ? 'error-visible' : 'error-hidden'}>
                    {error || ''}
                </Text>
            </div>
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
