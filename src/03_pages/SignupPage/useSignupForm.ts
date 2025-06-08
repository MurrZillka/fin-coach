// src/03_pages/SignupPage/useSignupForm.ts
import { useState } from 'react';

interface SignupFormData {
    user_name: string;
    login: string;
    password: string;
    confirmPassword: string;
}

interface SignupFormErrors {
    user_name: string;
    login: string;
    password: string;
    confirmPassword: string;
}

interface UseSignupFormReturn {
    formData: SignupFormData;
    errors: SignupFormErrors;
    handleChange: (name: keyof SignupFormData, value: string) => void;
    validateForm: () => boolean;
    clearErrors: () => void;
}

export const useSignupForm = (): UseSignupFormReturn => {
    const [formData, setFormData] = useState<SignupFormData>({
        user_name: '',
        login: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<SignupFormErrors>({
        user_name: '',
        login: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (name: keyof SignupFormData, value: string): void => {
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = (): boolean => {
        const newErrors: SignupFormErrors = {
            user_name: formData.user_name.length < 3 ? 'Имя пользователя: минимум 3 символа' : '',
            login: formData.login.length < 5 ? 'Логин: минимум 5 символов' : '',
            password: formData.password.length < 5 ? 'Пароль: минимум 5 символов' : '',
            confirmPassword: formData.confirmPassword.length < 5 ? 'Пароль: минимум 5 символов' : '',
        };

        if (
            formData.password.length >= 5 &&
            formData.confirmPassword.length >= 5 &&
            formData.password !== formData.confirmPassword
        ) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

    const clearErrors = (): void => {
        setErrors({
            user_name: '',
            login: '',
            password: '',
            confirmPassword: '',
        });
    };

    return {
        formData,
        errors,
        handleChange,
        validateForm,
        clearErrors,
    };
};
