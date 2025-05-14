import React, { useState, useMemo } from 'react';
import Text from './ui/Text';
import TextButton from './ui/TextButton';

// Импортируем компоненты Recharts
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';

// Вспомогательная функция для подготовки данных графика
const prepareChartData = (credits, spendings, selectedPeriod) => {
    const mockAllData = [
        { name: 'Янв', Доходы: 4000, Расходы: 2400 }, { name: 'Фев', Доходы: 3000, Расходы: 1398 },
        { name: 'Мар', Доходы: 2000, Расходы: 9800 }, { name: 'Апр', Доходы: 2780, Расходы: 3908 },
        { name: 'Май', Доходы: 1890, Расходы: 4800 }, { name: 'Июн', Доходы: 2390, Расходы: 3800 },
        { name: 'Июл', Доходы: 3490, Расходы: 4300 }, { name: 'Авг', Доходы: 3490, Расходы: 4300 },
        { name: 'Сен', Доходы: 3490, Расходы: 4300 }, { name: 'Окт', Доходы: 3490, Расходы: 4300 },
        { name: 'Ноя', Доходы: 3490, Расходы: 4300 }, { name: 'Дек', Доходы: 3490, Расходы: 4300 },
    ];

    let filteredData = [];
    let dynamicWidth = 0;

    switch (selectedPeriod) {
        case 'month':
            filteredData = mockAllData.slice(0, 1);
            break;
        case 'year':
            filteredData = mockAllData;
            break;
        case 'all-time':
            filteredData = mockAllData;
            break;
        default:
            filteredData = [];
    }

    dynamicWidth = Math.max(filteredData.length * 70, 300); // Минимальная ширина 300px

    return { data: filteredData, width: dynamicWidth };
};

const IncomeExpenseChart = ({
                                credits = [], // Данные доходов из стора, дефолт — пустой массив
                                spendings = [], // Данные расходов из стора, дефолт — пустой массив
                                isLoadingData = false, // Статус загрузки, дефолт — false
                               // handleViewIncomeClick, // Обработчик для доходов (опционально)
                               // handleViewExpensesClick, // Обработчик для расходов (опционально)
                            }) => {
    const [chartType, setChartType] = useState('line');
    const [selectedPeriod, setSelectedPeriod] = useState('year');

    const handleChartTypeChange = (type) => setChartType(type);
    const handlePeriodChange = (period) => setSelectedPeriod(period);

    const { data: chartData, width: dynamicChartWidth } = useMemo(() => {
        return prepareChartData(credits, spendings, selectedPeriod);
    }, [credits, spendings, selectedPeriod]);

    const hasChartData = Array.isArray(chartData) && chartData.length > 0;

    return (
        <div className="bg-white p-4 rounded-md shadow-md overflow-x-auto">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                <Text variant="h3" className="mb-2 md:mb-0 mr-0 md:mr-4">Динамика Доходов и Расходов</Text>
                <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                    <button
                        className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${chartType === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        onClick={() => handleChartTypeChange('line')}
                        disabled={isLoadingData}
                    >
                        Линии
                    </button>
                    <button
                        className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${chartType === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        onClick={() => handleChartTypeChange('bar')}
                        disabled={isLoadingData}
                    >
                        Столбцы
                    </button>
                    <button
                        className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${selectedPeriod === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        onClick={() => handlePeriodChange('year')}
                        disabled={isLoadingData}
                    >
                        За год
                    </button>
                    <button
                        className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${selectedPeriod === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        onClick={() => handlePeriodChange('month')}
                        disabled={isLoadingData}
                    >
                        За месяц
                    </button>
                    <button
                        className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${selectedPeriod === 'all-time' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        onClick={() => handlePeriodChange('all-time')}
                        disabled={isLoadingData}
                    >
                        За все время
                    </button>
                </div>
            </div>

            {hasChartData ? (
                <ResponsiveContainer width="100%" height={300}>
                    {chartType === 'line' ? (
                        <LineChart width={dynamicChartWidth} height={300} data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Доходы" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="Расходы" stroke="#82ca9d" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    ) : (
                        <BarChart width={dynamicChartWidth} height={300} data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Bar dataKey="Доходы" fill="#8884d8" />
                            <Bar dataKey="Расходы" fill="#82ca9d" />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            ) : (
                <div className="text-center p-4 bg-gray-100 rounded-md" style={{ height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    {isLoadingData ? (
                        <Text variant="body">Загрузка данных графика...</Text>
                    ) : (
                        <Text variant="body" className="text-gray-600">
                            Добавьте доходы и расходы или выберите другой период, чтобы увидеть визуализацию.
                        </Text>
                    )}
                </div>
            )}
        </div>
    );
};

export default IncomeExpenseChart;