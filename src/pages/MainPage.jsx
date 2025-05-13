// src/pages/MainPage.jsx
import React, {useState, useEffect} from 'react'; // Импортируем useState и useEffect
// Импортируем компоненты UI
import Text from '../components/ui/Text';
import TextButton from '../components/ui/TextButton';
// Импортируем компонент Loader для плавной загрузки
import Loader from '../components/ui/Loader'; // Убедитесь, что путь корректен

// Импортируем компоненты Recharts для графика (линейный И столбчатый)
import {
    LineChart, Line, BarChart, Bar, // Добавлен BarChart и Bar
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Импортируем сторы для получения данных
import useSpendingsStore from '../stores/spendingsStore';
import useCreditStore from '../stores/creditStore';
import useGoalsStore from '../stores/goalsStore';
import useBalanceStore from '../stores/balanceStore'; // Возможно, понадобится для loaderState


// Импортируем разработанные компоненты виджетов
import RecentIncomeWidget from '../components/RecentIncomeWidget';
import RecentExpenseWidget from '../components/RecentExpenseWidget';
import GoalsSummaryWidget from '../components/GoalsSummaryWidget';

// Дополнительно можем импортировать useAuthStore, если нужно имя пользователя для приветствия
// import useAuthStore from '../stores/authStore';


export default function MainPage() {
    // Получаем данные и статусы загрузки из сторов
    const {spendings, loading: spendingsLoading, fetchSpendings} = useSpendingsStore(); // Возможно, fetch нужен тут
    const {credits, loading: creditsLoading, fetchCredits} = useCreditStore(); // Возможно, fetch нужен тут
    const {goals, currentGoal, loading: goalsLoading, fetchGoals} = useGoalsStore(); // Возможно, fetch нужен тут
    const {balance, isLoading: isBalanceLoading, fetchBalance} = useBalanceStore(); // Получаем баланс и его загрузку


    // Определяем, идет ли какая-либо загрузка основных данных для страницы
    // Учитываем загрузку всех необходимых данных для виджетов и графика
    const isLoadingData = spendingsLoading || creditsLoading || goalsLoading || isBalanceLoading;


    // --- Логика плавной загрузки ---
    // Состояние для отслеживания, была ли первая полная загрузка данных
    // const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false); // Вариант с флагом
    // Более простой вариант: показывать лоадер, пока хотя бы один из сторов находится в состоянии loading
    // И пока нет данных в этих сторах (null). Если данные уже есть (не null), но идет loading, это фоновое обновление.

    // useEffect для запуска загрузки данных при монтировании компонента
    useEffect(() => {
        // Запускаем загрузку данных, только если они еще не загружены (null)
        // Эта логика может быть вынесена выше (например, в компонент Layout или Router),
        // чтобы избежать повторной загрузки при каждом посещении MainPage
        if (spendings === null && !spendingsLoading) fetchSpendings();
        if (credits === null && !creditsLoading) fetchCredits();
        if (goals === null && !goalsLoading) fetchGoals();
        //if (balance === null && !isBalanceLoading) fetchBalance();

        // Если все сторы закончили загрузку и хотя бы один раз были не null,
        // можно было бы установить флаг isInitialLoadComplete(true),
        // но мы можем обойтись без этого флага для простого лоадера.

    }, [fetchSpendings, spendings, spendingsLoading, fetchCredits, credits, creditsLoading, fetchGoals, goals, goalsLoading, fetchBalance, balance, isBalanceLoading]); // Зависимости


    // Определяем, полностью ли данные пустые (для приветственного сообщения)
    // Проверяем только после завершения initial загрузки или если данные уже есть
    const hasAnyData =
        (spendings !== null && spendings.length > 0) ||
        (credits !== null && credits.length > 0) ||
        (goals !== null && goals.length > 0);


    // Условие для показа полноэкранного лоадера:
    // Идет любая загрузка И при этом ЕЩЕ нет данных ни в одном из основных сторов
    const showFullPageLoader = isLoadingData && (spendings === null && credits === null && goals === null && balance === null);


    // --- Логика переключателя вида графика ---
    // Состояние для хранения текущего вида графика ('line' или 'bar')
    const [chartType, setChartType] = useState('line'); // По умолчанию - линейный


    // Функция для обработки клика по кнопке переключения вида графика
    const handleChartTypeChange = (type) => {
        setChartType(type);
    };


    // --- МОКОВЫЕ ДАННЫЕ ДЛЯ ГРАФИКА ---
    // TODO: Заменить эти моковые данные на реальные данные доходов и расходов, агрегированные по периодам
    // TODO: Реализовать логику получения данных за ВЕСЬ доступный период и формирования chartData
    const chartData = [
        {name: 'Янв', Доходы: 4000, Расходы: 2400},
        {name: 'Фев', Доходы: 3000, Расходы: 1398},
        {name: 'Мар', Доходы: 2000, Расходы: 9800},
        {name: 'Апр', Доходы: 2780, Расходы: 3908},
        {name: 'Май', Доходы: 1890, Расходы: 4800},
        {name: 'Июн', Доходы: 2390, Расходы: 3800},
        {name: 'Июл', Доходы: 3490, Расходы: 4300},
        {name: 'Авг', Доходы: 3490, Расходы: 4300},
        {name: 'Сен', Доходы: 3490, Расходы: 4300},
        {name: 'Окт', Доходы: 3490, Расходы: 4300},
        {name: 'Ноя', Доходы: 3490, Расходы: 4300},
        {name: 'Дек', Доходы: 3490, Расходы: 4300},
    ];
    // TODO: При использовании реальных данных учесть динамическую ширину графика (если периодов много)
    // Например, рассчитать width={numberOfPeriods * minWidthPerPeriod} для <LineChart>/<BarChart>
    // И добавить overflow-x-auto к родительскому div графика.


    // --- ОБРАБОТЧИКИ КЛИКОВ ДЛЯ НАВИГАЦИИ В ВИДЖЕТАХ ---
    // Эти функции будут переданы в виджеты и вызваны при клике на заголовок/иконку
    // TODO: Реализовать реальную навигацию с помощью react-router-dom или другого роутера
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
    // Если идет первая загрузка и данных еще нет, показываем только лоадер
    if (showFullPageLoader) {
        return <Loader/>;
    }


    // Если не показываем полный лоадер, рендерим структуру страницы
    return (
        // Родительский div страницы с фоном
        <div className="bg-secondary-50 min-h-screen"> {/* Фон страницы */}
            {/* Основное содержимое страницы */}
            <main className="max-w-7xl mx-auto p-4"> {/* Центрированный контейнер с отступами */}

                {/* Заголовок страницы */}
                {/* Блок заголовка с нижним отступом */}
                <div className="mb-6"> {/* Нижний отступ после заголовка */}
                    <Text variant="h2">Обзор</Text>
                </div>


                {/* Приветственное сообщение (показывается, если данных нет и загрузка завершена) */}
                {/* Если данные есть или идет загрузка (но не showFullPageLoader), этот блок не показывается */}
                {!isLoadingData && !hasAnyData ? (
                    // Блок приветственного сообщения при полном отсутствии данных
                    <div className="mb-6 p-4 bg-blue-100 border border-blue-300 text-blue-800 rounded-md shadow-sm">
                        {/* Текст приветствия */}
                        <Text variant="body">
                            Добро пожаловать! Здесь вы сможете отслеживать свои финансы.
                            Начните с добавления первых доходов, расходов или постановки финансовой цели.
                        </Text>
                        {/* Контейнер для кнопок призывов к действию */}
                        <div className="flex flex-wrap gap-4 mt-4">
                            {/* TODO: Добавить реальные ссылки/onClick для перехода к формам добавления */}
                            {/* Используем те же обработчики, что и для навигации, но, возможно, они будут вести на формы добавления */}
                            <TextButton
                                onClick={handleViewIncomeClick}> {/* Можно использовать handleViewIncomeClick как триггер перехода к добавлению на странице доходов */}
                                Добавить доход
                            </TextButton>
                            <TextButton
                                onClick={handleViewExpensesClick}> {/* Можно использовать handleViewExpensesClick как триггер перехода к добавлению на странице расходов */}
                                Записать расход
                            </TextButton>
                            <TextButton
                                onClick={handleViewGoalsClick}> {/* Можно использовать handleViewGoalsClick как триггер перехода к форме создания цели */}
                                Поставить цель
                            </TextButton>
                        </div>
                    </div>
                ) : null /* Если данные есть или идет загрузка (но не showFullPageLoader), приветствие не нужно */}


                {/* Сетка виджетов и графика */}
                {/* Этот контейнер виден, если не показывается полное приветствие и не идет showFullPageLoader */}
                {/* Добавляем отступ сверху, если нет приветственного блока (т.е. при !isLoadingData && !hasAnyData) */}
                {/* Дополнительное условие: показываем сетку только если есть данные ИЛИ если идет фоновая загрузка (но не showFullPageLoader) */}
                {(hasAnyData || (isLoadingData && !showFullPageLoader)) && (
                    <div
                        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${!isLoadingData && !hasAnyData ? '' : 'mt-6'}`}>


                        {/* Блок для Графика Доходов/Расходов */}
                        {/* Занимает всю ширину на мобильных и 2-3 колонки на десктопах */}
                        <div className="col-span-full md:col-span-2 lg:col-span-3 bg-white p-4 rounded-md shadow-md">
                            {/* Контейнер для заголовка графика и переключателя */}
                            <div
                                className="flex justify-between items-center mb-2"> {/* flex для расположения по горизонтали */}
                                <Text variant="h3" className="mb-0">Динамика Доходов и
                                    Расходов</Text> {/* Убран mb-2 */}
                                {/* Переключатель вида графика */}
                                {/* TODO: Стилизовать кнопки-переключатели */}
                                <div className="flex gap-2">
                                    <button
                                        className={`px-2 py-1 text-sm rounded ${chartType === 'line' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                        onClick={() => handleChartTypeChange('line')}
                                        disabled={isLoadingData} // Отключаем во время загрузки
                                    >
                                        Линии
                                    </button>
                                    <button
                                        className={`px-2 py-1 text-sm rounded ${chartType === 'bar' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                        onClick={() => handleChartTypeChange('bar')}
                                        disabled={isLoadingData} // Отключаем во время загрузки
                                    >
                                        Столбцы
                                    </button>
                                </div>
                            </div>
                            {/* Конец контейнера заголовка и переключателя */}

                            {/* Условное отображение: График или Пустое состояние графика */}
                            {/* TODO: Уточнить условие, когда показывать график (например, только если есть доходы ИЛИ расходы, а не цели) */}
                            {(spendings !== null && spendings.length > 0) || (credits !== null && credits.length > 0) ? ( // Условие: показать график только если есть данные доходов ИЛИ расходов
                                // --- Интегрированный График Recharts ---
                                // TODO: При использовании реальных данных учесть динамическую ширину графика и добавить overflow-x-auto к этому div
                                <ResponsiveContainer width="100%" height={300}>
                                    {/* Условный рендеринг LineChart или BarChart */}
                                    {chartType === 'line' ? (
                                        <LineChart
                                            data={chartData} // Используем моковые данные
                                            margin={{top: 5, right: 30, left: 20, bottom: 5}}
                                        >
                                            <CartesianGrid strokeDasharray="3 3"/>
                                            <XAxis dataKey="name"/>
                                            <YAxis/>
                                            <Tooltip/>
                                            <Legend/>
                                            <Line type="monotone" dataKey="Доходы" stroke="#8884d8" strokeWidth={2}
                                                  activeDot={{r: 8}}/>
                                            <Line type="monotone" dataKey="Расходы" stroke="#82ca9d" strokeWidth={2}
                                                  activeDot={{r: 8}}/>
                                        </LineChart>
                                    ) : ( /* chartType === 'bar' */
                                        <BarChart
                                            data={chartData} // Используем моковые данные
                                            margin={{top: 5, right: 30, left: 20, bottom: 5}}
                                        >
                                            <CartesianGrid strokeDasharray="3 3"/>
                                            <XAxis dataKey="name"/>
                                            <YAxis/>
                                            <Tooltip/>
                                            <Legend/>
                                            <Bar dataKey="Доходы" fill="#8884d8"/>
                                            <Bar dataKey="Расходы" fill="#82ca9d"/>
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            ) : (
                                // Пустое состояние для графика (теперь показывается, если НЕТ данных доходов ИЛИ расходов)
                                <div className="text-center p-4 bg-gray-100 rounded-md">
                                    <Text variant="body" className="text-gray-600 mb-3">
                                        Добавьте доходы и расходы, чтобы увидеть визуализацию вашего финансового потока.
                                    </Text>
                                    <div className="flex flex-wrap gap-4 justify-center">
                                        {/* TODO: Добавить реальные ссылки/onClick */}
                                        <TextButton onClick={handleViewIncomeClick}> {/* Ведет на страницу доходов */}
                                            Добавить доход
                                        </TextButton>
                                        <TextButton
                                            onClick={handleViewExpensesClick}> {/* Ведет на страницу расходов */}
                                            Записать расход
                                        </TextButton>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Блок для Виджета "Последние Доходы" */}
                        <div className="col-span-full md:col-span-1 bg-white p-4 rounded-md shadow-md">
                            <RecentIncomeWidget
                                recentIncomes={credits}
                                loading={creditsLoading}
                                onViewCategoryClick={handleViewIncomeClick} // Передаем обработчик клика по заголовку/иконке
                                categoryName="Доходы" // Название для тултипа
                            />
                        </div>

                        {/* Блок для Виджета "Последние Расходы" */}
                        <div className="col-span-full md:col-span-1 bg-white p-4 rounded-md shadow-md">
                            <RecentExpenseWidget
                                recentSpendings={spendings}
                                loading={spendingsLoading}
                                onViewCategoryClick={handleViewExpensesClick} // Передаем обработчик клика по заголовку/иконке
                                categoryName="Расходы" // Название для тултипа
                            />
                        </div>

                        {/* Блок для Виджета "Финансовые Цели" */}
                        <div className="col-span-full md:col-span-1 bg-white p-4 rounded-md shadow-md">
                            <GoalsSummaryWidget
                                goals={goals}
                                currentGoal={currentGoal}
                                loading={goalsLoading}
                                onViewCategoryClick={handleViewGoalsClick} // Передаем обработчик клика по заголовку/иконке
                                categoryName="Цели" // Название для тултипа
                                // onCreateGoalClick и onViewGoalsClick больше не используются в виджете, навигация через заголовок
                            />
                        </div>

                        {/* Здесь могут быть другие блоки/виджеты */}
                        {/* TODO: Возможно, добавить сюда виджет для баланса и текущей цели, если он не в шапке/боковой панели */}


                        {/* Индикатор фоновой загрузки (обновление списка/виджетов) */}
                        {/* Показываем, только если не showFullPageLoader, но идет загрузка и данные уже есть */}
                        {isLoadingData && !showFullPageLoader && hasAnyData && (
                            <div className="col-span-full text-center mt-4"> {/* Занимает всю ширину сетки */}
                                <Text variant="body">Обновление данных...</Text> {/* Индикатор обновления */}
                            </div>
                        )}

                    </div>
                )}


            </main>
        </div>
    );
};