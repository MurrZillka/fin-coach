// src/components/CategoryDistributionWidget.tsx
import React, { useMemo } from 'react';
import Text from '../ui/Text';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import TooltipCustom from '../ui/Tooltip';
import useCategoryStore from '../../02_stores/categoryStore/categoryStore';

export interface ChartDataItem {
    name: string;
    value: number;
}

interface CustomRechartsTooltipProps {
    active?: boolean;
    payload?: Array<{ name: string; value: number }>;
}

const CustomRechartsTooltip: React.FC<CustomRechartsTooltipProps> = ({ active, payload }) => {
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

interface CategoryDistributionWidgetProps {
    onOpenChart?: () => void;
    loading?: boolean;
    allTimeCategoriesSummary?: Record<string, number>;
}

const CategoryDistributionWidget: React.FC<CategoryDistributionWidgetProps> = ({
                                                                                   onOpenChart,
                                                                                   loading,
                                                                                   allTimeCategoriesSummary,
                                                                               }) => {
    const { categoryColorMap } = useCategoryStore();

    const chartData = useMemo(() => {
        return Object.entries(allTimeCategoriesSummary || {})
            .map(([name, value]) => ({
                name,
                value: Number(value)
            }))
            .sort((a, b) => a.name.localeCompare(b.name)); // Сортировка для стабильности
    }, [allTimeCategoriesSummary]);

    const hasData = chartData.length > 0;
    const totalAmount = useMemo(() => {
        return chartData.reduce((sum, entry) => sum + entry.value, 0);
    }, [chartData]);

    return (
        <div aria-disabled={loading}>
            <div
                className="flex justify-between items-center mb-2 cursor-pointer hover:text-primary-700"
                onClick={onOpenChart}
                title="Перейти к распределению расходов"
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
                                    key={entry.name}
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
