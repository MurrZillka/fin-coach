// src/components/BalanceWidget.jsx (Использует кастомные классы)
import React from 'react';
// Убедись, что путь к useBalanceStore корректный
import useBalanceStore from '../stores/balanceStore'; // Импортируем стор баланса
// Убедись, что путь к Text корректный относительно этой папки components
import Text from './ui/Text'; // Импортируем компонент Text (BalanceWidget.jsx в src/components, Text.jsx в src/components/ui)
// --- ДОБАВЛЕНО: Импортируем новый компонент виджета прогресса цели ---
import GoalProgressWidget from './GoalProgressWidget'; // Убедись, что путь к GoalProgressWidget.jsx корректен
// --- Конец ДОБАВЛЕННОГО ---


export default function BalanceWidget() {
    // Читаем состояние balance, isLoading и error из стора баланса
    const {balance, isLoading, error} = useBalanceStore();

    // --- Форматирование баланса ---
    // Используем toLocaleString для правильного форматирования чисел с разделителями и знаками после запятой
    const formattedBalanceValue = typeof balance === 'number'
        ? balance.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})
        : null;


    // --- Определение КАСТОМНОГО класса для баланса ---
    // Возвращаем имя кастомного CSS класса в зависимости от знака баланса
    const balanceCustomColorClass = balance !== null && !isLoading && !error
        ? (balance >= 0 ? 'balance-positive' : 'balance-negative') // Имена новых кастомных классов
        : ''; // Пустая строка, если баланс еще не загружен/ошибка. Базовый стиль от Text компонента.
    // --- Конец Определения КАСТОМНОГО класса ---

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
                        // Загрузка - оставляем стандартные классы
                        <Text className="text-2xl font-bold text-primary-700">Загрузка...</Text>
                    )}

                    {error && (
                        // Ошибка - оставляем стандартные классы (красный, жирный)
                        <Text className="text-2xl font-bold text-red-500">
                            Ошибка
                        </Text>
                    )}

                    {/* Если не загрузка, нет ошибки, и баланс успешно загружен (значение не null) */}
                    {!isLoading && !error && balance !== null && (
                        <Text
                            className={`text-2xl ${balanceCustomColorClass}`}> {/* Используем только размер и кастомный класс */}
                            {/* Добавляем знак "-" если баланс отрицательный */}
                            {/*{balance < 0 && '-'}*/}
                            {formattedBalanceValue} ₽ {/* Форматированное значение и символ валюты */}
                        </Text>
                    )}

                    {/* Если не загрузка, нет ошибки, но баланс еще не загружен или сброшен (значение null) */}
                    {!isLoading && !error && balance === null && (
                        // Плейсхолдер - оставляем стандартные классы
                        <Text className="text-2xl font-bold text-secondary-600">
                            --.-- ₽
                        </Text>
                    )}
                    {/* --- Конец Динамического содержимого --- */}
                </div>
                {/* --- Конец Левой части --- */}


                {/* --- Правая часть: Место для Финансовой цели (ТЕПЕРЬ НАШ НОВЫЙ ВИДЖЕТ) --- */}
                {/* Заменяем placeholder div на наш новый компонент виджета прогресса цели */}
                {/* --- ИСПРАВЛЕНО: Заменен placeholder на GoalProgressWidget --- */}
                <GoalProgressWidget />
                {/* --- Конец ИСПРАВЛЕНИЯ --- */}

            </div>

            {error && error.message && (
                // Текст ошибки - оставляем стандартные классы (красный)
                <Text variant="body" className="text-red-500 mt-2">
                    Подробно: {error.message}
                </Text>
            )}
        </div>
    );
}