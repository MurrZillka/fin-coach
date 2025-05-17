// src/pages/MainPage.jsx
import React, { useEffect, useState } from 'react';
// Импортируем компоненты UI
import Text from '../components/ui/Text';
// Импортируем компонент Loader для плавной загрузки
import Loader from '../components/ui/Loader';
// Импортируем нашу универсальную модалку (хотя для рекомендаций используем другую)
// import Modal from '../components/ui/Modal'; // Больше не используется для рекомендаций
// --- НОВЫЙ ИМПОРТ: Модалка для рекомендаций ---
import RecommendationsModal from '../components/RecommendationsModal'; // ИСПРАВЛЕНО: Добавлен импорт
// --- Конец НОВОГО ИМПОРТА ---
// Импортируем сторы для получения данных
import useSpendingsStore from '../stores/spendingsStore';
import useCreditStore from '../stores/creditStore';
import useGoalsStore from '../stores/goalsStore';
import useBalanceStore from '../stores/balanceStore';
// Импортируем стор для главной страницы (рекомендации, обзор)
import useMainPageStore from '../stores/mainPageStore';
// Импортируем useModalStore для проверки modalType при отображении ошибок
import useModalStore from '../stores/modalStore';

// Импортируем TextButton (ты его уже добавил, оставляем)
import TextButton from '../components/ui/TextButton'; // Убедись, что путь правильный


// Импортируем разработанные компоненты виджетов
import RecentIncomeWidget from '../components/RecentIncomeWidget';
import RecentExpenseWidget from '../components/RecentExpenseWidget';
import GoalsSummaryWidget from '../components/GoalsSummaryWidget';
// Импортируем компонент графика
import IncomeExpenseChart from '../components/IncomeExpenseChart';


