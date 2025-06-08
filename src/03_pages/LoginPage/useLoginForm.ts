import { useState } from 'react';

// Типы для формы
interface LoginFormData {
    login: string;
    password: string;
}

interface LoginFormErrors {
    login: string;
    password: string;
}

interface UseLoginFormReturn {
    formData: LoginFormData;
    errors: LoginFormErrors;
    handleChange: (name: keyof LoginFormData, value: string) => void;
    validateForm: () => boolean;
    clearErrors: () => void;
    setLoginValue: (login: string) => void;
}

export const useLoginForm = (): UseLoginFormReturn => {
    const [formData, setFormData] = useState<LoginFormData>({
        login: '',
        password: '',
    });

    const [errors, setErrors] = useState<LoginFormErrors>({
        login: '',
        password: '',
    });

    const handleChange = (name: keyof LoginFormData, value: string): void => {
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = (): boolean => {
        const newErrors: LoginFormErrors = {
            login: formData.login ? '' : 'Логин обязателен',
            password: formData.password ? '' : 'Пароль обязателен',
        };

        setErrors(newErrors);
        return !newErrors.login && !newErrors.password;
    };

    const clearErrors = (): void => {
        setErrors({ login: '', password: '' });
    };

    const setLoginValue = (login: string): void => {
        setFormData(prev => ({ ...prev, login }));
    };

    return {
        formData,
        errors,
        handleChange,
        validateForm,
        clearErrors,
        setLoginValue,
    };
};
