import React, {useMemo, useState} from 'react';
import Text from '../04_components/ui/Text.js';
import Loader from '../04_components/ui/Loader';
import RecommendationsModal from '../04_components/ui/RecommendationsModal.tsx';

import CategoryDistributionWidget from '../04_components/widgets/CategoryDistributionWidget.jsx';
import CategoryDistributionChartModal from '../04_components/charts/CategoryDistributionChartModal.jsx';
import useSpendingsStore from '../02_stores/spendingsStore/spendingsStore.ts';
import useCreditStore from '../02_stores/creditsStore/creditStore.ts';
import useGoalsStore from '../02_stores/goalsStore/goalsStore.ts';
import useBalanceStore from '../02_stores/balanceStore/balanceStore.ts';
import useMainPageStore from '../02_stores/mainPageStore';
import useModalStore from '../02_stores/modalStore';
import useCategoryStore from '../02_stores/categoryStore/categoryStore.ts'; // Импортируем useCategoryStore
import TextButton from '../04_components/ui/TextButton';

import RecentIncomeWidget from '../04_components/widgets/RecentIncomeWidget.jsx';
import RecentExpenseWidget from '../04_components/widgets/RecentExpenseWidget.jsx';
import GoalsSummaryWidget from '../04_components/widgets/GoalsSummaryWidget.jsx';
import IncomeExpenseChart from '../04_components/charts/IncomeExpenseChart.jsx';
import {useNavigate} from "react-router-dom";
import {aggregateSpendingsByCategory} from "../07_utils/spendingAggregator.js";


