// src/components/CategoryDistributionChartModal.jsx
import React, {useState, useEffect, useMemo} from 'react';
//eslint-disable-next-line
import {motion, AnimatePresence} from 'framer-motion';
import Text from './ui/Text';
import IconButton from './ui/IconButton.jsx';
import TextButton from './ui/TextButton';
import {XMarkIcon as XIcon} from '@heroicons/react/24/outline';
import {PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend} from 'recharts';

// Импортируем сторы для получения данных
import useSpendingsStore from '../stores/spendingsStore';
import useCategoryStore from '../stores/categoryStore';

// Цвета для секторов диаграммы (можно использовать те же, что и в виджете, или расширить)
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A4DDED', '#C1A4DE', '#F7B7A3', '#DE5254'];

const backdropVariants = {
    visible: {opacity: 1}, hidden: {opacity: 0},
};

const modalVariants = {
    hidden: {y: "-100vh", opacity: 0}, visible: {y: "0", opacity: 1, transition: {delay: 0.1}},
};

const CategoryDistributionChartModal = ({isOpen, onClose, title}) => {
    const {spendings, loading: spendingsLoading, fetchSpendings} = useSpendingsStore();
    const {categoriesMonthSummary, loading: categoriesMonthLoading, fetchCategoriesMonthSummary} = useCategoryStore();

    const [selectedPeriod, setSelectedPeriod] = useState('currentMonth');

    useEffect(() => {
        if (isOpen) {
            if (!spendings && !spendingsLoading) {
                fetchSpendings();
            }
            if (!categoriesMonthSummary && !categoriesMonthLoading) {
                fetchCategoriesMonthSummary();
            }
            // === ДОБАВЛЕНО ДЛЯ ОТЛАДКИ ===
            console.log("Modal opened. Current spendings:", spendings);
            console.log("Modal opened. Current categoriesMonthSummary:", categoriesMonthSummary);
            // === КОНЕЦ ОТЛАДКИ ===
        }
    }, [isOpen, spendings, spendingsLoading, fetchSpendings, categoriesMonthSummary, categoriesMonthLoading, fetchCategoriesMonthSummary]);

    const aggregatedData = useMemo(() => {
        // === ДОБАВЛЕНО ДЛЯ ОТЛАДКИ ===
        console.log("Aggregating data for period:", selectedPeriod);
        console.log("Spendings available for aggregation:", spendings);
        console.log("categoriesMonthSummary available for aggregation (for currentMonth):", categoriesMonthSummary);
        // === КОНЕЦ ОТЛАДКИ ===

        if (!spendings || spendings.length === 0) {
            // === ДОБАВЛЕНО ДЛЯ ОТЛАДКИ ===
            if (selectedPeriod !== 'currentMonth') { // если текущий месяц, то spendings не нужен
                console.warn("Spendings array is empty or null, cannot aggregate for other periods.");
            }
            // === КОНЕЦ ОТЛАДКИ ===
            // Если выбран "currentMonth", а categoriesMonthSummary ещё не пришёл,
            // или если spendings пуст, но мы выбрали не "currentMonth"
            if (selectedPeriod === 'currentMonth' && categoriesMonthSummary && typeof categoriesMonthSummary === 'object' && Object.keys(categoriesMonthSummary).length > 0) {
                return categoriesMonthSummary;
            }
            return {}; // Возвращаем пустой объект, если данных нет
        }

        const now = new Date();
        // Используем начало текущего дня для 30 дней назад
        const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0); // Обнуляем время для точного сравнения

        // Используем начало текущего дня для года назад
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        oneYearAgo.setHours(0, 0, 0, 0); // Обнуляем время для точного сравнения


        let filteredSpendings = [];
        let summary = {};

        switch (selectedPeriod) {
            case 'currentMonth':
                if (categoriesMonthSummary && typeof categoriesMonthSummary === 'object') {
                    summary = categoriesMonthSummary;
                } else {
                    summary = {};
                }
                break;
            case 'last30Days':
                filteredSpendings = spendings.filter(s => {
                    const spendingDate = new Date(s.date);
                    spendingDate.setHours(0, 0, 0, 0); // Обнуляем время для сравнения
                    return spendingDate >= thirtyDaysAgo;
                });
                break;
            case 'lastYear':
                filteredSpendings = spendings.filter(s => {
                    const spendingDate = new Date(s.date);
                    spendingDate.setHours(0, 0, 0, 0); // Обнуляем время для сравнения
                    return spendingDate >= oneYearAgo;
                });
                break;
            case 'allTime':
                filteredSpendings = spendings; // Все расходы
                break;
            default:
                summary = {};
        }

        // Агрегация для 'last30Days', 'lastYear', 'allTime'
        if (selectedPeriod !== 'currentMonth') {
            filteredSpendings.forEach(spending => {
                if (spending.category_name && typeof spending.amount === 'number') {
                    summary[spending.category_name] = (summary[spending.category_name] || 0) + spending.amount;
                }
            });
        }
        // === ДОБАВЛЕНО ДЛЯ ОТЛАДКИ ===
        console.log("Aggregated summary for period:", selectedPeriod, summary);
        // === КОНЕЦ ОТЛАДКИ ===
        return summary;
    }, [spendings, selectedPeriod, categoriesMonthSummary]);

    const chartData = useMemo(() => {
        return Object.entries(aggregatedData).map(([name, value]) => ({
            name, value: Number(value)
        }));
    }, [aggregatedData]);

    const hasData = chartData.length > 0;
    const totalAmount = chartData.reduce((sum, entry) => sum + entry.value, 0);

    const isLoading = spendingsLoading || categoriesMonthLoading;

    // ИСПРАВЛЕНО: Возвращаем наш periodText без скобок
    const periodText = useMemo(() => {
        switch (selectedPeriod) {
            case 'currentMonth':
                return ' в текущем месяце';
            case 'last30Days':
                return ' за последние 30 дней';
            case 'lastYear':
                return ' за последний год';
            case 'allTime':
                return ' за все время';
            default:
                return '';
        }
    }, [selectedPeriod]);


    if (!isOpen) return null;


    return (<AnimatePresence>
            {isOpen && (<motion.div
                    className="fixed inset-0 flex justify-center z-50 items-start pt-[10vh] backdrop-blur-xs bg-black/20" // Убрана opacity из бэкдропа
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            onClose();
                        }
                    }}
                >
                    <motion.div
                        className="p-4 rounded-lg shadow-2xl w-full max-w-2xl bg-yellow-50 border border-gray-300 relative max-h-[80vh] mx-4 overflow-y-auto" // Изменен цвет фона на yellow-50 и добавлен my-4
                        variants={modalVariants}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <Text variant="h3" className="text-2xl font-semibold text-gray-800">
                                {title} {periodText} {/* ИСПОЛЬЗУЕМ periodText БЕЗ СКОБОК */}
                            </Text>
                            <IconButton onClick={onClose} aria-label="Закрыть модальное окно" icon={XIcon}/>
                        </div>
                        <div className="modal-content">
                            <div className="flex flex-wrap gap-2 mb-4 justify-center">
                                <TextButton
                                    onClick={() => setSelectedPeriod('currentMonth')}
                                    isActive={selectedPeriod === 'currentMonth'}
                                >
                                    Текущий месяц
                                </TextButton>
                                <TextButton
                                    onClick={() => setSelectedPeriod('last30Days')}
                                    isActive={selectedPeriod === 'last30Days'}
                                >
                                    Последние 30 дней
                                </TextButton>
                                <TextButton
                                    onClick={() => setSelectedPeriod('lastYear')}
                                    isActive={selectedPeriod === 'lastYear'}
                                >
                                    Последний год
                                </TextButton>
                                <TextButton
                                    onClick={() => setSelectedPeriod('allTime')}
                                    isActive={selectedPeriod === 'allTime'}
                                >
                                    Все время
                                </TextButton>
                            </div>

                            {isLoading ? (<div className="flex justify-center items-center h-80">
                                    <Text variant="body" className="text-gray-500">Загрузка данных...</Text>
                                </div>) : hasData ? (
                                <ResponsiveContainer width="100%" height={380}> {/* Увеличена высота */}
                                    <PieChart
                                        margin={{top: 20, right: 30, left: 30, bottom: 20}}> {/* Добавлены отступы */}
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            paddingAngle={3}
                                            dataKey="value"
                                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={true}
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
                                        </Pie>
                                        <Tooltip formatter={(value, name) => [`${value.toLocaleString()} руб.`, name]}/>
                                        <Legend
                                            verticalAlign="bottom" // Легенда снизу
                                            align="center"      // По центру
                                            height={36}         // Высота легенды, чтобы было место
                                            wrapperStyle={{paddingTop: '20px'}} // Отступ сверху для легенды
                                        />
                                        {/* ВОССТАНОВЛЕНО КАК В ТВОЕМ "СТАРОМ ФАЙЛЕ". Я НЕ БУДУ ЭТО ТРОГАТЬ. */}
                                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
                                              className="text-xl font-bold fill-gray-700">
                                            {`₽${totalAmount.toLocaleString()}`}
                                        </text>
                                    </PieChart>
                                </ResponsiveContainer>) : (<div className="flex justify-center items-center h-80">
                                    <Text variant="body" className="text-gray-500">
                                        Нет данных о расходах для выбранного периода.
                                    </Text>
                                </div>)}
                        </div>
                    </motion.div>
                </motion.div>)}
        </AnimatePresence>);
};

export default CategoryDistributionChartModal;