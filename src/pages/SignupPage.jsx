// src/pages/SignupPage.jsx
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Text from '../components/ui/Text';
import Input from '../components/ui/Input';
// Импортируем обновленный useAuthStore
import useAuthStore from '../stores/authStore';

export default function SignupPage() {
    const navigate = useNavigate();

    // Из стора берем только status и signup. Ошибку для отображения на этой странице
    // будем хранить локально.
    const {status, signup} = useAuthStore(); // Убрали error из деструктуризации

    const [signupSuccess, setSignupSuccess] = useState(false);
    // Локальное состояние для отображения ошибки API/регистрации
    const [localError, setLocalError] = useState(null);

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

    // --- ИЗМЕНЕНИЕ: Обработчик изменения полей формы теперь принимает name и value ---
    const handleChange = (name, value) => { // --- ИЗМЕНЕНА СИГНАТУРА ---
        // --- ИЗМЕНЕНИЕ: Удалена деструктуризация e.target, т.к. name и value приходят аргументами ---
        // const {name, value} = e.target; // ЭТО УДАЛЕНО

        // Остальной код функции остается таким же, используя переданные name и value
        setFormData({...formData, [name]: value});
        setErrors({...errors, [name]: ''}); // Сбрасываем ошибку валидации для этого поля

        // Сбрасываем локальную ошибку API при изменении формы
        if (localError) setLocalError(null);
    };
    // --- Конец ИЗМЕНЕНИЯ ---


    const handleSubmit = async (e) => {
        e.preventDefault();
        // --- ВАЛИДАЦИЯ ФОРМЫ ---
        const newErrors = {
            user_name: formData.user_name.length < 3 ? 'Имя пользователя: минимум 3 символа' : '',
            login: formData.login.length < 5 ? 'Логин: минимум 5 символов' : '',
            password: formData.password.length < 5 ? 'Пароль: минимум 5 символов' : '',
            confirmPassword: formData.confirmPassword.length < 5 ? 'Пароль: минимум 5 символов' : '',
        };

        // Проверяем совпадение паролей, если длина корректна
        if (
            formData.password.length >= 5 &&
            formData.confirmPassword.length >= 5 &&
            formData.password !== formData.confirmPassword
        ) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }

        setErrors(newErrors); // Устанавливаем ошибки валидации


        const hasErrors = Object.values(newErrors).some((error) => error);
        // Перед вызовом API также сбрасываем локальную ошибку
        setLocalError(null); // Сбрасываем перед новой попыткой регистрации


        if (!hasErrors) {
            try {
                // signup теперь выбросит ошибку, если API вернуло ошибку или произошла непредвиденная ошибка
                await signup({
                    user_name: formData.user_name,
                    login: formData.login,
                    password: formData.password,
                });

                // Если вызов API успешен (не выбросил ошибку)
                setSignupSuccess(true); // Устанавливаем флаг успешной регистрации

                // Перенаправляем на страницу логина через 2 секунды
                setTimeout(() => {
                    navigate('/login', {
                        state: {
                            fromSignup: true,
                            login: formData.login // Передаем логин в state
                        }
                    });
                }, 2000);
                // Здесь нет необходимости устанавливать localError(null) при успехе,
                // так как страница перенаправится.
            } catch (err) {
                // Перехватываем ошибку, выброшенную стором
                console.error('Ошибка регистрации (перехвачена в SignupPage):', err); // Логируем перехваченную ошибку

                // --- Определение пользовательского сообщения об ошибке ТОЛЬКО ЗДЕСЬ ---
                // Анализируем структуру ошибки, которую выбросил стор
                const errorStatus = err.status || err.error?.status;
                const errorMessage = err.message || err.error?.message || 'Произошла неизвестная ошибка';

                if (errorStatus === 409) {
                    // Если ошибка 409, пользователь с таким логином уже существует
                    setLocalError({
                        message: 'Извините, пользователь с таким логином уже существует.'
                    });

                    // Также устанавливаем ошибку валидации для поля логина, если это нужно
                    setErrors(prev => ({
                        ...prev,
                        login: 'Извините, такой логин занят'
                    }));

                } else {
                    // Любая другая ошибка (сеть, серверная ошибка и т.д.)
                    setLocalError({
                        message: `Ошибка связи или сервера: ${errorMessage}. Пожалуйста, повторите попытку позже.`
                    });
                }
                // Ошибка уже установлена в localError, и компонент ее отобразит
            }
        }
    };

    // --- Отображаем ТОЛЬКО локальную ошибку API/регистрации ---
    // Ошибка стора (store.error) может использоваться в других местах приложения,
    // но для формы регистрации используем localError.
    const displayError = localError; // Убрали || error;
    // --- Конец Отображения ошибки ---


    return (
        <div className=" bg-secondary-50 flex items-center justify-center">
            <div style={{backgroundColor: `rgb(var(--color-background))`}}
                 className="p-6 rounded-lg shadow-lg w-full max-w-md mt-[10vh]">
                <Text variant="h2" className="mb-6 text-center">
                    Регистрация
                </Text>

                {/* --- ИЗМЕНЕННЫЙ БЛОК ДЛЯ ОТОБРАЖЕНИЯ ОШИБКИ --- */}
                {/* Всегда рендерим div, но управляем его классами для плавного появления/исчезновения */}
                <div
                    className={`mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md overflow-hidden ${displayError ? 'error-visible' : 'error-hidden'}`}>
                    {/* Отображаем текст ошибки только если она есть, чтобы div не занимал место, если его стили transition не учитывают height/margin */}
                    {displayError && displayError.message}
                </div>
                {/* --- Конец ИЗМЕНЕННОГО БЛОКА --- */}


                {/* Сообщение об успешной регистрации */}
                {/* Для плавного исчезновения этого блока тоже можно использовать классы visible/hidden,
                    но setTimeout с перенаправлением делает это менее критичным */}
                {signupSuccess && (
                    <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
                        Регистрация успешно завершена! Перенаправление на страницу входа...
                    </div>
                )}

                {/* Форма регистрации отображается только до успешной регистрации */}
                {!signupSuccess && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Поля формы и кнопка Регистрация */}
                        <Input
                            label="Имя пользователя"
                            name="user_name"
                            type="text" // Указал явно тип
                            value={formData.user_name}
                            onChange={handleChange} // <-- Input вызовет ее с (name, value)
                            error={errors.user_name}
                            placeholder="Введите имя пользователя"
                            // errorClass={errors.user_name ? 'error-visible' : 'error-hidden'} // Если Input принимает этот проп
                        />
                        <Input
                            label="Логин"
                            name="login"
                            type="text" // Указал явно тип
                            value={formData.login}
                            onChange={handleChange} // <-- Input вызовет ее с (name, value)
                            error={errors.login}
                            placeholder="Введите логин (минимум 5 символов)"
                            // errorClass={errors.login ? 'error-visible' : 'error-hidden'} // Если Input принимает этот проп
                        />
                        <Input
                            label="Пароль"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange} // <-- Input вызовет ее с (name, value)
                            error={errors.password}
                            placeholder="Введите пароль (минимум 5 символов)"
                            // errorClass={errors.password ? 'error-visible' : 'error-hidden'} // Если Input принимает этот проп
                        />
                        <Input
                            label="Подтвердите пароль"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange} // <-- Input вызовет ее с (name, value)
                            error={errors.confirmPassword}
                            placeholder="Повторите пароль"
                            // errorClass={errors.confirmPassword ? 'error-visible' : 'error-hidden'} // Если Input принимает этот проп
                        />
                        <button
                            type="submit"
                            className="w-full bg-primary-500 text-background font-medium py-2 px-4 rounded-md hover:bg-primary-600 disabled:bg-secondary-500 disabled:cursor-not-allowed"
                            disabled={status === 'loading'} // Отключаем кнопку во время загрузки
                        >
                            {status === 'loading' ? 'Регистрация...' : 'Зарегистрироваться'} {/* Текст кнопки меняется */}
                        </button>

                        {/* Ссылка на страницу входа */}
                        <div className="text-center mt-4">
                            <Text variant="body" className="text-secondary-600">
                                Уже есть аккаунт?{' '}
                                {/* Используем Link из react-router-dom, если он настроен */}
                                {/* <Link to="/login" className="text-primary-600 hover:underline"> */}
                                <a href="/login" className="text-primary-600 hover:underline">
                                    Войти
                                </a>
                                {/* </Link> */}
                            </Text>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}