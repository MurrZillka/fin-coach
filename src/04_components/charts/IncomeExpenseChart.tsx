// IncomeExpenseChart.tsx
import React, { useMemo, useState, useEffect } from 'react';
import Text from '../ui/Text';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis
} from 'recharts';

// Типы
interface Credit {
    id: number;
    date: string;
    amount: number;
    is_permanent: boolean;
    end_date?: string;
}

interface Spending {
    id: number;
    date: string;
    amount: number;
    is_permanent: boolean;
    end_date?: string;
}

interface ChartDataItem {
    name: string;
    Доходы: number;
    Расходы: number;
    _date?: Date;
}

interface AggregatedData {
    [key: string]: {
        Доходы: number;
        Расходы: number;
    };
}

type ChartType = 'line' | 'bar';
type SelectedPeriod = 'month' | 'year' | 'all-time';
type PeriodStep = 'day' | 'month';

interface IncomeExpenseChartProps {
    credits?: Credit[];
    spendings?: Spending[];
    isLoadingData?: boolean;
}

interface PrepareChartDataResult {
    data: ChartDataItem[];
}

// --- Вспомогательные функции для работы с датами ---
const getLocalISODateString = (date: Date): string | null => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getLocalYearMonthString = (date: Date): string | null => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

const parseLocalEndOfDayDate = (dateString?: string): Date => {
    if (!dateString || dateString.startsWith('0001-01-01')) {
        return new Date(2100, 0, 1, 23, 59, 59, 999);
    }
    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            date.setHours(23, 59, 59, 999);
            return date;
        }
    } catch (e) {
        console.error("Failed to parse end date:", dateString, e);
    }
    return new Date(2100, 0, 1, 23, 59, 59, 999);
};

const parseLocalDateStartOfDay = (dateString: string): Date | null => {
    if (!dateString) return null;

    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            const localDate = new Date(Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                date.getUTCDate(),
                0, 0, 0, 0
            ));
            return localDate;
        }
    } catch (e) {
        console.error("Failed to parse start date:", dateString, e);
    }
    return null;
};

const hasDateOverlap = (start1: Date, end1: Date, start2: Date, end2: Date): boolean => {
    return start1.getTime() <= end2.getTime() && end1.getTime() >= start2.getTime();
};

