// 03_pages/MainPage/MainPage.tsx
import React from 'react';
import Text from '../../04_components/ui/Text';
import Loader from '../../04_components/ui/Loader';
import RecommendationsModal from '../../04_components/ui/RecommendationsModal';
import CategoryDistributionWidget from '../../04_components/widgets/CategoryDistributionWidget';
import CategoryDistributionChartModal from '../../04_components/charts/CategoryDistributionChartModal';
import TextButton from '../../04_components/ui/TextButton';
import RecentCreditsWidget from '../../04_components/widgets/RecentCreditsWidget';
import RecentExpenseWidget from '../../04_components/widgets/RecentExpenseWidget';
import GoalsSummaryWidget from '../../04_components/widgets/GoalsSummaryWidget';
import IncomeExpenseChart from '../../04_components/charts/IncomeExpenseChart';
import { useMainPageData } from './hooks/useMainPageData';
import { useMainPageModals } from './hooks/useMainPageModals';
import { useMainPageNavigation } from './hooks/useMainPageNavigation';

const MainPage: React.FC = () => {
    const data = useMainPageData();
    const modals = useMainPageModals();
    const navigation = useMainPageNavigation();

    // Условный рендеринг компонента
    if (data.showFullPageLoader) {
        console.log('Showing full ui loader...');
        return <Loader />;
    }

    return (
        <div className="bg-secondary-50">
            <main className="max-w-7xl mx-auto p-4">
                {/* Header section: Title and Recommendations Button */}
                <div className="flex justify-between items-center mb-4">
                    <Text variant="h2">Обзор</Text>
                    {data.mainPageLoading || (data.currentGoal !== null && data.recommendations !== null && data.recommendations.length > 0) ? (
                        <TextButton
                            onClick={modals.handleOpenRecommendationsModal}
                            disabled={data.mainPageLoading}
                        >
                            {data.mainPageLoading ? 'Загрузка...' : 'Рекомендации'}
                        </TextButton>
                    ) : null}
                </div>

                {/* Display general error message */}
                {data.displayError && data.modalType === null && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {data.displayError.message}
                    </div>
                )}

                {/* Приветственное сообщение */}
                {!data.isLoadingData && !data.hasAnyData && !data.showCategoryDistributionWidget ? (
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
                {(data.hasAnyData || data.isLoadingData || data.showCategoryDistributionWidget) && (
                    <div
                        className={`grid grid-cols-1 md:grid-cols-2 ${data.showCategoryDistributionWidget ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 ${!data.isLoadingData && !data.hasAnyData && !data.showCategoryDistributionWidget ? '' : 'mt-6'}`}
                    >
                        {/* Блок для Графика Доходов/Расходов */}
                        <div className="col-span-full md:col-span-2 lg:col-span-4">
                            <IncomeExpenseChart
                                credits={data.credits}
                                spendings={data.spendings}
                                isLoadingData={data.isLoadingData}
                            />
                        </div>

                        <div className="col-span-full md:col-span-1 bg-white p-4 rounded-md shadow-md">
                            <RecentCreditsWidget
                                recentCredits={data.credits}
                                loading={data.creditsLoading}
                                onViewCategoryClick={navigation.handleViewIncomeClick}
                                categoryName="Доходы"
                            />
                        </div>

                        <div className="col-span-full md:col-span-1 bg-white p-4 rounded-md shadow-md">
                            <RecentExpenseWidget
                                recentSpendings={data.spendings}
                                loading={data.spendingsLoading}
                                onViewCategoryClick={navigation.handleViewExpensesClick}
                                categoryName="Расходы"
                            />
                        </div>

                        <div className="col-span-full md:col-span-1 bg-white p-4 rounded-md shadow-md">
                            <GoalsSummaryWidget
                                goals={data.goals}
                                currentGoal={data.currentGoal}
                                loading={data.goalsLoading}
                                onViewCategoryClick={navigation.handleViewGoalsClick}
                                categoryName="Цели"
                            />
                        </div>

                        {/* Блок для Виджета "Анализ расходов по категориям" */}
                        {data.showCategoryDistributionWidget && (
                            <div className="col-span-full md:col-span-1 bg-white p-4 rounded-md shadow-md">
                                <CategoryDistributionWidget
                                    onOpenChart={modals.handleOpenCategoryChartModal}
                                    loading={data.spendingsLoading || data.categoriesLoading}
                                    allTimeCategoriesSummary={data.allTimeCategoriesSummary}
                                />
                            </div>
                        )}

                        {/* Индикатор фоновой загрузки */}
                        {!data.showFullPageLoader && data.isLoadingData && data.hasAnyData && (
                            <div className="col-span-full text-center mt-4">
                                <Text variant="body">Обновление данных...</Text>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Модалка для отображения рекомендаций */}
            <RecommendationsModal
                isOpen={modals.isRecommendationsModalOpen}
                onClose={modals.handleCloseRecommendationsModal}
                title="Рекомендации"
            >
                {data.mainPageLoading ? (
                    <Text variant="body">Загрузка рекомендаций...</Text>
                ) : data.recommendations && data.recommendations.length > 0 ? (
                    <div>
                        <ul className="space-y-4">
                            {data.recommendations.map((rec, index) => {
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
                    !data.mainPageLoading && (data.recommendations === null || data.recommendations.length === 0) ? (
                        <Text variant="body">Нет рекомендаций для отображения.</Text>
                    ) : null
                )}
            </RecommendationsModal>

            {/* Модалка для круговой диаграммы расходов по категориям */}
            <CategoryDistributionChartModal
                isOpen={modals.isCategoryChartModalOpen}
                onClose={modals.handleCloseCategoryChartModal}
                title="Распределение расходов по категориям"
            />
        </div>
    );
};

export default MainPage;
