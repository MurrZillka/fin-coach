// src/pages/LoginPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Text from '../components/ui/Text';
import Input from '../components/ui/Input';
import useAuthStore from '../stores/authStore';
// import Modal from "../components/ui/Modal.jsx"; // Закомментировано, если не нужен здесь

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    // Из стора берем только storeLogin и status.
    const { login: storeLogin, status} = useAuthStore();

    // --- СОСТОЯНИЕ ФОРМЫ И ОШИБОК ---
    const [formData, setFormData] = useState({
        login: '',
        password: '',
    });
    const [errors, setErrors] = useState({ // Ошибки валидации формы
        login: '',
        password: '',
    });
    // Локальное состояние для отображения ошибки API/логина
    const [localError, setLocalError] = useState(null);
    // --- Конец СОСТОЯНИЯ ФОРМЫ И ОШИБОК ---


    // Если пользователь перешел со страницы регистрации, заполняем поле логина
    useEffect(() => {
        if (location.state?.fromSignup && location.state?.login) {
            setFormData(prev => ({
                ...prev,
                login: location.state.login
            }));
        }
    }, [location.state]);


    // Обработчик изменения полей формы
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });

        // Сбрасываем локальную ошибку API при изменении формы
        if (localError) setLocalError(null);
    };

    // Обработчик отправки формы логина
    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- ВАЛИДАЦИЯ ФОРМЫ ---
        const newErrors = {
            login: formData.login ? '' : 'Логин обязателен',
            password: formData.password ? '' : 'Пароль обязателен',
        };
        setErrors(newErrors);


        // Перед вызовом API также сбрасываем локальную ошибку
        setLocalError(null);


        // Если нет ошибок валидации формы, отправляем запрос логина
        if (!newErrors.login && !newErrors.password) {
            try {
                // storeLogin теперь выбросит ошибку, если API вернуло ошибку или произошла непредвиденная ошибка
                await storeLogin(formData);

                // При успешном входе (если storeLogin не выбросил ошибку) перенаправляем на главную страницу
                navigate('/main');
            } catch (err) {
                // Перехватываем ошибку, выброшенную стором
                console.error('Ошибка входа (перехвачена в LoginPage):', err); // Логируем перехваченную ошибку

                // --- Определение пользовательского сообщения об ошибке ТОЛЬКО ЗДЕСЬ ---
                // Анализируем структуру ошибки, которую выбросил стор
                const errorStatus = err.status || err.error?.status;
                const errorMessage = err.message || err.error?.message || 'Произошла неизвестная ошибка';

                if (errorStatus === 403) {
                    setLocalError({
                        message: 'Неверный логин или пароль. Пожалуйста, проверьте введенные данные.'
                    });
                } else {
                    setLocalError({
                        message: `Ошибка входа: ${errorMessage}. Пожалуйста, повторите попытку позже.`
                    });
                }
            }
        }
    };

    // --- Отображаем ТОЛЬКО локальную ошибку API/логина ---
    const displayError = localError;
    // --- Конец Отображения ошибки ---


    return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
            <div style={{ backgroundColor: `rgb(var(--color-background))` }} className="p-6 rounded-lg shadow-lg w-full max-w-md">
                <Text variant="h2" className="mb-6 text-center">
                    Вход в аккаунт
                </Text>

                {/* Блок для отображения ошибки теперь использует только displayError (локальное состояние) */}
                {displayError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {displayError.message}
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
                        onChange={handleChange}
                        error={errors.login}
                        placeholder="Введите ваш логин"
                    />
                    {/* Поле Пароль */}
                    <Input
                        label="Пароль"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
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
                            {/* Используем Link из react-router-dom, если он настроен */}
                            {/* <Link to="/signup" className="text-primary-600 hover:underline"> */}
                            <a href="/signup" className="text-primary-600 hover:underline">
                                Зарегистрироваться
                            </a>
                            {/* </Link> */}
                        </Text>
                    </div>
                </form>
            </div>
            {/* Если модал Modal нужен на странице логина, его нужно здесь рендерить */}
            {/* {isModalOpen && <Modal ... />} */}
        </div>
    );
}