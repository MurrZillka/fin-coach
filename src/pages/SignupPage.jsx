import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Text from '../components/ui/Text';
import Input from '../components/ui/Input';
import useAuthStore from '../stores/authStore';

export default function SignupPage() {
    const navigate = useNavigate();

    // Получаем состояние и методы из Zustand-стора вместо Redux
    const { status, error, signup } = useAuthStore();

    const [signupSuccess, setSignupSuccess] = useState(false);
    const [localError, setLocalError] = useState(null);

    const [formData, setFormData] = useState({
        user_name: '',
        login: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({
        user_name: '',
        login: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' }); // Сбрасываем ошибку при изменении

        if (localError) setLocalError(null); // Сбрасываем локальную ошибку
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {
            user_name: formData.user_name.length < 3 ? 'Минимум 3 символа' : '',
            login: formData.login.length < 5 ? 'Минимум 5 символов' : '',
            password: formData.password.length < 5 ? 'Минимум 5 символов' : '',
            confirmPassword: formData.confirmPassword.length < 5 ? 'Минимум 5 символов' : '',
        };

        // Проверяем совпадение паролей, если длина корректна
        if (
            formData.password.length >= 5 &&
            formData.confirmPassword.length >= 5 &&
            formData.password !== formData.confirmPassword
        ) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }

        setErrors(newErrors);

        const hasErrors = Object.values(newErrors).some((error) => error);
        if (!hasErrors) {
            try {
                // Отправляем данные через Zustand вместо Redux
                await signup({
                    user_name: formData.user_name,
                    login: formData.login,
                    password: formData.password,
                });

                // Устанавливаем флаг успешной регистрации
                setSignupSuccess(true);

                // Перенаправляем на страницу логина через 2 секунды
                setTimeout(() => {
                    navigate('/login', {
                        state: {
                            fromSignup: true,
                            login: formData.login
                        }
                    });
                }, 2000);
            } catch (err) {
                // При ошибке показываем сообщение
                console.error('Ошибка регистрации:', err);

                if (err.status === 409) {
                    // Если ошибка 409, пользователь с таким логином уже существует
                    setLocalError({
                        message: 'Извините, пользователь с таким логином уже существует.'
                    });

                    // Также устанавливаем ошибку в поле логина
                    setErrors({
                        ...errors,
                        login: 'Извините, такой логин занят'
                    });
                } else {
                    // Любая другая ошибка
                    setLocalError({
                        message: 'Извините, ошибка на сервере. Повторите попытку позже.'
                    });
                }
            }
        }
    };

    // Определяем, какую ошибку показать: локальную или из Zustand-стора
    const displayError = localError || error;

    return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
            <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
                <Text variant="h2" className="mb-6 text-center">
                    Регистрация
                </Text>

                {displayError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {displayError.message}
                    </div>
                )}

                {signupSuccess && (
                    <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
                        Регистрация успешно завершена! Перенаправление на страницу входа...
                    </div>
                )}

                {!signupSuccess && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Имя пользователя"
                            name="user_name"
                            value={formData.user_name}
                            onChange={handleChange}
                            error={errors.user_name}
                            placeholder="Введите имя пользователя"
                        />
                        <Input
                            label="Логин"
                            name="login"
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
                                <a href="/login" className="text-primary-600 hover:underline">
                                    Войти
                                </a>
                            </Text>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}