// --- Вспомогательная функция для подготовки данных графика ---
const prepareChartData = (
        credits: Credit[],
    spendings: Spending[],
    selectedPeriod: SelectedPeriod
): PrepareChartDataResult => {
    let aggregatedData: AggregatedData = {};
    let periodStep: PeriodStep = 'day';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let chartStartDate: Date;
    let chartEndDate: Date;

    switch (selectedPeriod) {
        case 'month': {
            chartEndDate = new Date(today);
            chartEndDate.setHours(0, 0, 0, 0);
            chartStartDate = new Date(today);
            chartStartDate.setDate(today.getDate() - 29);
            chartStartDate.setHours(0, 0, 0, 0);
            periodStep = 'day';
            break;
        }
        case 'year': {
            chartEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
            chartStartDate = new Date(chartEndDate.getFullYear(), chartEndDate.getMonth() - 11, 1, 0, 0, 0, 0);
            periodStep = 'month';
            break;
        }
        case 'all-time': {
            chartEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
            let minDate = new Date(2100, 0, 1);

            credits.forEach(credit => {
                const creditDate = parseLocalDateStartOfDay(credit.date);
                if (creditDate && creditDate.getTime() < minDate.getTime()) {
                    minDate = creditDate;
                }
            });

            spendings.forEach(spending => {
                const spendingDate = parseLocalDateStartOfDay(spending.date);
                if (spendingDate && spendingDate.getTime() < minDate.getTime()) {
                    minDate = spendingDate;
                }
            });

            if (minDate.getFullYear() === 2100) {
                chartStartDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
            } else {
                chartStartDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1, 0, 0, 0, 0);
            }
            periodStep = 'month';
            break;
        }
        default: {
            return { data: [] };
        }
    }

    // Инициализация данных
    if (periodStep === 'day') {
        let currentDate = new Date(chartStartDate);
        while (currentDate.getTime() <= chartEndDate.getTime()) {
            const dateString = getLocalISODateString(currentDate);
            if (dateString && !aggregatedData[dateString]) {
                aggregatedData[dateString] = { Доходы: 0, Расходы: 0 };
            }
            const nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + 1);
            if (nextDate.getTime() <= currentDate.getTime()) {
                break;
            }
            currentDate = nextDate;
        }
    } else if (periodStep === 'month') {
        let currentMonth = new Date(chartStartDate.getFullYear(), chartStartDate.getMonth(), 1);
        const endMonth = new Date(chartEndDate.getFullYear(), chartEndDate.getMonth(), 1);
        while (currentMonth.getTime() <= endMonth.getTime()) {
            const monthString = getLocalYearMonthString(currentMonth);
            if (monthString) {
                aggregatedData[monthString] = { Доходы: 0, Расходы: 0 };
            }
            currentMonth.setMonth(currentMonth.getMonth() + 1);
        }
    }

    // Обработка доходов
    credits.forEach(credit => {
        const creditDate = parseLocalDateStartOfDay(credit.date);
        const creditEndDate = parseLocalEndOfDayDate(credit.end_date);

        if (!creditDate) return;
        if (!hasDateOverlap(creditDate, creditEndDate, chartStartDate, chartEndDate)) return;

        if (credit.is_permanent) {
            if (periodStep === 'day') {
                let currentDay = new Date(chartStartDate);
                while (currentDay.getTime() <= chartEndDate.getTime()) {
                    if (currentDay.getTime() >= creditDate.getTime() && currentDay.getTime() <= creditEndDate.getTime()) {
                        if (currentDay.getDate() === creditDate.getDate()) {
                            const dayString = getLocalISODateString(currentDay);
                            if (dayString && aggregatedData[dayString]) {
                                aggregatedData[dayString].Доходы += credit.amount;
                            }
                        }
                    }
                    currentDay.setDate(currentDay.getDate() + 1);
                }
            } else if (periodStep === 'month') {
                let currentMonth = new Date(chartStartDate.getFullYear(), chartStartDate.getMonth(), 1);
                const endMonth = new Date(chartEndDate.getFullYear(), chartEndDate.getMonth(), 1);
                while (currentMonth.getTime() <= endMonth.getTime()) {
                    const currentMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999);
                    if (hasDateOverlap(currentMonth, currentMonthEnd, creditDate, creditEndDate)) {
                        const monthString = getLocalYearMonthString(currentMonth);
                        if (monthString && aggregatedData[monthString]) {
                            aggregatedData[monthString].Доходы += credit.amount;
                        }
                    }
                    currentMonth.setMonth(currentMonth.getMonth() + 1);
                }
            }
        } else {
            if (periodStep === 'day') {
                if (creditDate.getTime() >= chartStartDate.getTime() && creditDate.getTime() <= chartEndDate.getTime()) {
                    const dayString = getLocalISODateString(creditDate);
                    if (dayString && aggregatedData[dayString]) {
                        aggregatedData[dayString].Доходы += credit.amount;
                    }
                }
            } else if (periodStep === 'month') {
                if (creditDate.getTime() >= chartStartDate.getTime() && creditDate.getTime() <= chartEndDate.getTime()) {
                    const monthString = getLocalYearMonthString(creditDate);
                    if (monthString && aggregatedData[monthString]) {
                        aggregatedData[monthString].Доходы += credit.amount;
                    }
                }
            }
        }
    });

    // Обработка расходов
    spendings.forEach(spending => {
        const spendingDate = parseLocalDateStartOfDay(spending.date);
        const spendingEndDate = parseLocalEndOfDayDate(spending.end_date);
        if (!spendingDate) return;
        if (!hasDateOverlap(spendingDate, spendingEndDate, chartStartDate, chartEndDate)) return;

        if (spending.is_permanent) {
            if (periodStep === 'day') {
                let currentDay = new Date(chartStartDate);
                while (currentDay.getTime() <= chartEndDate.getTime()) {
                    if (currentDay.getTime() >= spendingDate.getTime() && currentDay.getTime() <= spendingEndDate.getTime()) {
                        if (currentDay.getDate() === spendingDate.getDate()) {
                            const dayString = getLocalISODateString(currentDay);
                            if (dayString && aggregatedData[dayString]) {
                                aggregatedData[dayString].Расходы += spending.amount;
                            }
                        }
                    }
                    currentDay.setDate(currentDay.getDate() + 1);
                }
            } else if (periodStep === 'month') {
                let currentMonth = new Date(chartStartDate.getFullYear(), chartStartDate.getMonth(), 1);
                const endMonth = new Date(chartEndDate.getFullYear(), chartEndDate.getMonth(), 1);
                while (currentMonth.getTime() <= endMonth.getTime()) {
                    const currentMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999);
                    if (hasDateOverlap(currentMonth, currentMonthEnd, spendingDate, spendingEndDate)) {
                        const monthString = getLocalYearMonthString(currentMonth);
                        if (monthString && aggregatedData[monthString]) {
                            aggregatedData[monthString].Расходы += spending.amount;
                        }
                    }
                    currentMonth.setMonth(currentMonth.getMonth() + 1);
                }
            }
        } else {
            if (periodStep === 'day') {
                if (spendingDate.getTime() >= chartStartDate.getTime() && spendingDate.getTime() <= chartEndDate.getTime()) {
                    const dayString = getLocalISODateString(spendingDate);
                    if (dayString && aggregatedData[dayString]) {
                        aggregatedData[dayString].Расходы += spending.amount;
                    }
                }
            } else if (periodStep === 'month') {
                if (spendingDate.getTime() >= chartStartDate.getTime() && spendingDate.getTime() <= chartEndDate.getTime()) {
                    const monthString = getLocalYearMonthString(spendingDate);
                    if (monthString && aggregatedData[monthString]) {
                        aggregatedData[monthString].Расходы += spending.amount;
                    }
                }
            }
        }
    });

    const dates = Object.keys(aggregatedData);
    let chartData: ChartDataItem[] = dates.map(dateString => {
        let name = dateString;
        let sortDate: Date;

        if (periodStep === 'day') {
            const [year, month, day] = dateString.split('-').map(Number);
            name = `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}`;
            sortDate = new Date(year, month - 1, day);
        } else if (periodStep === 'month') {
            const [year, month] = dateString.split('-').map(Number);
            const date = new Date(year, month - 1, 1);
            name = `${date.toLocaleString('ru-RU', { month: 'short' })} ${year}`;
            sortDate = new Date(year, month - 1, 1);
        } else {
            sortDate = new Date(dateString);
        }

        return {
            name: name,
            Доходы: aggregatedData[dateString]?.Доходы || 0,
            Расходы: aggregatedData[dateString]?.Расходы || 0,
            _date: sortDate
        };
    });

    chartData.sort((a, b) => (a._date?.getTime() || 0) - (b._date?.getTime() || 0));
    chartData.forEach(item => delete item._date);

    return { data: chartData };
};

