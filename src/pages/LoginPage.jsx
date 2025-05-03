import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Text from '../components/ui/Text';
import Input from '../components/ui/Input';
import useAuthStore from '../stores/authStore';
import Modal from "../components/ui/Modal.jsx";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login: storeLogin, status, error } = useAuthStore();

    const [formData, setFormData] = useState({
        login: '',
        password: '',
    });
    const [errors, setErrors] = useState({
        login: '',
        password: '',
    });
    const [localError, setLocalError] = useState(null);

    // Если пользователь перешел со страницы регистрации, заполняем поле логина
    useEffect(() => {
        if (location.state?.fromSignup && location.state?.login) {
            setFormData(prev => ({
                ...prev,
                login: location.state.login
            }));
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });

        // Сбрасываем ошибку при изменении формы
        if (localError) setLocalError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Проверяем, что поля не пустые
        const newErrors = {
            login: formData.login ? '' : 'Логин обязателен',
            password: formData.password ? '' : 'Пароль обязателен',
        };

        setErrors(newErrors);

        // Если нет ошибок в форме, отправляем запрос
        if (!newErrors.login && !newErrors.password) {
            try {
                await storeLogin(formData);

                // При успешном входе перенаправляем на главную страницу
                navigate('/main');
            } catch (err) {
                console.error('Ошибка входа:', err);

                if (err.status === 403) {
                    // Если ошибка 403 - неверный логин или пароль
                    setLocalError({
                        message: 'Неверный логин или пароль. Пожалуйста, проверьте введенные данные.'
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
                    Вход в аккаунт
                </Text>

                {displayError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {displayError.message}
                    </div>
                )}

                {location.state?.fromSignup && (
                    <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
                        Регистрация успешно завершена! Пожалуйста, войдите в свой аккаунт.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Логин"
                        name="login"
                        value={formData.login}
                        onChange={handleChange}
                        error={errors.login}
                        placeholder="Введите ваш логин"
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
                    <button
                        type="submit"
                        className="w-full bg-primary-500 text-background font-medium py-2 px-4 rounded-md hover:bg-primary-600 disabled:bg-secondary-500 disabled:cursor-not-allowed"
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? 'Вход...' : 'Войти'}
                    </button>

                    <div className="text-center mt-4">
                        <Text variant="body" className="text-secondary-600">
                            Нет аккаунта?{' '}
                            <a href="/signup" className="text-primary-600 hover:underline">
                                Зарегистрироваться
                            </a>
                        </Text>
                    </div>
                </form>
            </div>
        </div>
    );
}