// src/pages/SignupPage.jsx
import {useEffect, useRef, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import Text from '../04_components/ui/Text';
import Input from '../04_components/ui/Input';
import useAuthStore from '../02_stores/authStore/authStore.ts';

export default function SignupPage() {
    const navigate = useNavigate();

    const {status, signup, error} = useAuthStore();
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [formData, setFormData] = useState({
        user_name: '',
        login: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({ // Ошибки валидации формы
        user_name: '',
        login: '',
        password: '',
        confirmPassword: '',
    });

    const userNameInputRef = useRef(null);

    useEffect(() => {
        userNameInputRef.current?.focus();
    }, [])

    const handleChange = (name, value) => { // --- ИЗМЕНЕНА СИГНАТУРА ---
        setFormData({...formData, [name]: value});
        setErrors({...errors, [name]: ''}); // Сбрасываем ошибку валидации для этого поля
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (error) {
            useAuthStore.getState().clearError();
        }

        const newErrors = {
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
        setErrors(newErrors); // Устанавливаем ошибки валидации

        const hasErrors = Object.values(newErrors).some((error) => error);

        if (!hasErrors) {
            try {
                await signup({
                    user_name: formData.user_name,
                    login: formData.login,
                    password: formData.password,
                });

                // Успех - показываем сообщение и перенаправляем
                setSignupSuccess(true);
                setTimeout(() => {
                    navigate('/login', {
                        state: {
                            fromSignup: true,
                            login: formData.login
                        }
                    });
                }, 2000);
            } catch (error) {
                console.error(error)
                // Ошибка обработана в сторе, ничего не делаем
            }
        }
    };

    return (
        <div className=" bg-secondary-50 flex items-center justify-center">
            <div style={{backgroundColor: `rgb(var(--color-background))`}}
                 className="p-6 rounded-lg shadow-2xl w-full max-w-md mb-[15vh] mt-[10vh]">
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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Поля формы и кнопка Регистрация */}
                        <Input
                            label="Имя пользователя"
                            name="user_name"
                            type="text" // Указал явно тип
                            value={formData.user_name}
                            onChange={handleChange} //
                            error={errors.user_name}
                            placeholder="Введите имя пользователя"
                        />
                        <Input
                            label="Логин"
                            name="login"
                            type="text" // Указал явно тип
                            value={formData.login}
                            onChange={handleChange} // <-- Input вызовет ее с (name, value)
                            error={errors.login}
                            placeholder="Введите логин (минимум 5 символов)"
                        />
                        <Input
                            label="Пароль"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange} // <-- Input вызовет ее с (name, value)
                            error={errors.password}
                            placeholder="Введите пароль (минимум 5 символов)"
                        />
                        <Input
                            label="Подтвердите пароль"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange} // <-- Input вызовет ее с (name, value)
                            error={errors.confirmPassword}
                            placeholder="Повторите пароль"
                        />
                        <button
                            type="submit"
                            className="w-full bg-primary-500 text-background font-medium py-2 px-4 rounded-md hover:bg-primary-600 disabled:bg-secondary-500 disabled:cursor-not-allowed"
                            disabled={status === 'loading'} // Отключаем кнопку во время загрузки
                        >
                            {status === 'loading' ? 'Регистрация...' : 'Зарегистрироваться'} {/* Текст кнопки меняется */}
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
}