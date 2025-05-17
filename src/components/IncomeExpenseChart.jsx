// src/components/IncomeExpenseChart.jsx
import React, {useMemo, useState} from 'react';
import Text from './ui/Text';

// Импортируем компоненты Recharts
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer, // Этот компонент помогает графику быть адаптивным
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis
} from 'recharts';

// --- Вспомогательные функции для работы с датами (остаются без изменений) ---

// Получить строку 'YYYY-MM-DD' из объекта Date (в локальном времени)
const getLocalISODateString = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Получить строку 'YYYY-MM' из объекта Date (в локальном времени)
const getLocalYearMonthString = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

// Парсинг даты окончания и обработка '0001-01-01' в локальном времени (конец дня)
const parseLocalEndOfDayDate = (dateString) => {
    if (!dateString || dateString.startsWith('0001-01-01')) {
        // Для "нулевой" даты конца считаем, что действует до далекого будущего
        return new Date(2100, 0, 1, 23, 59, 59, 999); // В далеком будущем, конец дня
    }
    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            date.setHours(23, 59, 59, 999); // Устанавливаем время на конец дня
            return date;
        }
    } catch (e) {
        console.error("Failed to parse end date:", dateString, e);
    }
    return new Date(2100, 0, 1, 23, 59, 59, 999); // В случае ошибки парсинга тоже считаем, что действует долго
};

// Парсинг даты начала в локальном времени (начало дня)
const parseLocalDateStartOfDay = (dateString) => {
    if (!dateString) return null; // Дата начала не может быть пустой или нулевой

    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            date.setHours(0, 0, 0, 0); // Устанавливаем время на начало дня
            return date;
        }
    } catch (e) {
        console.error("Failed to parse start date:", dateString, e);
    }
    return null; // В случае ошибки парсинга
};

// Проверка пересечения двух диапазонов дат [start1, end1] и [start2, end2]
const hasDateOverlap = (start1, end1, start2, end2) => {
    // Пересечение есть, если (начало первого <= конец второго) И (конец первого >= начало второго)
    return start1.getTime() <= end2.getTime() && end1.getTime() >= start2.getTime();
};

// --- Конец вспомогательных функций ---


