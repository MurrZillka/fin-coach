// src/pages/LoginPage.jsx
import {useState, useEffect, useRef} from 'react';
import {useNavigate, useLocation, Link} from 'react-router-dom';
import Text from '../04_components/ui/Text.js';
import Input from '../04_components/ui/Input.js';
import useAuthStore from '../02_stores/authStore/authStore.ts';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const {login: storeLogin, status, error} = useAuthStore();
    const loginInputRef = useRef(null);

    // --- СОСТОЯНИЕ ФОРМЫ И ОШИБОК ---
    const [formData, setFormData] = useState({
        login: '',
        password: '',
    });
    const [errors, setErrors] = useState({ // Ошибки валидации формы
        login: '',
        password: '',
    });

    useEffect(() => {
        loginInputRef.current?.focus();
    }, []);

    // Если пользователь перешел со страницы регистрации, заполняем поле логина
    useEffect(() => {
        if (location.state?.fromSignup && location.state?.login) {
            setFormData(prev => ({
                ...prev,
                login: location.state.login
            }));
        }
    }, [location.state]);

    const handleChange = (name, value) => {
        setFormData({...formData, [name]: value});
        setErrors({...errors, [name]: ''});

    }
// Обработчик отправки формы логина
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (error) {
            useAuthStore.getState().clearError();
        }

        const newErrors = {
            login: formData.login ? '' : 'Логин обязателен',
            password: formData.password ? '' : 'Пароль обязателен',
        };
        setErrors(newErrors);

        if (!newErrors.login && !newErrors.password) {
            await storeLogin(formData);
            // Навигация только при успешном статусе
            if (useAuthStore.getState().status === 'succeeded') {
                navigate('/main');
            }
        }
    };
    return (
        <div className="bg-secondary-50 flex items-center justify-center">
            <div style={{backgroundColor: `rgb(var(--color-background))`}}
                 className="p-6 rounded-lg shadow-2xl w-full max-w-md mb-[15vh] mt-[15vh]">
                <Text variant="h2" className="mb-6 text-center">
                    Вход в аккаунт
                </Text>
                {error && (
                    <div
                        className={`mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md overflow-hidden ${error ? 'error-visible' : 'error-hidden'}`}>
                        {/* Добавляем условное отображение текста внутри, чтобы не было видно сообщения в скрытом состоянии,
       или чтобы текст рендерился только при наличии ошибки */}
                        {error.message}
                    </div>
                )}

                {/* Сообщение об успешной регистрации, если пришел state */}
                {location.state?.fromSignup && (
                    <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
                        Регистрация успешно завершена! Пожалуйста, войдите в свой аккаунт.
                    </div>
                )}

                {/* Форма входа */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Поле Логин */}
                    <Input
                        label="Логин"
                        name="login"
                        type="text"
                        value={formData.login}
                        onChange={handleChange} // <-- Теперь Input вызывает ее с (name, value)
                        error={errors.login}
                        placeholder="Введите ваш логин"
                        ref={loginInputRef}
                    />
                    {/* Поле Пароль */}
                    <Input
                        label="Пароль"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange} // <-- Теперь Input вызывает ее с (name, value)
                        error={errors.password}
                        placeholder="Введите ваш пароль"
                    />
                    {/* Кнопка Войти */}
                    <button
                        type="submit"
                        className="w-full bg-primary-500 text-background font-medium py-2 px-4 rounded-md hover:bg-primary-600 disabled:bg-secondary-500 disabled:cursor-not-allowed"
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? 'Вход...' : 'Войти'}
                    </button>

                    {/* Ссылка на страницу регистрации */}
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
}