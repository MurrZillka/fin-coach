// src/pages/MainPage.jsx
import React, {useEffect} from 'react'; // useMemo больше не нужен здесь
// Импортируем компоненты UI
import Text from '../components/ui/Text';
// Импортируем компонент Loader для плавной загрузки
import Loader from '../components/ui/Loader'; // Убедитесь, что путь корректен
// import Tooltip from '../components/ui/Tooltip'; // Tooltip больше не нужен здесь
// Импортируем сторы для получения данных
import useSpendingsStore from '../stores/spendingsStore';
import useCreditStore from '../stores/creditStore';
import useGoalsStore from '../stores/goalsStore';
import useBalanceStore from '../stores/balanceStore';

// Импортируем разработанные компоненты виджетов
import RecentIncomeWidget from '../components/RecentIncomeWidget';
import RecentExpenseWidget from '../components/RecentExpenseWidget';
import GoalsSummaryWidget from '../components/GoalsSummaryWidget';
// --- НОВЫЙ ИМПОРТ: Компонент графика ---
import IncomeExpenseChart from '../components/IncomeExpenseChart';
// --- Конец НОВОГО ИМПОРТА ---


export default function MainPage() {
    // Получаем данные и статусы загрузки из сторов
    const { spendings, loading: spendingsLoading, fetchSpendings } = useSpendingsStore();
    const { credits, loading: creditsLoading, fetchCredits } = useCreditStore();
    const { goals, currentGoal, loading: goalsLoading, fetchGoals } = useGoalsStore();
    const { balance, isLoading: isBalanceLoading, fetchBalance } = useBalanceStore();


    // --- Логика плавной загрузки ---
    // Определяем, идет ли какая-либо загрузка основных данных для страницы
    const isLoadingData = spendingsLoading || creditsLoading || goalsLoading || isBalanceLoading;

    // useEffect для запуска загрузки данных при монтировании компонента
    useEffect(() => {
        // Запускаем загрузку данных, только если они еще не загружены (null)
        // Явный вызов fetchBalance убран, полагаемся на взаимосвязи сторов.
        if (spendings === null && !spendingsLoading) {
            console.log('MainPage useEffect: Fetching spendings...');
            fetchSpendings();
        }
        if (credits === null && !creditsLoading) {
            console.log('MainPage useEffect: Fetching credits (will also fetch balance)...');
            fetchCredits(); // Должен инициировать fetchBalance
        }
        if (goals === null && !goalsLoading) {
            console.log('MainPage useEffect: Fetching goals...');
            fetchGoals(); // Этот вызов тоже может инициировать загрузку баланса, если ваша логика это предусматривает
        }
        // Оставим вызов fetchBalance здесь, чтобы лоадер реагировал на его загрузку.
        // Проблема 403 связана с готовностью токена, а не с самим фактом вызова.
        // if (balance === null && !isBalanceLoading) {
        //     console.log('MainPage useEffect: Fetching balance...');
        //     fetchBalance();
        // }

        console.log('MainPage useEffect finished checks.'); // Отладочное сообщение

        // Зависимости: включаем все значения из вне useEffect, которые используются внутри.
    }, [fetchSpendings, spendings, spendingsLoading, fetchCredits, credits, creditsLoading, fetchGoals, goals, goalsLoading, fetchBalance, balance, isBalanceLoading]);


    // Определяем, полностью ли данные пустые (для приветственного сообщения)
    // Проверяем только после завершения initial загрузки или если данные уже есть
    const hasAnyData =
        (spendings !== null && spendings.length > 0) ||
        (credits !== null && credits.length > 0) ||
        (goals !== null && goals.length > 0);


    // Условие для показа полноэкранного лоадера:
    // Идет любая загрузка И при этом ЕЩЕ нет данных ни в одном из основных сторов
    const showFullPageLoader = isLoadingData && (spendings === null || credits === null || goals === null || balance === null);


    // --- ОБРАБОТЧИКИ КЛИКОВ ДЛЯ НАВИГАЦИИ В ВИДЖЕТАХ ---
    // TODO: Реализовать реальную навигацию с помощью react-router-dom или другого роутера
    // Эти обработчики передаются в виджеты и в компонент графика (для кнопок пустого состояния)
    const handleViewIncomeClick = () => {
        console.log('Navigate to Income Page');
        // Пример: navigate('/income');
    };

    const handleViewExpensesClick = () => {
        console.log('Navigate to Expenses Page');
        // Пример: navigate('/expenses');
    };

    const handleViewGoalsClick = () => {
        console.log('Navigate to Goals Page');
        // Пример: navigate('/goals');
    };


    // --- Условный рендеринг компонента (полный лоадер или страница) ---
    // Если идет первичная загрузка и данных еще нет, показываем только лоадер
    // Лоадер показывается, если isLoadingData true И хотя бы один из ключевых сторов (spendings, credits, goals, balance) равен null
    if (showFullPageLoader) {
        console.log('Showing full page loader...'); // Отладочное сообщение
        return <Loader />;
    }
    console.log('Not showing full page loader. State:', {isLoadingData, hasAnyData, spendings: spendings?.length, credits: credits?.length, goals: goals?.length, balance});


    // Если не показываем полный лоадер, рендерим структуру страницы
    // Дополнительное условие: если лоадер не показывается, но и данных нет (!hasAnyData), показываем только приветствие.
    // Если данные есть (hasAnyData) ИЛИ идет фоновая загрузка (isLoadingData), показываем сетку виджетов.
    return (
        // Родительский div страницы с фоном
        <div className="bg-secondary-50 min-h-screen">
            {/* Основное содержимое страницы */}
            <main className="max-w-7xl mx-auto p-4">

                {/* Заголовок страницы */}
                <div className="mb-6">
                    <Text variant="h2">Обзор</Text>
                </div>


                {/* Приветственное сообщение (показывается, если данных нет и загрузка завершена) */}
                {/* УБРАНЫ КНОПКИ ДОБАВЛЕНИЯ из этого блока */}
                {!isLoadingData && !hasAnyData ? (
                    <div className="mb-6 p-4 bg-blue-100 border border-blue-300 text-blue-800 rounded-md shadow-sm">
                        <Text variant="body">
                            Добро пожаловать! Здесь вы сможете отслеживать свои финансы.
                            Для начала работы добавьте ваши первые доходы, расходы или поставьте финансовую цель через соответствующие разделы меню.
                        </Text>
                        {/* Кнопки добавления УБРАНЫ из этого блока */}
                        {/* <div className="flex flex-wrap gap-4 mt-4"> ... </div> */}
                    </div>
                ) : null /* Если данные есть или идет загрузка, приветствие не нужно */}


                {/* Сетка виджетов и графика */}
                {/* Этот контейнер виден, если не показывается полное приветствие и не идет showFullPageLoader */}
                {/* Показываем сетку только если есть данные (hasAnyData) ИЛИ если идет фоновая загрузка (isLoadingData) */}
                {(hasAnyData || isLoadingData) && (
                    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${!isLoadingData && !hasAnyData ? '' : 'mt-6'}`}>


                        {/* Блок для Графика Доходов/Расходов - теперь отдельный компонент */}
                        {/* Передаем ему нужные данные, статус загрузки и обработчики кликов */}
                        {/* Внешние стили (фон, тень, отступы, overflow-x-auto) перенесены внутрь компонента графика */}
                        <div className="col-span-full md:col-span-2 lg:col-span-3">
                            <IncomeExpenseChart
                                credits={credits} // Передаем данные доходов
                                spendings={spendings} // Передаем данные расходов
                                isLoadingData={isLoadingData} // Передаем общий статус загрузки (для пустого состояния графика)
                                handleViewIncomeClick={handleViewIncomeClick} // Обработчик для пустого состояния графика
                                handleViewExpensesClick={handleViewExpensesClick} // Обработчик для пустого состояния графика
                            />
                        </div>


                        {/* Блок для Виджета "Последние Доходы" */}
                        {/* Эти виджеты остаются здесь */}
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

                        {/* Здесь могут быть другие блоки/виджеты */}


                        {/* Индикатор фоновой загрузки (обновление списка/виджетов) */}
                        {/* Показываем, только если не showFullPageLoader, но идет загрузка и данные уже есть */}
                        { !showFullPageLoader && isLoadingData && hasAnyData && (
                            <div className="col-span-full text-center mt-4">
                                <Text variant="body">Обновление данных...</Text>
                            </div>
                        )}

                    </div>
                )}


            </main>
        </div>
    );
};