export default function MainPage() {
    // Получаем данные и статусы загрузки из сторов
    const { spendings, loading: spendingsLoading, fetchSpendings, error: spendingsError } = useSpendingsStore();
    const { credits, loading: creditsLoading, fetchCredits, error: creditsError } = useCreditStore();
    const { goals, currentGoal, loading: goalsLoading, fetchGoals, error: goalsError } = useGoalsStore();
    const { balance, isLoading: isBalanceLoading, fetchBalance, error: balanceError } = useBalanceStore();
    // Получаем из стора Main Page (рекомендации, обзор)
    const {
        recommendations, financialEntries,
        loading: mainPageLoading, error: mainPageError,
        fetchRecommendations, fetchFinancialOverview
    } = useMainPageStore();

    // Получаем modalType из useModalStore для правильного отображения ошибок
    const { modalType } = useModalStore();


    // Состояние для управления модалкой рекомендаций
    const [isRecommendationsModalOpen, setIsRecommendationsModalOpen] = useState(false);

    // --- ИСПРАВЛЕНО: Определение isLoadingData находится здесь, в начале компонента ---
    // Определяем, идет ли какая-либо загрузка основных данных для страницы, включая данные для Main Page
    const isLoadingData = spendingsLoading || creditsLoading || goalsLoading || isBalanceLoading || mainPageLoading;
    // --- Конец ИСПРАВЛЕНО ---


    // useEffect для запуска загрузки данных при монтировании компонента
    useEffect(() => {
        // ... логика загрузки основных данных (доходы, расходы, цели) - без изменений

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


        // Логика загрузки данных для MainPageStore
        if (!mainPageLoading && recommendations === null && !mainPageError) {
            console.log('MainPage useEffect: Fetching recommendations...');
            fetchRecommendations();
        }
        if (!mainPageLoading && financialEntries === null && !mainPageError) {
            console.log('MainPage useEffect: Fetching financial overview...');
            fetchFinancialOverview();
        }

        console.log('MainPage useEffect finished checks.');

    }, [
        fetchSpendings, spendings, spendingsLoading,
        fetchCredits, credits, creditsLoading,
        fetchGoals, goals, goalsLoading,
        fetchBalance, balance, isBalanceLoading,
        fetchRecommendations, recommendations,
        fetchFinancialOverview, financialEntries,
        mainPageLoading, mainPageError
    ]);


    // УБРАН ВРЕМЕННЫЙ КОНСОЛЬНЫЙ ЛОГ ДЛЯ ПРОВЕРКИ СТРУКТУРЫ РЕКОМЕНДАЦИЙ


    // Определяем, полностью ли данные пустые
    const hasAnyData =
        (spendings !== null && spendings.length > 0) ||
        (credits !== null && credits.length > 0) ||
        (goals !== null && goals.length > 0) ||
        (recommendations !== null && recommendations.length > 0) ||
        (financialEntries !== null && financialEntries.length > 0);


    // Условие для показа полноэкранного лоадера
    const showFullPageLoader = isLoadingData && (
        spendings === null || credits === null || goals === null || balance === null ||
        recommendations === null || financialEntries === null
    );


    // Обработчики кликов
    const handleViewIncomeClick = () => { console.log('Navigate to Income Page'); };
    const handleViewExpensesClick = () => { console.log('Navigate to Expenses Page'); };
    const handleViewGoalsClick = () => { console.log('Navigate to Goals Page'); };

    // Обработчики открытия/закрытия модалки рекомендаций
    const handleOpenRecommendationsModal = () => {
        console.log('MainPage: Opening recommendations modal.');
        setIsRecommendationsModalOpen(true);
    };

    const handleCloseRecommendationsModal = () => {
        console.log('MainPage: Closing recommendations modal.');
        setIsRecommendationsModalOpen(false);
        // Если нужно сбрасывать ошибку Main Page стора при закрытии модалки
        // useMainPageStore.getState().clearError();
    };


    // Определяем, следует ли показать общую ошибку (из любого стора)
    const displayError = spendingsError || creditsError || goalsError || balanceError || mainPageError;


    // Условный рендеринг компонента
    if (showFullPageLoader) {
        console.log('Showing full page loader...');
        return <Loader />;
    }
    console.log('Not showing full page loader. State:', {
        isLoadingData, hasAnyData,
        spendings: spendings?.length, credits: credits?.length, goals: goals?.length, balance,
        recommendations: recommendations?.length, financialEntries: financialEntries?.length
    });


    return (
        <div className="bg-secondary-50 min-h-screen">
            <main className="max-w-7xl mx-auto p-4">

                {/* Header section: Title and Recommendations Button */}
                <div className="flex justify-between items-center mb-4">
                    <Text variant="h2">Обзор</Text>
                    {/* Кнопка для открытия рекомендаций */}
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
                {!isLoadingData && !hasAnyData ? (
                    <div className="mb-6 p-4 bg-blue-100 border border-blue-300 text-blue-800 rounded-md shadow-sm">
                        <Text variant="body">
                            Добро пожаловать! Здесь вы сможете отслеживать свои финансы.
                            Для начала работы добавьте ваши первые доходы, расходы или поставьте финансовую цель через соответствующие разделы меню.
                            Когда появятся данные, здесь также будут отображаться рекомендации и аналитика.
                        </Text>
                    </div>
                ) : null}

                {/* Сетка виджетов и графика */}
                {(hasAnyData || isLoadingData) && (
                    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${!isLoadingData && !hasAnyData ? '' : 'mt-6'}`}>

                        {/* TODO: Реализовать красивое отображение financialEntries */}
                        {/* Пример временного вывода financialEntries: */}
                        {/* {financialEntries !== null && financialEntries.length > 0 && (
                             <div className="col-span-full bg-white p-4 rounded-md shadow-md">
                                 <Text variant="h3" className="mb-2">Финансовый обзор</Text>
                                 <ul>
                                     {financialEntries.map((entry, index) => (
                                         <li key={index} className="mb-1">
                                             <Text variant="body">{entry.title}: {entry.value}</Text>
                                         </li>
                                     ))}
                                 </ul>
                             </div>
                        )} */}


                        {/* Блок для Графика Доходов/Расходов */}
                        <div className="col-span-full md:col-span-2 lg:col-span-3">
                            <IncomeExpenseChart
                                credits={credits}
                                spendings={spendings}
                                isLoadingData={isLoadingData}
                                handleViewIncomeClick={handleViewIncomeClick}
                                handleViewExpensesClick={handleViewExpensesClick}
                            />
                        </div>


                        {/* Блок для Виджета "Последние Доходы" */}
                        <div className="col-span-full md:col-span-1 bg-white p-4 rounded-md shadow-md">
                            <RecentIncomeWidget
                                recentIncomes={credits}
                                loading={creditsLoading}
                                onViewCategoryClick={handleViewIncomeClick}
                                categoryName="Доходы"
                            />
                        </div>

                        {/* Блок для Виджета "Последние Расходы" */}
                        <div className="col-span-full md:col-span-1 bg-white p-4 rounded-md shadow-md">
                            <RecentExpenseWidget
                                recentSpendings={spendings}
                                loading={spendingsLoading}
                                onViewCategoryClick={handleViewExpensesClick}
                                categoryName="Расходы"
                            />
                        </div>

                        {/* Блок для Виджета "Финансовые Цели" */}
                        <div className="col-span-full md:col-span-1 bg-white p-4 rounded-md shadow-md">
                            <GoalsSummaryWidget
                                goals={goals}
                                currentGoal={currentGoal}
                                loading={goalsLoading}
                                onViewCategoryClick={handleViewGoalsClick}
                                categoryName="Цели"
                            />
                        </div>

                        {/* Индикатор фоновой загрузки */}
                        { !showFullPageLoader && isLoadingData && hasAnyData && (
                            <div className="col-span-full text-center mt-4">
                                <Text variant="body">Обновление данных...</Text>
                            </div>
                        )}

                    </div>
                )}


            </main>

            {/* Модалка для отображения рекомендаций */}
            {/* Используем новую RecommendationsModal */}
            <RecommendationsModal
                isOpen={isRecommendationsModalOpen}
                onClose={handleCloseRecommendationsModal}
                title="Рекомендации"
                // Передаем контент модалки как children
            >
                {mainPageLoading ? (
                    <Text variant="body">Загрузка рекомендаций...</Text>
                ) : recommendations && recommendations.length > 0 ? (
                    // Отображаем список рекомендаций, используя поля name и description
                    <div>
                        <Text variant="body" className="mb-2">Ваши рекомендации:</Text>
                        <ul className="space-y-4">
                            {/* Используем index как ключ */}
                            {recommendations.map((rec, index) => {
                                // Разделяем поле name на заголовок и название категории
                                const nameParts = rec?.name?.split(' - ') || [];
                                const recommendationTitle = nameParts.length > 1 ? nameParts[0] : rec?.name;
                                const categoryName = nameParts.length > 1 ? nameParts[1] : null;

                                return (
                                    <li key={index} className="p-3 bg-blue-50 rounded-md border border-blue-100">
                                        {/* Контейнер для заголовка и категории с нижним отступом */}
                                        <div className="mb-2">
                                            {/* Заголовок рекомендации */}
                                            {recommendationTitle && (
                                                <Text
                                                    variant="body"
                                                    // --- ИСПРАВЛЕНО: Классы line-height изменены на leading-none ---
                                                    // Шрифт: text-sm на мобильных, md:text-xs на md+
                                                    // Расстояние между строками: leading-none на всех экранах
                                                    className="font-semibold text-blue-800 text-sm"
                                                >
                                                    {recommendationTitle + ":"}
                                                </Text>
                                            )}

                                            {/* Название категории, если есть (красный жирный в кавычках) */}
                                            {categoryName && (
                                                <Text
                                                    variant="body"
                                                    // Красный жирный шрифт, размер и расстояние, block, отступ
                                                    // --- ИСПРАВЛЕНО: Классы line-height изменены на leading-none ---
                                                    // Шрифт: text-sm на мобильных, md:text-xs на md+
                                                    // Расстояние между строками: leading-none на всех экранах
                                                    className="text-red-600 font-bold text-sm md:text-xs block"
                                                >
                                                    «{categoryName}»
                                                </Text>
                                            )}
                                        </div>


                                        {/* Основной текст рекомендации (description) */}
                                        {/* Проверяем, что description существует и не пустой */}
                                        {rec?.description && (
                                            <Text
                                                variant="body"
                                                // Шрифт: text-sm на мобильных, md:text-xs на md+
                                                // Расстояние между строками: leading-none на всех экранах
                                                // Отступ сверху теперь обеспечивается нижним отступом родительского div
                                                // --- ИСПРАВЛЕНО: Классы line-height изменены на leading-none ---
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

        </div>
    );
};