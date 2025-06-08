import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Text from '../../04_components/ui/Text';
import Input from '../../04_components/ui/Input';
import Notification from './Notification';
import SubmitButton from './SubmitButton';
import useAuthStore from '../../02_stores/authStore/authStore';
import { useLoginForm } from './useLoginForm';

interface LocationState {
    fromSignup?: boolean;
    login?: string;
}

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login: storeLogin, status, error } = useAuthStore();
    const loginInputRef = useRef<HTMLInputElement>(null);

    const {
        formData,
        errors,
        handleChange,
        validateForm,
        setLoginValue
    } = useLoginForm();

    useEffect(() => {
        loginInputRef.current?.focus();
    }, []);

    useEffect(() => {
        const state = location.state as LocationState;
        if (state?.fromSignup && state?.login) {
            setLoginValue(state.login);
        }
    }, [location.state, setLoginValue]);

    useEffect(() => {
        if (status === 'succeeded') {
            navigate('/main');
        }
    }, [status, navigate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (error) {
            useAuthStore.getState().clearError();
        }

        if (validateForm()) {
            await storeLogin(formData);
        }
    };

    const state = location.state as LocationState;

    return (
        <div className="bg-secondary-50 flex items-center justify-center">
            <div
                style={{ backgroundColor: `rgb(var(--color-background))` }}
                className="p-6 rounded-lg shadow-2xl w-full max-w-md mb-[15vh] mt-[15vh]"
            >
                <Text variant="h2" className="mb-6 text-center">
                    Вход в аккаунт
                </Text>

                {error && (
                    <Notification
                        type="error"
                        message={error.message}
                    />
                )}

                {state?.fromSignup && (
                    <Notification
                        type="success"
                        message="Регистрация успешно завершена! Пожалуйста, войдите в свой аккаунт."
                    />
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Логин"
                        name="login"
                        type="text"
                        value={formData.login}
                        onChange={handleChange}
                        error={errors.login}
                        placeholder="Введите ваш логин"
                        ref={loginInputRef}
                    />

                    <Input
                        label="Пароль"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        placeholder="Введите ваш пароль"
                    />

                    <SubmitButton
                        isLoading={status === 'loading'}
                        loadingText="Вход..."
                    >
                        Войти
                    </SubmitButton>

                    <div className="text-center mt-4">
                        <Text variant="body" className="text-secondary-600">
                            Нет аккаунта?{' '}
                            <Link to="/signup" className="text-primary-600 hover:underline">
                                Зарегистрироваться
                            </Link>
                        </Text>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
