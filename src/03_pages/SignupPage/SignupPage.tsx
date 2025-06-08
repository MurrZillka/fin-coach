// src/03_pages/SignupPage/SignupPage.tsx
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Text from '../../04_components/ui/Text';
import Input from '../../04_components/ui/Input';
import useAuthStore from '../../02_stores/authStore/authStore';
import { useSignupForm } from './useSignupForm';
import { useSignupSubmit } from './useSignupSubmit';

const SignupPage: React.FC = () => {
    const { status, error } = useAuthStore();
    const userNameInputRef = useRef<HTMLInputElement>(null);

    const {
        formData,
        errors,
        handleChange,
        validateForm
    } = useSignupForm();

    const { signupSuccess, handleSubmit } = useSignupSubmit();

    useEffect(() => {
        userNameInputRef.current?.focus();
    }, []);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        handleSubmit(e, formData, validateForm);
    };

    return (
        <div className="bg-secondary-50 flex items-center justify-center">
            <div
                style={{ backgroundColor: `rgb(var(--color-background))` }}
                className="p-6 rounded-lg shadow-2xl w-full max-w-md mb-[15vh] mt-[10vh]"
            >
                <Text variant="h2" className="mb-6 text-center">
                    Регистрация
                </Text>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {error.message}
                    </div>
                )}

                {signupSuccess && (
                    <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
                        Регистрация успешно завершена! Перенаправление на страницу входа...
                    </div>
                )}

                {!signupSuccess && (
                    <form onSubmit={onSubmit} className="space-y-4">
                        <Input
                            label="Имя пользователя"
                            name="user_name"
                            type="text"
                            value={formData.user_name}
                            onChange={handleChange}
                            error={errors.user_name}
                            placeholder="Введите имя пользователя"
                            ref={userNameInputRef}
                        />

                        <Input
                            label="Логин"
                            name="login"
                            type="text"
                            value={formData.login}
                            onChange={handleChange}
                            error={errors.login}
                            placeholder="Введите логин (минимум 5 символов)"
                        />

                        <Input
                            label="Пароль"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            placeholder="Введите пароль (минимум 5 символов)"
                        />

                        <Input
                            label="Подтвердите пароль"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            placeholder="Повторите пароль"
                        />

                        <button
                            type="submit"
                            className="w-full bg-primary-500 text-background font-medium py-2 px-4 rounded-md hover:bg-primary-600 disabled:bg-secondary-500 disabled:cursor-not-allowed"
                            disabled={status === 'loading'}
                        >
                            {status === 'loading' ? 'Регистрация...' : 'Зарегистрироваться'}
                        </button>

                        <div className="text-center mt-4">
                            <Text variant="body" className="text-secondary-600">
                                Уже есть аккаунт?{' '}
                                <Link to="/login" className="text-primary-600 hover:underline">
                                    Войти
                                </Link>
                            </Text>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SignupPage;