// Компонент IncomeExpenseChart
const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({
                                                                   credits = [],
                                                                   spendings = [],
                                                                   isLoadingData = false,
                                                               }) => {
    const [chartType, setChartType] = useState<ChartType>('line');
    const [selectedPeriod, setSelectedPeriod] = useState<SelectedPeriod>('all-time');

    const handleChartTypeChange = (type: ChartType): void => setChartType(type);
    const handlePeriodChange = (period: SelectedPeriod): void => setSelectedPeriod(period);

    const [isSmallScreen, setIsSmallScreen] = useState<boolean>(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = (): void => {
            setIsSmallScreen(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { data: chartData } = useMemo((): PrepareChartDataResult => {
        console.log("prepareChartData called with period:", selectedPeriod);
        return prepareChartData(credits, spendings, selectedPeriod);
    }, [credits, spendings, selectedPeriod]);

    const hasChartData: boolean = Array.isArray(chartData) && chartData.length > 0;

    return (
        <div className="bg-white p-4 rounded-md shadow-md overflow-x-auto">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                <Text variant="h3" className="mb-2 md:mb-0 mr-0 md:mr-4">Динамика доходов и расходов</Text>
                <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                    <button
                        className={`px-1 py-0.5 text-xs md:px-3 md:py-1 md:text-sm rounded transition-colors duration-200 ${chartType === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        onClick={() => handleChartTypeChange('line')}
                        disabled={isLoadingData}
                    >
                        Линии
                    </button>
                    <button
                        className={`px-1 py-0.5 text-xs md:px-3 md:py-1 md:text-sm rounded transition-colors duration-200 ${chartType === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        onClick={() => handleChartTypeChange('bar')}
                        disabled={isLoadingData}
                    >
                        Столбцы
                    </button>
                    <button
                        className={`px-1 py-0.5 text-xs md:px-3 md:py-1 md:text-sm rounded transition-colors duration-200 ${selectedPeriod === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        onClick={() => handlePeriodChange('year')}
                        disabled={isLoadingData}
                    >
                        За год
                    </button>
                    <button
                        className={`px-1 py-0.5 text-xs md:px-3 md:py-1 md:text-sm rounded transition-colors duration-200 ${selectedPeriod === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        onClick={() => handlePeriodChange('month')}
                        disabled={isLoadingData}
                    >
                        За месяц
                    </button>
                    <button
                        className={`px-1 py-0.5 text-xs md:px-3 md:py-1 md:text-sm rounded transition-colors duration-200 ${selectedPeriod === 'all-time' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
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
                        <LineChart
                            data={chartData}
                            margin={{ top: 5, right: isSmallScreen ? 10 : 30, left: isSmallScreen ? 0 : 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" interval={isSmallScreen && selectedPeriod === 'month' ? Math.ceil(chartData.length / 7) : 'preserveStartEnd'} />
                            {!isSmallScreen && <YAxis />}
                            <RechartsTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Доходы" stroke="#82ca9d" strokeWidth={2} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="Расходы" stroke="#DC143C" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    ) : (
                        <BarChart
                            data={chartData}
                            margin={{ top: 5, right: isSmallScreen ? 10 : 30, left: isSmallScreen ? 0 : 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" interval={isSmallScreen && selectedPeriod === 'month' ? Math.ceil(chartData.length / 7) : 'preserveStartEnd'} />
                            {!isSmallScreen && <YAxis />}
                            <RechartsTooltip />
                            <Legend />
                            <Bar dataKey="Доходы" fill="#82ca9d" />
                            <Bar dataKey="Расходы" fill="#DC143C" />
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
