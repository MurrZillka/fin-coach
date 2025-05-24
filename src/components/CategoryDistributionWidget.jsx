// src/components/CategoryDistributionWidget.jsx
import React from 'react';
import Text from './ui/Text';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Увеличенное количество цветов для диаграммы
const COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
    '#A4DDED', '#C1A4DE', '#8A2BE2', '#DEB887', '#5F9EA0', '#D2691E', '#FF7F50', '#6495ED',
    '#DC143C', '#00FFFF', '#00008B', '#008B8B', '#B8860B', '#A9A9A9', '#006400', '#BDB76B'
];

const CategoryDistributionWidget = ({ onOpenChart, loading, allTimeCategoriesSummary }) => {
    // Преобразуем объект summaries в массив для Recharts
    const chartData = Object.entries(allTimeCategoriesSummary || {}).map(([name, value]) => ({
        name,
        value: Number(value)
    }));

    const hasData = chartData.length > 0;
    const totalAmount = chartData.reduce((sum, entry) => sum + entry.value, 0);

    return (
        <div
            className="flex flex-col justify-between cursor"
            onClick={onOpenChart}
            aria-disabled={loading}
        >
            {/* ИЗМЕНЕНО: Заголовок виджета теперь просто "Расходы" */}
            <Text variant="h3" className="text-xl font-semibold mb-2 text-gray-800">
                Расходы
            </Text>
            {/* ИЗМЕНЕНО: Удалена надпись "Распределение трат за все время" */}


            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Text variant="body" className="text-gray-500">Загрузка данных...</Text>
                </div>
            ) : hasData ? (
                <ResponsiveContainer width="100%" height={200}>
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
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value.toLocaleString()} руб.`, name]} />
                        {/* ИЗМЕНЕНО: Добавлена надпись "Расходы" в центр круга */}
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold fill-gray-700">
                            Расходы
                        </text>
                        {/* ИЗМЕНЕНО: Удален старый текст с общей суммой */}
                        {/* <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-sm font-bold fill-gray-700">
                            Всего: {totalAmount.toLocaleString()}
                        </text> */}
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