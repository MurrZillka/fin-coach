// src/components/CategoryDistributionWidget.jsx
import React, { useMemo } from 'react';
import Text from '../ui/Text.jsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import TooltipCustom from '../ui/Tooltip.jsx'; // Переименованный импорт UI-тултипа

// НОВОЕ: Импортируем useCategoryStore
import useCategoryStore from '../../stores/categoryStore.js';

// УДАЛЯЕМ старую константу COLORS
// const COLORS = [
//     '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
//     '#A4DDED', '#C1A4DE', '#8A2BE2', '#DEB887', '#5F9EA0', '#D2691E', '#FF7F50', '#6495ED',
//     '#DC143C', '#00FFFF', '#00008B', '#008B8B', '#B8860B', '#A9A9A9', '#006400', '#BDB76B'
// ];

// Кастомный компонент для тултипа Recharts (переименован, чтобы не конфликтовать с ui/Tooltip)
const CustomRechartsTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="
                bg-white
                p-2
                border
                border-gray-300
                rounded-md
                shadow-lg
                text-sm
                flex flex-col
                items-start
            ">
                <p className="font-semibold text-gray-800">{`${data.name}: ${data.value.toLocaleString()} руб.`}</p>
            </div>
        );
    }
    return null;
};

const CategoryDistributionWidget = ({ onOpenChart, loading, allTimeCategoriesSummary }) => {
    // НОВОЕ: Получаем categoryColorMap из useCategoryStore
    const { categoryColorMap } = useCategoryStore();

    const chartData = useMemo(() => {
        return Object.entries(allTimeCategoriesSummary || {})
            .map(([name, value]) => ({
                name,
                value: Number(value)
            }))
            .sort((a, b) => a.name.localeCompare(b.name)); // СОРТИРОВКА для стабильности
    }, [allTimeCategoriesSummary]);

    const hasData = chartData.length > 0;
    const totalAmount = useMemo(() => {
        return chartData.reduce((sum, entry) => sum + entry.value, 0);
    }, [chartData]);


    return (
        <div
            // Убрал onClick и cursor-pointer с этого div, так как кликабельной является область заголовка
            aria-disabled={loading}
        >
            {/* БЛОК ЗАГОЛОВКА, как в RecentIncomeWidget */}
            <div
                className="flex justify-between items-center mb-2 cursor-pointer hover:text-primary-700"
                onClick={onOpenChart} // Обработчик клика на заголовке
                title="Перейти к распределению расходов" // Стандартный HTML тултип
            >
                <Text variant="h3" className="flex-grow mr-2">Структура расходов</Text>
                <TooltipCustom text="Перейти к распределению расходов">
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-700" />
                </TooltipCustom>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Text variant="body" className="text-gray-500">Загрузка данных...</Text>
                </div>
            ) : hasData ? (
                <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            labelLine={false}
                        >
                            {chartData.map((entry) => (
                                <Cell
                                    key={entry.name} // Используем имя категории как ключ для стабильности
                                    // НОВОЕ: Получаем цвет из categoryColorMap, переданного из стора
                                    fill={categoryColorMap[entry.name] || '#CCCCCC'} // Резервный цвет
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomRechartsTooltip />} />
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-base font-bold fill-gray-700">
                            {`₽${totalAmount.toLocaleString()}`}
                        </text>
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex justify-center items-center h-48">
                    <Text variant="body" className="text-gray-500">
                        Нет достаточных данных для анализа.
                    </Text>
                </div>
            )}
        </div>
    );
};

export default CategoryDistributionWidget;