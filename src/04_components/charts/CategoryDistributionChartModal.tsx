// src/components/CategoryDistributionChartModal.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Text from '../ui/Text';
import IconButton from '../ui/IconButton';
import TextButton from '../ui/TextButton';
import { XMarkIcon as XIcon } from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Импортируем сторы для получения данных
import useSpendingsStore from '../../02_stores/spendingsStore/spendingsStore';
import useCategoryStore from '../../02_stores/categoryStore/categoryStore';

// Импортируем нашу функцию агрегации
import { aggregateSpendingsByCategory } from '../../07_utils/spendingAggregator';

// Типы для компонента
interface ChartDataItem {
    name: string;
    value: number;
}

type SelectedPeriod = 'currentMonth' | 'last30Days' | 'lastYear' | 'allTime';

interface CategoryDistributionChartModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
}

interface CustomRechartsTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
    }>;
}

const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
};

const modalVariants = {
    hidden: { y: "-100vh", opacity: 0 },
    visible: { y: "0", opacity: 1, transition: { delay: 0.1 } },
};

// ХУК ДЛЯ ОТСЛЕЖИВАНИЯ ШИРИНЫ ОКНА
const useWindowWidth = (): number => {
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

    useEffect(() => {
        const handleResize = (): void => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return windowWidth;
};

// Кастомный компонент для тултипа Recharts
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

const CategoryDistributionChartModal: React.FC<CategoryDistributionChartModalProps> = ({
                                                                                           isOpen,
                                                                                           onClose,
                                                                                           title
                                                                                       }) => {
    const { spendings, loading: spendingsLoading, fetchSpendings } = useSpendingsStore();
    const {
        categories,
        loading: categoriesLoading,
        fetchCategories,
        categoriesMonth,
        loading: categoriesMonthLoading,
        getCategoriesMonth,
        categoryColorMap
    } = useCategoryStore();

    const [selectedPeriod, setSelectedPeriod] = useState<SelectedPeriod>('currentMonth');
    const windowWidth = useWindowWidth();

    const handleClose = useCallback((): void => {
        onClose();
    }, [onClose]);

    const aggregatedData = useMemo((): Record<string, number> => {
        console.log("Aggregating data for period:", selectedPeriod);
        console.log("Spendings available for aggregation:", spendings);
        console.log("Categories available for aggregation:", categories);
        console.log("categoriesMonth available for aggregation (for currentMonth):", categoriesMonth);

        if (selectedPeriod === 'currentMonth') {
            if (categoriesMonth && typeof categoriesMonth === 'object' && Object.keys(categoriesMonth).length > 0) {
                return categoriesMonth;
            }
            return {};
        } else {
            if (spendings && categories) {
                return aggregateSpendingsByCategory(spendings, categories, selectedPeriod);
            }
            return {};
        }
    }, [spendings, categories, selectedPeriod, categoriesMonth]);

    const chartData = useMemo((): ChartDataItem[] => {
        return Object.entries(aggregatedData)
            .map(([name, value]) => ({
                name,
                value: Number(value)
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [aggregatedData]);

    const hasData: boolean = chartData.length > 0;
    const totalAmount: number = chartData.reduce((sum, entry) => sum + entry.value, 0);

    const isLoading: boolean = spendingsLoading || categoriesLoading || categoriesMonthLoading;

    const periodText = useMemo((): string => {
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
            if (!categoriesMonth && !categoriesMonthLoading) {
                getCategoriesMonth();
            }

            const handleEscape = (event: KeyboardEvent): void => {
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
        categoriesMonth,
        categoriesMonthLoading,
        getCategoriesMonth,
        handleClose
    ]);

    if (!isOpen) return null;

    const showLabels: boolean = windowWidth >= 768;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 flex justify-center z-50 items-start pt-[10vh] backdrop-blur-xs bg-black/20"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                        if (event.target === event.currentTarget) {
                            handleClose();
                        }
                    }}
                >
                    <motion.div
                        className="p-4 rounded-lg shadow-2xl w-full max-w-2xl bg-yellow-50 border border-gray-300 relative max-h-[80vh] mx-4 overflow-y-auto"
                        variants={modalVariants}
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
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
                                    className={selectedPeriod === 'currentMonth' ? 'active' : ''}
                                >
                                    Текущий месяц
                                </TextButton>
                                <TextButton
                                    onClick={() => setSelectedPeriod('last30Days')}
                                    className={selectedPeriod === 'last30Days' ? 'active' : ''}
                                >
                                    Последние 30 дней
                                </TextButton>
                                <TextButton
                                    onClick={() => setSelectedPeriod('lastYear')}
                                    className={selectedPeriod === 'lastYear' ? 'active' : ''}
                                >
                                    Последний год
                                </TextButton>
                                <TextButton
                                    onClick={() => setSelectedPeriod('allTime')}
                                    className={selectedPeriod === 'allTime' ? 'active' : ''}
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
                                            label={showLabels ? ({ name, percent }: { name: string; percent: number }) => {
                                                const displayPercent = (percent * 100).toFixed(0);
                                                const maxLength = 15;
                                                const displayedName = name.length > maxLength
                                                    ? `${name.substring(0, maxLength - 3)}...`
                                                    : name;

                                                return `${displayedName} ${displayPercent}%`;
                                            } : undefined}
                                            labelLine={showLabels}
                                        >
                                            {chartData.map((entry) => (
                                                <Cell
                                                    key={entry.name}
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
