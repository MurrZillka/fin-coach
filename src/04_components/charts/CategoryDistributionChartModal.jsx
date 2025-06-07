// src/components/CategoryDistributionChartModal.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import Text from '../ui/Text.tsx';
import IconButton from '../ui/IconButton.tsx';
import TextButton from '../ui/TextButton.jsx';
import { XMarkIcon as XIcon } from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Импортируем сторы для получения данных
import useSpendingsStore from '../../02_stores/spendingsStore/spendingsStore.ts';
import useCategoryStore from '../../02_stores/categoryStore/categoryStore.ts'; // НОВОЕ: Импортируем categoryStore

// Импортируем нашу функцию агрегации
import { aggregateSpendingsByCategory } from '../../07_utils/spendingAggregator.js';

// УДАЛЯЕМ старую константу COLORS, она теперь в constants/colors.js и управляется стором
// const COLORS = [
//     '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
//     '#A4DDED', '#C1A4DE', '#8A2BE2', '#DEB887', '#5F9EA0', '#D2691E', '#FF7F50', '#6495ED',
//     '#DC143C', '#00FFFF', '#00008B', '#008B8B', '#B8860B', '#A9A9A9', '#006400', '#BDB76B'
// ];


const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
};

const modalVariants = {
    hidden: { y: "-100vh", opacity: 0 },
    visible: { y: "0", opacity: 1, transition: { delay: 0.1 } },
};

// ХУК ДЛЯ ОТСЛЕЖИВАНИЯ ШИРИНЫ ОКНА
const useWindowWidth = () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return windowWidth;
};
// КОНЕЦ ХУКА

// Кастомный компонент для тултипа Recharts
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


const CategoryDistributionChartModal = ({ isOpen, onClose, title }) => {
    const { spendings, loading: spendingsLoading, fetchSpendings } = useSpendingsStore();
    // НОВОЕ: Получаем categoryColorMap из useCategoryStore
    const { categories, categoriesLoading, fetchCategories, categoriesMonthSummary, loading: categoriesMonthSummaryLoading, fetchCategoriesMonthSummary, categoryColorMap } = useCategoryStore();

    const [selectedPeriod, setSelectedPeriod] = useState('currentMonth');
    const windowWidth = useWindowWidth();

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    // УДАЛЯЕМ: Локальный маппинг цветов, он теперь в сторе
    // const categoryColorMap = useRef({});
    // const colorIndex = useRef(0);
    // const getCategoryColor = useCallback((categoryName) => { /* ... */ }, []);


    const aggregatedData = useMemo(() => {
        console.log("Aggregating data for period:", selectedPeriod);
        console.log("Spendings available for aggregation:", spendings);
        console.log("Categories available for aggregation:", categories);
        console.log("categoriesMonthSummary available for aggregation (for currentMonth):", categoriesMonthSummary);

        if (selectedPeriod === 'currentMonth') {
            if (categoriesMonthSummary && typeof categoriesMonthSummary === 'object' && Object.keys(categoriesMonthSummary).length > 0) {
                return categoriesMonthSummary;
            }
            return {};
        } else {
            if (spendings && categories) {
                return aggregateSpendingsByCategory(spendings, categories, selectedPeriod);
            }
            return {};
        }
    }, [spendings, categories, selectedPeriod, categoriesMonthSummary]);

    const chartData = useMemo(() => {
        return Object.entries(aggregatedData)
            .map(([name, value]) => ({
                name,
                value: Number(value)
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [aggregatedData]);

    const hasData = chartData.length > 0;
    const totalAmount = chartData.reduce((sum, entry) => sum + entry.value, 0);

    const isLoading = spendingsLoading || categoriesLoading || categoriesMonthSummaryLoading;

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

    useEffect(() => {
        if (isOpen) {
            if (!spendings && !spendingsLoading) {
                fetchSpendings();
            }
            if (!categories && !categoriesLoading) {
                fetchCategories(); // Это вызовет обновление categoryColorMap в сторе
            }
            if (!categoriesMonthSummary && !categoriesMonthSummaryLoading) {
                fetchCategoriesMonthSummary();
            }

            const handleEscape = (event) => {
                if (event.key === 'Escape') {
                    handleClose();
                }
            };
            window.addEventListener('keydown', handleEscape);

            return () => {
                window.removeEventListener('keydown', handleEscape);
            };
        }
    }, [
        isOpen,
        spendings,
        spendingsLoading,
        fetchSpendings,
        categories,
        categoriesLoading,
        fetchCategories,
        categoriesMonthSummary,
        categoriesMonthSummaryLoading,
        fetchCategoriesMonthSummary,
        handleClose
    ]);

    if (!isOpen) return null;

    const showLabels = windowWidth >= 768;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 flex justify-center z-50 items-start pt-[10vh] backdrop-blur-xs bg-black/20"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            handleClose();
                        }
                    }}
                >
                    <motion.div
                        className="p-4 rounded-lg shadow-2xl w-full max-w-2xl bg-yellow-50 border border-gray-300 relative max-h-[80vh] mx-4 overflow-y-auto"
                        variants={modalVariants}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <Text variant="h3" className="text-2xl font-semibold text-gray-800">
                                {title} {periodText}
                            </Text>
                            <IconButton onClick={handleClose} aria-label="Закрыть модальное окно" icon={XIcon} />
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

                            {isLoading ? (
                                <div className="flex justify-center items-center h-80">
                                    <Text variant="body" className="text-gray-500">Загрузка данных...</Text>
                                </div>
                            ) : hasData ? (
                                <ResponsiveContainer width="100%" height={380}>
                                    <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            paddingAngle={3}
                                            dataKey="value"
                                            label={showLabels ? ({ name, percent }) => {
                                                const displayPercent = (percent * 100).toFixed(0);
                                                const maxLength = 15;
                                                const displayedName = name.length > maxLength
                                                    ? `${name.substring(0, maxLength - 3)}...`
                                                    : name;

                                                return `${displayedName} ${displayPercent}%`;
                                            } : null}
                                            labelLine={showLabels}
                                        >
                                            {chartData.map((entry) => (
                                                <Cell
                                                    key={entry.name} // Используем имя категории как ключ для стабильности
                                                    // НОВОЕ: Получаем цвет из categoryColorMap, переданного из стора
                                                    // Предоставляем резервный цвет (#CCCCCC) на случай, если категория не найдена в маппинге
                                                    fill={categoryColorMap[entry.name] || '#CCCCCC'}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomRechartsTooltip />} />
                                        <Legend
                                            verticalAlign="bottom"
                                            align="center"
                                            height={36}
                                            wrapperStyle={{ paddingTop: '20px' }}
                                        />
                                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
                                              className="text-xl font-bold fill-gray-700">
                                            {`₽${totalAmount.toLocaleString()}`}
                                        </text>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex justify-center items-center h-80">
                                    <Text variant="body" className="text-gray-500">
                                        Нет данных о расходах для выбранного периода.
                                    </Text>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CategoryDistributionChartModal;