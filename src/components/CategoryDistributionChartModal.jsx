// src/components/CategoryDistributionChartModal.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
//eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import Text from './ui/Text';
import IconButton from './ui/IconButton.jsx';
import TextButton from './ui/TextButton';
import { XMarkIcon as XIcon } from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Импортируем сторы для получения данных
import useSpendingsStore from '../stores/spendingsStore';
import useCategoryStore from '../stores/categoryStore';

// Импортируем нашу новую функцию агрегации
import { aggregateSpendingsByCategory } from '../utils/spendingAggregator';

// Цвета для секторов диаграммы
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A4DDED', '#C1A4DE', '#F7B7A3', '#DE5254'];

const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
};

const modalVariants = {
    hidden: { y: "-100vh", opacity: 0 },
    visible: { y: "0", opacity: 1, transition: { delay: 0.1 } },
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        // payload[0] содержит данные первого элемента (твоей категории)
        const data = payload[0];
        return (
            <div className="
                bg-white
                p-2             // Уменьшаем паддинг (было p-2, можно сделать p-1 или p-x)
                border
                border-gray-300
                rounded-md      // Закругляем углы (было rounded, теперь rounded-md)
                shadow-lg       // Делаем тень более выраженной, или shadow-sm для меньшей
                text-sm         // Уменьшаем размер текста
                flex flex-col   // Используем flexbox для аккуратного размещения элементов
                items-start     // Выравнивание текста по левому краю
            ">
                {/* name - это название категории (например, "Дети"), value - это сумма */}
                <p className="font-semibold text-gray-800">{`${data.name}: ${data.value.toLocaleString()} руб.`}</p>
                {/* Если хочешь, можешь добавить процент или другую информацию */}
                {/* <p className="text-gray-600">{`Доля: ${(data.percent * 100).toFixed(0)}%`}</p> */}
            </div>
        );
    }
    return null;
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

const CategoryDistributionChartModal = ({ isOpen, onClose, title }) => {
    const { spendings, loading: spendingsLoading, fetchSpendings } = useSpendingsStore();
    const { categories, categoriesLoading, fetchCategories, categoriesMonthSummary, loading: categoriesMonthSummaryLoading, fetchCategoriesMonthSummary } = useCategoryStore();

    const [selectedPeriod, setSelectedPeriod] = useState('currentMonth');
    const windowWidth = useWindowWidth(); // ИСПОЛЬЗУЕМ ХУК

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

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
                fetchCategories();
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

    // ОПРЕДЕЛЯЕМ, ПОКАЗЫВАТЬ ЛИ ЛЕЙБЛЫ
    // TailwindCSS 'md' breakpoint обычно 768px.
    // Если меньше, не показываем лейблы, только тултип.
    const showLabels = windowWidth >= 768; // Можно настроить это значение

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
                                            // УСЛОВНОЕ ОТОБРАЖЕНИЕ ЛЕЙБЛОВ
                                            label={showLabels ? ({ name, percent }) => {
                                                const displayPercent = (percent * 100).toFixed(0);
                                                const maxLength = 15;
                                                const displayedName = name.length > maxLength
                                                    ? `${name.substring(0, maxLength - 3)}...`
                                                    : name;

                                                return `${displayedName} ${displayPercent}%`;
                                            } : null} // Если showLabels false, label равен null (не отображается)
                                            labelLine={showLabels} // labelLine также зависит от showLabels
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
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