import { useState } from 'react';
import Text from '../components/ui/Text';
import Input from '../components/ui/Input';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        login: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({
        login: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' }); // Сбрасываем ошибку при изменении
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {
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
            // Заглушка для API
            console.log('Отправка на /signup:', {
                login: formData.login,
                password: formData.password,
            });
            // TODO: Реальная отправка fetch на /signup
        }
    };

    return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
            <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
                <Text variant="h2" className="mb-6 text-center">
                    Регистрация
                </Text>
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
                        disabled={Object.values(errors).some((error) => error)}
                    >
                        Зарегистрироваться
                    </button>
                </form>
            </div>
        </div>
    );
}