// src/components/BalanceWidget.tsx
import React from 'react';
import useBalanceStore from '../../02_stores/balanceStore/balanceStore';
import Text from '../ui/Text';
import GoalProgressWidget from './GoalProgressWidget';

export default function BalanceWidget(): React.JSX.Element {
    // Читаем состояние balance, isLoading и error из стора баланса
    const { balance, loading, error } = useBalanceStore();

    // Форматирование баланса
    const formattedBalanceValue = typeof balance === 'number'
        ? balance.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : null;

    // Определение кастомного класса для баланса
    const balanceCustomColorClass = balance !== null && !loading && !error
        ? (balance >= 0 ? 'balance-positive' : 'balance-negative')
        : '';

    return (
        // Главный контейнер виджета - прямоугольник
        <div className="bg-amber-50 p-4 rounded-md shadow-xl">
            {/*
                Контейнер для разделения на левую (Баланс) и правую (Цель) части.
                На мобильных/планшетах (по умолчанию): flex-col, items-start, gap-4.
                На десктопах (md:): flex-row, justify-between, items-center, gap-0.
            */}
            <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mr-6">
                {/* --- Левая часть: Отображение Баланса --- */}
                <div className="flex items-baseline w-full flex-shrink-0 md:w-auto mr-2">
                    {/* Надпись "Ваш баланс:" */}
                    <Text variant="body" className="text-secondary-600 mr-2">Баланс:</Text>
                    {/* --- Динамическое содержимое: Загрузка, Ошибка, Значение Баланса, или Плейсхолдер --- */}
                    {loading && (
                        <Text className="text-2xl font-bold text-primary-700">Загрузка...</Text>
                    )}
                    {error && (
                        <Text className="text-2xl font-bold text-red-500">
                            Ошибка
                        </Text>
                    )}
                    {/* Если не загрузка, нет ошибки, и баланс успешно загружен (значение не null) */}
                    {!loading && !error && balance !== null && (
                        <Text
                            variant='balance'
                            className={`${balanceCustomColorClass}`}>
                            {formattedBalanceValue}{'\u00A0'}₽ {/* Добавлен неразрывный пробел */}
                        </Text>
                    )}
                    {/* Если не загрузка, нет ошибки, но баланс еще не загружен или сброшен (значение null) */}
                    {!loading && !error && balance === null && (
                        <Text className="font-bold text-secondary-600">
                            --.-- ₽
                        </Text>
                    )}
                </div>
                {/* --- Конец Левой части --- */}
                {/* --- Правая часть: Место для Финансовой цели (Виджет Прогресса) --- */}
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