// Вспомогательная функция для подготовки данных графика
const prepareChartData = (credits, spendings, selectedPeriod) => {
    let aggregatedData = {}; // Объект для агрегации { 'Период': { Доходы: N, Расходы: M } }
    //let dataFormat = ''; // 'YYYY-MM-DD' или 'YYYY-MM'
    //let tickFormat = ''; // 'DD.MM' или 'Мес ГГГГ'
    let periodStep = 'day'; // Шаг агрегации: 'day' или 'month'


    // Определяем текущую дату в локальном времени, обнуляем время
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Определяем диапазон дат для графика
    let chartStartDate = null;
    let chartEndDate = null;


    switch (selectedPeriod) {
        case 'month': { // --- ДОБАВЛЕНО: Фигурные скобки ---
            // Период "За месяц": последние 30 дней, агрегация по дням
            chartEndDate = new Date(today); // Конец диапазона - сегодня (начало дня)
            chartStartDate = new Date(today);
            chartStartDate.setDate(today.getDate() - 29); // Начало диапазона - 30 дней назад
            chartStartDate.setHours(0, 0, 0, 0);

            //dataFormat = 'YYYY-MM-DD';
            //tickFormat = 'DD.MM';
            periodStep = 'day';
            break;
        } // --- ДОБАВЛЕНО: Фигурные скобки ---

        case 'year': { // --- ДОБАВЛЕНО: Фигурные скобки ---
            // Период "За год": Последние 12 полных календарных месяцев, по месяцам
            chartEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999); // Последний день текущего месяца (конец дня)
            chartStartDate = new Date(chartEndDate.getFullYear(), chartEndDate.getMonth() - 11, 1, 0, 0, 0, 0); // Первое число месяца 12 месяцев назад от конца текущего

            //dataFormat = 'YYYY-MM';
            //tickFormat = 'Мес ГГГГ';
            periodStep = 'month';
            break;
        } // --- ДОБАВЛЕНО: Фигурные скобки ---

        case 'all-time': { // --- ДОБАВЛЕНО: Фигурные скобки ---
            // --- РЕАЛИЗАЦИЯ: Период "За все время" ---
            // Определяем конечную дату диапазона: конец текущего месяца
            chartEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999); // Последний день текущего месяца (конец дня)

            // Находим самую раннюю дату начала среди всех транзакций
            let minDate = new Date(2100, 0, 1); // Инициализируем датой в далеком будущем

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

            // Если minDate осталась датой в далеком будущем, значит, транзакций нет.
            // В этом случае диапазон - текущий месяц. Иначе - с начала месяца самой ранней транзакции.
            if (minDate.getFullYear() === 2100) {
                chartStartDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0); // Начало текущего месяца
            } else {
                chartStartDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1, 0, 0, 0, 0); // Начало месяца самой ранней транзакции
            }

            //dataFormat = 'YYYY-MM';
            //tickFormat = 'Мес ГГГГ';
            periodStep = 'month';
            // Ширина будет рассчитана в конце исходя из количества месяцев
            break;
        } // --- ДОБАВЛЕНО: Фигурные скобки ---

        default: { // --- ДОБАВЛЕНО: Фигурные скобки ---
            return { data: [] }; // Возвращаем только данные
        } // --- ДОБАВЛЕНО: Фигурные скобки ---
    }


    // Инициализируем агрегированную структуру для выбранного периода и диапазона дат графика
    if (periodStep === 'day') {
        let currentDate = new Date(chartStartDate);
        while (currentDate.getTime() <= chartEndDate.getTime()) {
            const dateString = getLocalISODateString(currentDate);
            aggregatedData[dateString] = { Доходы: 0, Расходы: 0 };

            const prevTimestamp = currentDate.getTime();
            currentDate.setDate(currentDate.getDate() + 1);
            if (currentDate.getTime() <= prevTimestamp) {
                console.error("Date increment stuck in initialization loop (day)!");
                break;
            }
        }
    } else if (periodStep === 'month') {
        let currentMonth = new Date(chartStartDate.getFullYear(), chartStartDate.getMonth(), 1);
        const endMonth = new Date(chartEndDate.getFullYear(), chartEndDate.getMonth(), 1);

        while (currentMonth.getTime() <= endMonth.getTime()) {
            const monthString = getLocalYearMonthString(currentMonth);
            aggregatedData[monthString] = { Доходы: 0, Расходы: 0 };

            const prevMonthTime = currentMonth.getTime();
            currentMonth.setMonth(currentMonth.getMonth() + 1);
            if (currentMonth.getTime() <= prevMonthTime) {
                console.error("Month increment stuck in initialization loop (month)!");
                break;
            }
        }
    }


    // --- Логика агрегации данных (остается без изменений) ---

    // Обработка Доходов
    credits.forEach(credit => {
        const creditDate = parseLocalDateStartOfDay(credit.date); // Дата начала в локальном времени (начало дня)
        const creditEndDate = parseLocalEndOfDayDate(credit.end_date); // Дата окончания в локальном времени (конец дня)

        if (!creditDate) return; // Пропускаем транзакции без даты начала

        // Проверяем, пересекается ли период действия транзакции с периодом графика
        if (!hasDateOverlap(creditDate, creditEndDate, chartStartDate, chartEndDate)) {
            return; // Нет пересечения, пропускаем транзакцию
        }

        if (credit.is_permanent) {
            // Регулярный доход
            if (periodStep === 'day') {
                let currentDay = new Date(chartStartDate); // Итерация по дням в окне графика
                while(currentDay.getTime() <= chartEndDate.getTime()) {
                    // Проверяем, что текущий день попадает в период действия регулярной операции
                    if (currentDay.getTime() >= creditDate.getTime() && currentDay.getTime() <= creditEndDate.getTime()) {
                        // Если день текущего месяца в окне графика совпадает с днем месяца начала регулярной операции
                        if (currentDay.getDate() === creditDate.getDate()) {
                            const dayString = getLocalISODateString(currentDay);
                            if (aggregatedData[dayString]) { aggregatedData[dayString].Доходы += credit.amount; } else { console.warn(`Day ${dayString} not found in aggregatedData.`); }
                        }
                    }
                    const prevTimestamp = currentDay.getTime(); currentDay.setDate(currentDay.getDate() + 1); if (currentDay.getTime() <= prevTimestamp) { console.error("Date increment stuck (perm credit day)!"); break; }
                }
            } else if (periodStep === 'month') {
                let currentMonth = new Date(chartStartDate.getFullYear(), chartStartDate.getMonth(), 1); // Итерация по месяцам в окне графика
                const endMonth = new Date(chartEndDate.getFullYear(), chartEndDate.getMonth(), 1);

                while(currentMonth.getTime() <= endMonth.getTime()) {
                    const currentMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999);

                    if (hasDateOverlap(currentMonth, currentMonthEnd, creditDate, creditEndDate)) {
                        const monthString = getLocalYearMonthString(currentMonth);
                        if (aggregatedData[monthString]) { aggregatedData[monthString].Доходы += credit.amount; } else { console.warn(`Month ${monthString} not found in aggregatedData.`); }
                    }
                    const prevMonthTime = currentMonth.getTime(); currentMonth.setMonth(currentMonth.getMonth() + 1); if (currentMonth.getTime() <= prevMonthTime) { console.error("Month increment stuck (perm credit month)!"); break; }
                }
            }
        } else { // One-time
            if (periodStep === 'day') {
                if (creditDate.getTime() >= chartStartDate.getTime() && creditDate.getTime() <= chartEndDate.getTime()) {
                    const dayString = getLocalISODateString(creditDate);
                    if (aggregatedData[dayString]) { aggregatedData[dayString].Доходы += credit.amount; } else { console.warn(`Day ${dayString} not found in aggregatedData.`); }
                }
            } else if (periodStep === 'month') {
                if (creditDate.getTime() >= chartStartDate.getTime() && creditDate.getTime() <= chartEndDate.getTime()) {
                    const monthString = getLocalYearMonthString(creditDate);
                    if (aggregatedData[monthString]) { aggregatedData[monthString].Доходы += credit.amount; } else { console.warn(`Month ${monthString} not found in aggregatedData.`); }
                }
            }
        }
    });

    // Обработка Расходов (аналогично Доходам)
    spendings.forEach(spending => {
        const spendingDate = parseLocalDateStartOfDay(spending.date);
        const spendingEndDate = parseLocalEndOfDayDate(spending.end_date);
        if (!spendingDate) return;
        if (!hasDateOverlap(spendingDate, spendingEndDate, chartStartDate, chartEndDate)) return;


        if (spending.is_permanent) {
            if (periodStep === 'day') {
                let currentDay = new Date(chartStartDate);
                while(currentDay.getTime() <= chartEndDate.getTime()) {
                    if (currentDay.getTime() >= spendingDate.getTime() && currentDay.getTime() <= spendingEndDate.getTime()) {
                        if (currentDay.getDate() === spendingDate.getDate()) {
                            const dayString = getLocalISODateString(currentDay);
                            if (aggregatedData[dayString]) { aggregatedData[dayString].Расходы += spending.amount; } else { console.warn(`Day ${dayString} not found in aggregatedData.`); }
                        }
                    }
                    const prevTimestamp = currentDay.getTime(); currentDay.setDate(currentDay.getDate() + 1); if (currentDay.getTime() <= prevTimestamp) { console.error("Date increment stuck (perm spending day)!"); break; }
                }
            } else if (periodStep === 'month') {
                let currentMonth = new Date(chartStartDate.getFullYear(), chartStartDate.getMonth(), 1);
                const endMonth = new Date(chartEndDate.getFullYear(), chartEndDate.getMonth(), 1);
                while(currentMonth.getTime() <= endMonth.getTime()) {
                    const currentMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999);
                    if (hasDateOverlap(currentMonth, currentMonthEnd, spendingDate, spendingEndDate)) {
                        const monthString = getLocalYearMonthString(currentMonth);
                        if (aggregatedData[monthString]) { aggregatedData[monthString].Расходы += spending.amount; } else { console.warn(`Month ${monthString} not found in aggregatedData.`); }
                    }
                    const prevMonthTime = currentMonth.getTime(); currentMonth.setMonth(currentMonth.getMonth() + 1); if (currentMonth.getTime() <= prevMonthTime) { console.error("Month increment stuck (perm spending month)!"); break; }
                }
            }
        } else { // One-time
            if (periodStep === 'day') {
                if (spendingDate.getTime() >= chartStartDate.getTime() && spendingDate.getTime() <= chartEndDate.getTime()) {
                    const dayString = getLocalISODateString(spendingDate);
                    if (aggregatedData[dayString]) { aggregatedData[dayString].Расходы += spending.amount; } else { console.warn(`Day ${dayString} not found in aggregatedData.`); }
                }
            } else if (periodStep === 'month') {
                if (spendingDate.getTime() >= chartStartDate.getTime() && spendingDate.getTime() <= chartEndDate.getTime()) {
                    const monthString = getLocalYearMonthString(spendingDate);
                    if (aggregatedData[monthString]) { aggregatedData[monthString].Расходы += spending.amount; } else { console.warn(`Month ${monthString} not found in aggregatedData.`); }
                }
            }
        }
    });


    // Формируем итоговый массив данных для Recharts и сортируем его
    const dates = Object.keys(aggregatedData);

    let chartData = dates.map(dateString => {
        let name = dateString;
        let sortDate;

        if (periodStep === 'day') {
            const [year, month, day] = dateString.split('-').map(Number);
            name = `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}`; // DD.MM
            sortDate = new Date(year, month - 1, day);
        } else if (periodStep === 'month') {
            const [year, month] = dateString.split('-').map(Number);
            const date = new Date(year, month - 1, 1);
            name = `${date.toLocaleString('ru-RU', { month: 'short' })} ${year}`; // Мес ГГГГ
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

    chartData.sort((a, b) => a._date.getTime() - b._date.getTime());
    chartData.forEach(item => delete item._date);


    // Ширина графика теперь полностью управляется ResponsiveContainer
    // dynamicWidth больше не используется для задания ширины графика
    // return { data: chartData, width: dynamicChartWidth }; // Удалено
    return { data: chartData }; // Возвращаем только данные
};


// Компонент IncomeExpenseChart
const IncomeExpenseChart = ({
                                credits = [],
                                spendings = [],
                                isLoadingData = false,
                            }) => {
    const [chartType, setChartType] = useState('line');
    const [selectedPeriod, setSelectedPeriod] = useState('all-time'); // Дефолтный период - все время.

    const handleChartTypeChange = (type) => setChartType(type);
    const handlePeriodChange = (period) => setSelectedPeriod(period);

    // Получаем только данные из useMemo
    const { data: chartData } = useMemo(() => {
        console.log("prepareChartData called with period:", selectedPeriod);
        return prepareChartData(credits, spendings, selectedPeriod);
    }, [credits, spendings, selectedPeriod, prepareChartData]);


    const hasChartData = Array.isArray(chartData) && chartData.length > 0;

    return (
        // Контейнер графика. overflow-x-auto нужен, если график внутри ResponsiveContainer все же станет шире (например, при очень большом количестве точек или узком экране)
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
                    {/* Графики внутри ResponsiveContainer обычно не нуждаются в явных width/height */}
                    {chartType === 'line' ? (
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Доходы" stroke="#82ca9d" strokeWidth={2} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="Расходы" stroke="#DC143C" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    ) : (
                        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
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