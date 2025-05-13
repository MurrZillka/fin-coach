// src/components/BalanceWidget.jsx
import React from 'react';
// Убедись, что путь к useBalanceStore корректный
import useBalanceStore from '../stores/balanceStore'; // Импортируем стор баланса
// Убедись, что путь к Text корректный относительно этой папки components
import Text from './ui/Text'; // Импортируем компонент Text
// --- ДОБАВЛЕНО: Импортируем новый компонент виджета прогресса цели ---
import GoalProgressWidget from './GoalProgressWidget'; // Убедись, что путь к GoalProgressWidget.jsx корректен
// --- Конец ДОБАВЛЕННОГО ---


export default function BalanceWidget() {
    // Читаем состояние balance, isLoading и error из стора баланса
    const {balance, isLoading, error} = useBalanceStore();

    // --- Форматирование баланса ---
    const formattedBalanceValue = typeof balance === 'number'
        ? balance.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})
        : null;


    // --- Определение КАСТОМНОГО класса для баланса ---
    const balanceCustomColorClass = balance !== null && !isLoading && !error
        ? (balance >= 0 ? 'balance-positive' : 'balance-negative')
        : '';


    return (
        // Главный контейнер виджета - прямоугольник
        <div className="bg-white p-4 rounded-md shadow-md">
            {/*
                Контейнер для разделения на левую (Баланс) и правую (Цель) части.
                На мобильных/планшетах (по умолчанию): flex-col, items-start, gap-4.
                На десктопах (md:): flex-row, justify-between, items-center, gap-0.
            */}
            <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mr-6 gap-4 md:gap-0">

                {/* --- Левая часть: Отображение Баланса --- */}
                {/* Контейнер для надписи "Ваш баланс:" и самого значения/статуса */}
                {/* flex: чтобы элементы были в строку, items-baseline: выравнивание по базовой линии текста */}
                {/* На мобильных: занимает всю ширину */}
                <div className="flex items-baseline w-full md:w-auto"> {/* Добавлены w-full md:w-auto */}
                    {/* Надпись "Ваш баланс:" */}
                    <Text variant="body" className="text-secondary-600 mr-2">Ваш баланс:</Text>

                    {/* --- Динамическое содержимое: Загрузка, Ошибка, Значение Баланса, или Плейсхолдер --- */}
                    {isLoading && (
                        <Text className="text-2xl font-bold text-primary-700">Загрузка...</Text>
                    )}

                    {error && (
                        <Text className="text-2xl font-bold text-red-500">
                            Ошибка
                        </Text>
                    )}

                    {/* Если не загрузка, нет ошибки, и баланс успешно загружен (значение не null) */}
                    {!isLoading && !error && balance !== null && (
                        <Text
                            className={`text-2xl ${balanceCustomColorClass}`}>
                            {formattedBalanceValue}{'\u00A0'}₽ {/* Добавлен неразрывный пробел */}
                        </Text>
                    )}

                    {/* Если не загрузка, нет ошибки, но баланс еще не загружен или сброшен (значение null) */}
                    {!isLoading && !error && balance === null && (
                        <Text className="text-2xl font-bold text-secondary-600">
                            --.-- ₽
                        </Text>
                    )}
                    {/* --- Конец Динамического содержимого --- */}
                </div>
                {/* --- Конец Левой части --- */}


                {/* --- Правая часть: Место для Финансовой цели (Виджет Прогресса) --- */}
                {/* Сам виджет */}
                {/* Его ширина и расположение будут адаптированы в его собственном компоненте */}
                <GoalProgressWidget />
                {/* --- Конец Правой части --- */}

            </div>

            {error && error.message && (
                <Text variant="body" className="text-red-500 mt-2">
                    Подробно: {error.message}
                </Text>
            )}
        </div>
    );
}