export default function MainPage() {
    const {spendings, loading: spendingsLoading, error: spendingsError} = useSpendingsStore();
    const {credits, loading: creditsLoading, error: creditsError} = useCreditStore();
    const {goals, currentGoal, loading: goalsLoading, error: goalsError} = useGoalsStore();
    const {balance, isLoading: isBalanceLoading, error: balanceError} = useBalanceStore();
    // Получаем из стора Main Page (рекомендации, обзор)
    const {
        recommendations, financialEntries,
        loading: mainPageLoading, error: mainPageError,
    } = useMainPageStore();

    // Получаем данные из categoryStore, включая все категории
    const {
        categoriesMonthSummary,
        loading: categoriesMonthLoading,
        categories,
        loading: categoriesLoading,
    } = useCategoryStore();

    // Получаем modalType из useModalStore для правильного отображения ошибок
    const {modalType} = useModalStore();

    const navigate = useNavigate();
    const [isRecommendationsModalOpen, setIsRecommendationsModalOpen] = useState(false);
    const [isCategoryChartModalOpen, setIsCategoryChartModalOpen] = useState(false);

    // --- ДОБАВЛЕНО/ИЗМЕНЕНО: Агрегация всех расходов по категориям за все время ---
    const allTimeCategoriesSummary = useMemo(() => {
        // Если spendings или categories еще null/undefined, возвращаем пустой объект
        if (!spendings || !categories) {
            console.log('allTimeCategoriesSummary useMemo: spendings or categories is null/undefined, returning empty object.');
            return {};
        }
        // --- Ключевое изменение: Используем существующую функцию aggregateSpendingsByCategory ---
        // Эта функция, по твоим словам, уже правильно "разворачивает" периодические расходы,
        // как это делает модалка для периода "Все время".
        const summary = aggregateSpendingsByCategory(spendings, categories, 'allTime');

        console.log('allTimeCategoriesSummary useMemo: Aggregated summary using aggregateSpendingsByCategory:', summary);
        console.log('allTimeCategoriesSummary useMemo: Number of unique categories:', Object.keys(summary).length);
        return summary;
    }, [spendings, categories]); // Пересчитываем только когда spendings ИЛИ categories меняются


    // Определяем, идет ли какая-либо загрузка основных данных для страницы
    const isLoadingData = spendingsLoading || creditsLoading || goalsLoading || isBalanceLoading || mainPageLoading || categoriesMonthLoading || categoriesLoading;
    const hasAnyData =
        (spendings !== null && spendings.length > 0) ||
        (credits !== null && credits.length > 0) ||
        (goals !== null && goals.length > 0) ||
        (recommendations !== null && recommendations.length > 0) ||
        (Object.keys(allTimeCategoriesSummary).length > 0); // ИЗМЕНЕНО: Добавлена проверка на allTimeCategoriesSummary


    // Условие для показа полноэкранного лоадера
    const showFullPageLoader = isLoadingData && (
        spendings === null || credits === null || goals === null || balance === null ||
        recommendations === null || financialEntries === null || categoriesMonthSummary === null || categories === null // ДОБАВЛЕНО: categories === null
    );


    // Обработчики кликов
    const handleViewIncomeClick = () => {
        navigate('/credits')
    };
    const handleViewExpensesClick = () => {
        navigate('/spendings');
    };
    const handleViewGoalsClick = () => {
        navigate('/goals')
    };

    const handleOpenRecommendationsModal = () => {
        console.log('MainPage: Opening recommendations modal.');
        setIsRecommendationsModalOpen(true);
    };

    const handleCloseRecommendationsModal = () => {
        console.log('MainPage: Closing recommendations modal.');
        setIsRecommendationsModalOpen(false);
    };

    const handleOpenCategoryChartModal = () => {
        console.log('MainPage: Opening category chart modal.');
        setIsCategoryChartModalOpen(true);
    };

    const handleCloseCategoryChartModal = () => {
        console.log('MainPage: Closing category chart modal.');
        setIsCategoryChartModalOpen(false);
    };


    // Определяем, следует ли показать общую ошибку (из любого стора)
    const displayError = spendingsError || creditsError || goalsError || balanceError || mainPageError;


    // Условный рендеринг компонента
    if (showFullPageLoader) {
        console.log('Showing full ui loader...');
        return <Loader/>;
    }
    console.log('Not showing full ui loader. State:', {
        isLoadingData, hasAnyData,
        spendings: spendings?.length, credits: credits?.length, goals: goals?.length, balance,
        recommendations: recommendations?.length, financialEntries: financialEntries?.length,
        categoriesMonthSummary: categoriesMonthSummary ? Object.keys(categoriesMonthSummary).length : 0,
        allTimeCategoriesSummary: Object.keys(allTimeCategoriesSummary).length, // ИЗМЕНЕНО: Добавили allTimeCategoriesSummary в лог
        categories: categories?.length // ДОБАВЛЕНО: Добавили категории в лог
    });

    const showCategoryDistributionWidget =
        spendings !== null &&
        categories !== null && // ДОБАВЛЕНО: Проверяем, что категории загружены
        Object.keys(allTimeCategoriesSummary).length >= 2;
    // --- Конец ИЗМЕНЕНО ---


    return (
        <div className="bg-secondary-50">
            <main className="max-w-7xl mx-auto p-4">

                {/* Header section: Title and Recommendations Button */}
                <div className="flex justify-between items-center mb-4">
                    <Text variant="h2">Обзор</Text>
                    {/* --- ИЗМЕНЕННОЕ УСЛОВИЕ ДЛЯ КНОПКИ РЕКОМЕНДАЦИЙ (ПРАВИЛЬНОЕ) --- */}
                    {/* Кнопка "Рекомендации" отображается, если:
                        1. Идет загрузка рекомендаций (mainPageLoading)
                        2. ИЛИ (есть текущая цель (currentGoal не null)
                           И (есть загруженные рекомендации (recommendations не пустые)))
                    */}
                    {mainPageLoading || (currentGoal !== null && recommendations !== null && recommendations.length > 0) ? (
                        <TextButton
                            onClick={handleOpenRecommendationsModal}
                            disabled={mainPageLoading} // Кнопка должна быть заблокирована во время загрузки
                        >
                            {mainPageLoading ? 'Загрузка...' : 'Рекомендации'}
                        </TextButton>
                    ) : (
                        null
                    )}
                    {/* --- КОНЕЦ ИЗМЕНЕННОГО УСЛОВИЯ --- */}
                </div>

                {/* Display general error message */}
                {displayError && modalType === null && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {displayError.message}
                    </div>
                )}

                {/* Приветственное сообщение */}
                {/* Теперь также проверяем, что showCategoryDistributionWidget ложно */}
                {!isLoadingData && !hasAnyData && !showCategoryDistributionWidget ? ( // ИЗМЕНЕНО: Добавили !showCategoryDistributionWidget
                    <div className="mb-6 p-4 bg-blue-100 border border-blue-300 text-blue-800 rounded-md shadow-sm">
                        <Text variant="body">
                            Добро пожаловать! Здесь вы сможете отслеживать свои финансы.
                            Для начала работы добавьте ваши первые доходы, расходы или поставьте финансовую цель через
                            соответствующие разделы меню.
                            Когда появятся данные, здесь также будут отображаться рекомендации и аналитика.
                        </Text>
                    </div>
                ) : null}

                {/* Сетка виджетов и графика */}
                {(hasAnyData || isLoadingData || showCategoryDistributionWidget) && (
                    <div
                        className={`grid grid-cols-1 md:grid-cols-2 ${showCategoryDistributionWidget ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 ${!isLoadingData && !hasAnyData && !showCategoryDistributionWidget ? '' : 'mt-6'}`}>
                        {/* Блок для Графика Доходов/Расходов */}
                        {/* Здесь тоже нужно изменить col-span, если сетка теперь 4 колонки */}
                        {/* col-span-full md:col-span-2 lg:col-span-4 (чтобы он занимал всю ширину новой сетки) */}
                        <div className="col-span-full md:col-span-2 lg:col-span-4"> {/* ИЗМЕНЕНО */}
                            <IncomeExpenseChart
                                credits={credits}
                                spendings={spendings}
                                isLoadingData={isLoadingData}
                                handleViewIncomeClick={handleViewIncomeClick}
                                handleViewExpensesClick={handleViewExpensesClick}
                            />
                        </div>


                        {/* Эти виджеты уже имеют col-span-full md:col-span-1, они автоматически займут по 1 колонке из 4 */}
                        <div className="col-span-full md:col-span-1 bg-white p-4 rounded-md shadow-md">
                            <RecentIncomeWidget
                                recentIncomes={credits}
                                loading={creditsLoading}
                                onViewCategoryClick={handleViewIncomeClick}
                                categoryName="Доходы"
                            />
                        </div>

                        <div className="col-span-full md:col-span-1 bg-white p-4 rounded-md shadow-md">
                            <RecentExpenseWidget
                                recentSpendings={spendings}
                                loading={spendingsLoading}
                                onViewCategoryClick={handleViewExpensesClick}
                                categoryName="Расходы"
                            />
                        </div>

                        <div className="col-span-full md:col-span-1 bg-white p-4 rounded-md shadow-md">
                            <GoalsSummaryWidget
                                goals={goals}
                                currentGoal={currentGoal}
                                loading={goalsLoading}
                                onViewCategoryClick={handleViewGoalsClick}
                                categoryName="Цели"
                            />
                        </div>

                        {/* Блок для Виджета "Анализ расходов по категориям" */}
                        {showCategoryDistributionWidget && (
                            <div className="col-span-full md:col-span-1 bg-white p-4 rounded-md shadow-md">
                                <CategoryDistributionWidget
                                    onOpenChart={handleOpenCategoryChartModal}
                                    loading={spendingsLoading || categoriesLoading}
                                    allTimeCategoriesSummary={allTimeCategoriesSummary}
                                />
                            </div>
                        )}

                        {/* Индикатор фоновой загрузки */}
                        {!showFullPageLoader && isLoadingData && hasAnyData && (
                            <div className="col-span-full text-center mt-4"> {/* Возможно, здесь тоже col-span-4 */}
                                <Text variant="body">Обновление данных...</Text>
                            </div>
                        )}
                    </div>
                )}
            </main>
            {/* Модалка для отображения рекомендаций */}
            <RecommendationsModal
                isOpen={isRecommendationsModalOpen}
                onClose={handleCloseRecommendationsModal}
                title="Рекомендации"
            >
                {mainPageLoading ? (
                    <Text variant="body">Загрузка рекомендаций...</Text>
                ) : recommendations && recommendations.length > 0 ? (
                    <div>
                        <ul className="space-y-4">
                            {recommendations.map((rec, index) => {
                                return (
                                    <li key={index} className="p-3 bg-blue-50 rounded-md border border-blue-100">
                                        {rec?.name && (
                                            <Text
                                                variant="body"
                                                className="font-semibold text-blue-800 text-sm block mb-2"
                                            >
                                                {rec.name}
                                            </Text>
                                        )}
                                        {rec?.description && (
                                            <Text
                                                variant="body"
                                                className="text-gray-700 text-sm leading-none"
                                            >
                                                {rec.description}
                                            </Text>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ) : (
                    !mainPageLoading && (recommendations === null || recommendations.length === 0) ? (
                        <Text variant="body">Нет рекомендаций для отображения.</Text>
                    ) : null
                )}
            </RecommendationsModal>

            {/* Модалка для круговой диаграммы расходов по категориям */}
            <CategoryDistributionChartModal
                isOpen={isCategoryChartModalOpen}
                onClose={handleCloseCategoryChartModal}
                title="Распределение расходов по категориям"
            >
                {/* Здесь будет логика для полной диаграммы и кнопок фильтрации */}
                <Text variant="body">Здесь будет круговая диаграмма и кнопки выбора периода.</Text>
            </CategoryDistributionChartModal>
        </div>
    );
}