// 03_pages/MainPage/hooks/useMainPageData.ts
import { useMemo } from 'react';
import useSpendingsStore from '../../../02_stores/spendingsStore/spendingsStore';
import useCreditStore from '../../../02_stores/creditsStore/creditStore';
import useGoalsStore from '../../../02_stores/goalsStore/goalsStore';
import useBalanceStore from '../../../02_stores/balanceStore/balanceStore';
import useMainPageStore from '../../../02_stores/mainPageStore/mainPageStore';
import useModalStore from '../../../02_stores/modalStore/modalStore';
import useCategoryStore from '../../../02_stores/categoryStore/categoryStore';
import { aggregateSpendingsByCategory } from '../../../07_utils/spendingAggregator';

export const useMainPageData = () => {
    // Все хуки сторов
    const { spendings, loading: spendingsLoading, error: spendingsError } = useSpendingsStore();
    const { credits, loading: creditsLoading, error: creditsError } = useCreditStore();
    const { goals, currentGoal, loading: goalsLoading, error: goalsError } = useGoalsStore();
    const { balance, loading: isBalanceLoading, error: balanceError } = useBalanceStore();
    const {
        recommendations,
        loading: mainPageLoading,
        error: mainPageError,
    } = useMainPageStore(); // Только recommendations, loading, error
    const {
        categoriesMonth,
        loading: categoriesMonthLoading,
        categories,
        loading: categoriesLoading,
    } = useCategoryStore();
    const { modalType } = useModalStore();

    // Агрегация всех расходов по категориям за все время
    const allTimeCategoriesSummary = useMemo(() => {
        if (!spendings || !categories) {
            console.log('allTimeCategoriesSummary useMemo: spendings or categories is null/undefined, returning empty object.');
            return {};
        }
        const summary = aggregateSpendingsByCategory(spendings, categories, 'allTime');
        console.log('allTimeCategoriesSummary useMemo: Aggregated summary using aggregateSpendingsByCategory:', summary);
        console.log('allTimeCategoriesSummary useMemo: Number of unique categories:', Object.keys(summary).length);
        return summary;
    }, [spendings, categories]);

    // Вычисляемые значения
    const isLoadingData = spendingsLoading || creditsLoading || goalsLoading || isBalanceLoading || mainPageLoading || categoriesMonthLoading || categoriesLoading;

    const hasAnyData =
        (spendings !== null && spendings.length > 0) ||
        (credits !== null && credits.length > 0) ||
        (goals !== null && goals.length > 0) ||
        (recommendations !== null && recommendations.length > 0) ||
        (Object.keys(allTimeCategoriesSummary).length > 0);

    const showFullPageLoader = isLoadingData && (
        spendings === null || credits === null || goals === null || balance === null ||
        recommendations === null || categoriesMonth === null || categories === null
    ); // Убрал financialEntries === null

    const showCategoryDistributionWidget =
        spendings !== null &&
        categories !== null &&
        Object.keys(allTimeCategoriesSummary).length >= 2;

    const displayError = spendingsError || creditsError || goalsError || balanceError || mainPageError;

    return {
        // Данные из сторов
        spendings,
        credits,
        goals,
        currentGoal,
        balance,
        recommendations,
        categoriesMonth,
        categories,
        modalType,

        // Состояния загрузки
        spendingsLoading,
        creditsLoading,
        goalsLoading,
        isBalanceLoading,
        mainPageLoading,
        categoriesMonthLoading,
        categoriesLoading,

        // Ошибки
        spendingsError,
        creditsError,
        goalsError,
        balanceError,
        mainPageError,

        // Вычисляемые значения
        allTimeCategoriesSummary,
        isLoadingData,
        hasAnyData,
        showFullPageLoader,
        showCategoryDistributionWidget,
        displayError,
    };
};
