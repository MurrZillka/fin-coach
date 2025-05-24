import React, {useEffect, useState, useMemo} from 'react';
// Импортируем компоненты UI
import Text from '../components/ui/Text';
// Импортируем компонент Loader для плавной загрузки
import Loader from '../components/ui/Loader';

import RecommendationsModal from '../components/RecommendationsModal';

// --- НОВЫЕ ИМПОРТЫ: Виджет и Модалка для распределения категорий ---
import CategoryDistributionWidget from '../components/CategoryDistributionWidget';
import CategoryDistributionChartModal from '../components/CategoryDistributionChartModal';
// --- Конец НОВЫХ ИМПОРТОВ ---

// Импортируем сторы для получения данных
import useSpendingsStore from '../stores/spendingsStore';
import useCreditStore from '../stores/creditStore';
import useGoalsStore from '../stores/goalsStore';
import useBalanceStore from '../stores/balanceStore';
// Импортируем стор для главной страницы (рекомендации, обзор)
import useMainPageStore from '../stores/mainPageStore';
// Импортируем useModalStore для проверки modalType при отображении ошибок
import useModalStore from '../stores/modalStore';
import useCategoryStore from '../stores/categoryStore'; // Импортируем useCategoryStore

import TextButton from '../components/ui/TextButton';

// Импортируем разработанные компоненты виджетов
import RecentIncomeWidget from '../components/RecentIncomeWidget';
import RecentExpenseWidget from '../components/RecentExpenseWidget';
import GoalsSummaryWidget from '../components/GoalsSummaryWidget';
// Импортируем компонент графика
import IncomeExpenseChart from '../components/IncomeExpenseChart';
import {useNavigate} from "react-router-dom";
import {aggregateSpendingsByCategory} from "../utils/spendingAggregator.js";


export default function MainPage() {
    // Получаем данные и статусы загрузки из сторов
    const {spendings, loading: spendingsLoading, fetchSpendings, error: spendingsError} = useSpendingsStore();
    const {credits, loading: creditsLoading, fetchCredits, error: creditsError} = useCreditStore();
    const {goals, currentGoal, loading: goalsLoading, fetchGoals, error: goalsError} = useGoalsStore();
    const {balance, isLoading: isBalanceLoading, fetchBalance, error: balanceError} = useBalanceStore();
    // Получаем из стора Main Page (рекомендации, обзор)
    const {
        recommendations, financialEntries,
        loading: mainPageLoading, error: mainPageError,
        fetchRecommendations, fetchFinancialOverview
    } = useMainPageStore();

    // Получаем данные из categoryStore, включая все категории
    const { categoriesMonthSummary, loading: categoriesMonthLoading, fetchCategoriesMonthSummary, categories, loading: categoriesLoading, fetchCategories } = useCategoryStore();

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
// --- Конец ИЗМЕНЕНИЙ ---
    // --- Конец ДОБАВЛЕНО/ИЗМЕНЕНИЙ ---


    // Определяем, идет ли какая-либо загрузка основных данных для страницы
    const isLoadingData = spendingsLoading || creditsLoading || goalsLoading || isBalanceLoading || mainPageLoading || categoriesMonthLoading || categoriesLoading;


    // useEffect для запуска загрузки данных при монтировании компонента
    useEffect(() => {
        if (!spendingsLoading && spendings === null) {
            console.log('MainPage useEffect: Fetching spendings...');
            fetchSpendings();
        }
        if (!creditsLoading && credits === null) {
            console.log('MainPage useEffect: Fetching credits (will also fetch balance)...');
            fetchCredits();
        }
        if (!goalsLoading && goals === null) {
            console.log('MainPage useEffect: Fetching goals...');
            fetchGoals();
        }
        if (!mainPageLoading && recommendations === null && !mainPageError) {
            console.log('MainPage useEffect: Fetching recommendations...');
            fetchRecommendations();
        }
        if (!mainPageLoading && financialEntries === null && !mainPageError) {
            console.log('MainPage useEffect: Fetching financial overview...');
            fetchFinancialOverview();
        }

        // Запускаем загрузку categoriesMonthSummary, она нужна для модалки, даже если виджет не отображается
        if (!categoriesMonthLoading && categoriesMonthSummary === null) {
            console.log('MainPage useEffect: Fetching categories month summary...');
            fetchCategoriesMonthSummary();
        }

        // --- ДОБАВЛЕНО: Загрузка всех категорий ---
        if (!categoriesLoading && categories === null) {
            console.log('MainPage useEffect: Fetching all categories...');
            fetchCategories();
        }
        // --- Конец ДОБАВЛЕНО ---

        console.log('MainPage useEffect finished checks.');

    }, [
        fetchSpendings, spendings, spendingsLoading,
        fetchCredits, credits, creditsLoading,
        fetchGoals, goals, goalsLoading,
        fetchBalance, balance, isBalanceLoading,
        fetchRecommendations, recommendations,
        fetchFinancialOverview, financialEntries,
        mainPageLoading, mainPageError,
        fetchCategoriesMonthSummary, categoriesMonthSummary, categoriesMonthLoading,
        fetchCategories, categories, categoriesLoading // ДОБАВЛЕНО: Зависимости для категорий
    ]);

    // Определяем, полностью ли данные пустые для приветственного сообщения
    // Теперь hasAnyData будет проверять наличие данных в allTimeCategoriesSummary
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
        console.log('Showing full page loader...');
        return <Loader/>;
    }
    console.log('Not showing full page loader. State:', {
        isLoadingData, hasAnyData,
        spendings: spendings?.length, credits: credits?.length, goals: goals?.length, balance,
        recommendations: recommendations?.length, financialEntries: financialEntries?.length,
        categoriesMonthSummary: categoriesMonthSummary ? Object.keys(categoriesMonthSummary).length : 0,
        allTimeCategoriesSummary: Object.keys(allTimeCategoriesSummary).length, // ИЗМЕНЕНО: Добавили allTimeCategoriesSummary в лог
        categories: categories?.length // ДОБАВЛЕНО: Добавили категории в лог
    });

    // --- ИЗМЕНЕНО: Логика для отображения виджета аналитики по категориям ---
    // Условие:
    // 1. spendings НЕ null (данные о расходах загружены).
    // 2. categories НЕ null (данные о категориях загружены).
    // 3. И количество уникальных категорий с расходами "за все время" БОЛЬШЕ или РАВНО двум.
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
                    {(recommendations !== null && recommendations.length > 0) || mainPageLoading ? (
                        <TextButton
                            onClick={handleOpenRecommendationsModal}
                            disabled={mainPageLoading}
                        >
                            {mainPageLoading ? 'Загрузка...' : 'Рекомендации'}
                        </TextButton>
                    ) : (
                        null
                    )}
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