// src/components/CategoryDistributionChartModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Text from './ui/Text';
import IconButton from './ui/IconButton.jsx';
import TextButton from './ui/TextButton';
import { XMarkIcon as XIcon } from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Импортируем сторы для получения данных
import useSpendingsStore from '../stores/spendingsStore';
import useCategoryStore from '../stores/categoryStore';

// Цвета для секторов диаграммы (можно использовать те же, что и в виджете, или расширить)
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A4DDED', '#C1A4DE', '#F7B7A3', '#DE5254'];

const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
};

const modalVariants = {
    hidden: { y: "-100vh", opacity: 0 },
    visible: { y: "0", opacity: 1, transition: { delay: 0.1 } },
};

const CategoryDistributionChartModal = ({ isOpen, onClose, title }) => {
    const { spendings, loading: spendingsLoading, fetchSpendings } = useSpendingsStore();
    const { categoriesMonthSummary, loading: categoriesMonthLoading, fetchCategoriesMonthSummary } = useCategoryStore();

    const [selectedPeriod, setSelectedPeriod] = useState('currentMonth');

    useEffect(() => {
        if (isOpen) {
            if (!spendings && !spendingsLoading) {
                fetchSpendings();
            }
            if (!categoriesMonthSummary && !categoriesMonthLoading) {
                fetchCategoriesMonthSummary();
            }
        }
    }, [isOpen, spendings, spendingsLoading, fetchSpendings, categoriesMonthSummary, categoriesMonthLoading, fetchCategoriesMonthSummary]);

    const aggregatedData = useMemo(() => {
        if (!spendings || spendings.length === 0) return {};

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

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
                filteredSpendings = spendings.filter(s => new Date(s.date) >= thirtyDaysAgo);
                break;
            case 'lastYear':
                filteredSpendings = spendings.filter(s => new Date(s.date) >= oneYearAgo);
                break;
            case 'allTime':
                filteredSpendings = spendings;
                break;
            default:
                summary = {};
        }

        if (selectedPeriod !== 'currentMonth') {
            filteredSpendings.forEach(spending => {
                if (spending.category_name && typeof spending.amount === 'number') {
                    summary[spending.category_name] = (summary[spending.category_name] || 0) + spending.amount;
                }
            });
        }
        return summary;
    }, [spendings, selectedPeriod, categoriesMonthSummary]);

    const chartData = useMemo(() => {
        return Object.entries(aggregatedData).map(([name, value]) => ({
            name,
            value: Number(value)
        }));
    }, [aggregatedData]);

    const hasData = chartData.length > 0;
    const totalAmount = chartData.reduce((sum, entry) => sum + entry.value, 0);

    const isLoading = spendingsLoading || categoriesMonthLoading;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    // ИЗМЕНЕНО: Классы для прозрачно-размытого фона из Modal.jsx
                    className="fixed inset-0 flex justify-center z-50 items-start pt-[10vh] backdrop-blur-xs mx-2 bg-white/20"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    // Добавляем обработчик onClick для закрытия модалки по клику вне неё
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            onClose();
                        }
                    }}
                >
                    <motion.div
                        // ИЗМЕНЕНО: Классы для внутреннего контейнера модалки из Modal.jsx (с небольшими корректировками)
                        className="p-4 rounded-lg shadow-2xl w-full max-w-2xl bg-green-100 border border-gray-300 relative max-h-[80vh] overflow-y-auto" // max-w-2xl вместо max-w-md
                        variants={modalVariants}
                        // Останавливаем всплытие события, чтобы клик внутри модалки не закрывал её
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <Text variant="h3" className="text-2xl font-semibold text-gray-800">
                                {title}
                            </Text>
                            <IconButton onClick={onClose} aria-label="Закрыть модальное окно" icon={XIcon} />
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
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            paddingAngle={3}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={true}
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value, name) => [`${value.toLocaleString()} руб.`, name]} />
                                        <Legend />
                                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-xl font-bold fill-gray-700">
                                            Всего: {totalAmount.toLocaleString()}
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