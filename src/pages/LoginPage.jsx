import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import Text from '../components/ui/Text';
import Input from '../components/ui/Input';
import { login, clearError } from '../store/authSlice';

export default function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { status, error, isAuthenticated } = useSelector((state) => state.auth);

    // Проверка наличия данных от страницы регистрации
    const fromSignup = location.state?.fromSignup;
    const prefilledLogin = location.state?.login || '';

    const [formData, setFormData] = useState({
        login: prefilledLogin,
        password: '',
    });

    const [errors, setErrors] = useState({
        login: '',
        password: '',
    });

    // Очищаем ошибки Redux при монтировании
    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    // Редирект, если пользователь уже авторизован
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/main');
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Валидация формы
        const newErrors = {
            login: formData.login.length < 3 ? 'Минимум 3 символа' : '',
            password: formData.password.length < 5 ? 'Минимум 5 символов' : '',
        };

        setErrors(newErrors);

        const hasErrors = Object.values(newErrors).some((error) => error);
        if (!hasErrors) {
            try {
                // Отправляем данные через Redux thunk
                const result = await dispatch(login({
                    login: formData.login,
                    password: formData.password,
                })).unwrap();

                // Сохраняем имя пользователя в localStorage для использования в хедере
                if (result && result.userName) {
                    localStorage.setItem('userName', result.userName);
                }

                // При успешном входе navigate не нужен - его выполнит useEffect
            } catch (err) {
                console.error('Ошибка входа:', err);
            }
        }
    };

    return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
            <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
                <Text variant="h2" className="mb-6 text-center">
                    Вход в систему
                </Text>

                {fromSignup && (
                    <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
                        Регистрация прошла успешно! Теперь вы можете войти в систему.
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-form-error bg-opacity-10 text-form-error rounded-md">
                        {error.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Логин"
                        name="login"
                        value={formData.login}
                        onChange={handleChange}
                        error={errors.login}
                        placeholder="Введите логин"
                    />
                    <Input
                        label="Пароль"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        placeholder="Введите пароль"
                    />
                    <button
                        type="submit"
                        className="w-full bg-primary-500 text-background font-medium py-2 px-4 rounded-md hover:bg-primary-600 disabled:bg-secondary-500 disabled:cursor-not-allowed"
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? 'Выполняется вход...' : 'Войти'}
                    </button>

                    <div className="text-center mt-4">
                        <Text variant="body" className="text-secondary-600">
                            Ещё нет аккаунта?{' '}
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