// src/components/BalanceWidget.jsx
import React from 'react';
// Убедись, что путь к useBalanceStore корректный
import useBalanceStore from '../stores/balanceStore'; // Импортируем стор баланса
// Убедись, что путь к Text корректный относительно этой папки components
import Text from './ui/Text'; // Импортируем компонент Text (BalanceWidget.jsx в src/components, Text.jsx в src/components/ui)


export default function BalanceWidget() {
    // Читаем состояние balance, isLoading и error из стора баланса
    const { balance, isLoading, error } = useBalanceStore();

    // --- Форматирование баланса ---
    // Форматируем абсолютное значение (без знака) до 2 знаков после запятой и разделитель тысяч
    const formattedBalanceValue = typeof balance === 'number'
        ? Math.abs(balance).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
        : null;

    // --- Определение класса цвета для баланса ---
    // Цвет зависит от знака баланса, только когда данные успешно загружены и не null
    const balanceTextColorClass = balance !== null && !isLoading && !error
        ? (balance >= 0 ? 'text-success-600' : 'text-error-600') // Зеленый для >= 0, красный для < 0
        : 'text-secondary-600'; // Цвет по умолчанию для "Загрузка", "Ошибка", "--.--"

    // --- Конец Форматирования и Цвета ---

    return (
        // Главный контейнер виджета - прямоугольник
        <div className="bg-white p-4 rounded-md shadow-md">
            {/* Контейнер для разделения на левую (Баланс) и правую (Цель) части */}
            {/* justify-between: элементы по краям, items-center: выравнивание по центру по вертикали */}
            <div className="flex justify-between items-center ">

                {/* --- Левая часть: Отображение Баланса --- */}
                {/* Контейнер для надписи "Ваш баланс:" и самого значения/статуса */}
                {/* flex: чтобы элементы были в строку, items-baseline: выравнивание по базовой линии текста */}
                <div className="flex items-baseline">
                    {/* Надпись "Ваш баланс:" */}
                    {/* mr-2: правый отступ от надписи до значения */}
                    <Text variant="body" className="text-secondary-600 mr-2">Ваш баланс:</Text>

                    {/* --- Динамическое содержимое: Загрузка, Ошибка, Значение Баланса, или Плейсхолдер --- */}
                    {isLoading && (
                        // Если идет загрузка: Крупный, жирный текст
                        <Text className="text-2xl font-bold text-primary-700">Загрузка...</Text>
                    )}

                    {error && (
                        // Если есть ошибка: Крупный, жирный текст с цветом ошибки
                        <Text className="text-2xl font-bold text-error-500">
                            Ошибка
                        </Text>
                    )}

                    {/* Если не загрузка, нет ошибки, и баланс успешно загружен (значение не null) */}
                    {!isLoading && !error && balance !== null && (
                        // Крупное, жирное значение баланса с динамическим цветом
                        // Используем balanceTextColorClass для цвета
                        <Text className={`text-2xl font-bold ${balanceTextColorClass}`}>
                            {/* Добавляем знак "-" если баланс отрицательный */}
                            {balance < 0 && '-'}
                            {formattedBalanceValue} {/* Форматированное значение без знака */}
                            {' ₽'} {/* Символ валюты */}
                        </Text>
                    )}

                    {/* Если не загрузка, нет ошибки, но баланс еще не загружен или сброшен (значение null) */}
                    {!isLoading && !error && balance === null && (
                        // Крупный, жирный плейсхолдер
                        <Text className="text-2xl font-bold text-secondary-600">
                            --.-- ₽
                        </Text>
                    )}
                    {/* --- Конец Динамического содержимого --- */}
                </div>
                {/* --- Конец Левой части --- */}


                {/* --- Правая часть: Место для Финансовой цели (пока плейсхолдер) --- */}
                {/* flex-shrink-0: не сжимается, w-1/3: пример ширины, text-right: текст справа */}
                {/* Можешь настроить ширину (w-...) или другие стили этой части */}
                <div className="flex-shrink-0 w-1/3 text-right">
                    {/* Плейсхолдер текст */}
                    <Text variant="body" className="text-secondary-600 italic">
                        Место для информации о цели.
                    </Text>
                </div>
                {/* --- Конец Правой части --- */}
            </div>

            {/* Опционально: Показать подробности ошибки мелким текстом под основным блоком */}
            {error && error.message && (
                <Text variant="body" className="text-error-500 mt-2">
                    Подробно: {error.message}
                </Text>
            )}
        </div>
    );
}