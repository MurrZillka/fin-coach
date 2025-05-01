import { useState, useEffect } from 'react';
import { getUseMocks, setUseMocks } from '../api/config';
import {
    getUsers, signup, login, logout,
} from '../api/auth';
import {
    addCredit, getCredits, getCreditsPermanent, getCreditById, updateCreditById, deleteCreditById,
} from '../api/credit';
import {
    addSpending, getSpendings, getSpendingsPermanent, getSpendingById, updateSpendingById, deleteSpendingById,
} from '../api/spendings';
import {
    addCategory, getCategories, getCategoryById, updateCategoryById, deleteCategoryById,
} from '../api/categories';
import {
    addGoal, getGoals, getGoalById, updateGoalById, setCurrentGoal, getCurrentGoal, deleteGoalById,
} from '../api/goals';
import { getBalance } from '../api/balance';
import {
    getRecommendations, getFinancialOverview,
} from '../api/recommendations';
import Text from '../components/ui/Text';

// Тестовые данные для методов с телом запроса
const testData = {
    signup: { user_name: 'test', login: 'test', password: 'test' },
    login: { login: 'mot', password: 'mot' },
    addCredit: { amount: 1000000, description: 'Test credit', is_permanent: false },
    addSpending: { amount: 1000, description: 'Test spending', category_id: 1, is_permanent: false },
    addCategory: { name: 'Test Category', description: 'Test description' },
    addGoal: { amount: 1000000, description: 'Test goal', wish_date: '2025-12-31' },
    updateCredit: { amount: 2000000, description: 'Updated credit', is_permanent: true, date: "2025-04-28" },
    updateSpending: { amount: 2000, description: 'Updated spending', category_id: 1, is_permanent: true, date: "2025-04-28" },
    updateCategory: { name: 'Updated Category', description: 'Updated description' },
    updateGoal: { amount: 2000000, description: 'Updated goal', wish_date: '2026-12-31' },
};

export default function TestApi() {
    const [useMocks, setLocalUseMocks] = useState(getUseMocks());
    const [token, setToken] = useState('');
    const [response, setResponse] = useState({});
    const [inputData, setInputData] = useState({
        signup: JSON.stringify(testData.signup, null, 2),
        login: JSON.stringify(testData.login, null, 2),
        addCredit: JSON.stringify(testData.addCredit, null, 2),
        addSpending: JSON.stringify(testData.addSpending, null, 2),
        addCategory: JSON.stringify(testData.addCategory, null, 2),
        addGoal: JSON.stringify(testData.addGoal, null, 2),
        updateCredit: JSON.stringify(testData.updateCredit, null, 2),
        updateSpending: JSON.stringify(testData.updateSpending, null, 2),
        updateCategory: JSON.stringify(testData.updateCategory, null, 2),
        updateGoal: JSON.stringify(testData.updateGoal, null, 2),
    });
    const [inputIds, setInputIds] = useState({
        getCreditById: '1',
        updateCreditById: '1',
        deleteCreditById: '1',
        getSpendingById: '1',
        updateSpendingById: '1',
        deleteSpendingById: '1',
        getCategoryById: '1',
        updateCategoryById: '1',
        deleteCategoryById: '1',
        getGoalById: '1',
        updateGoalById: '1',
        setCurrentGoal: '1',
        deleteGoalById: '1',
    });

    // Синхронизация useMocks с конфигом
    useEffect(() => {
        setUseMocks(useMocks);
    }, [useMocks]);

    const toggleMocks = () => {
        setLocalUseMocks((prev) => !prev);
    };

    // Универсальный обработчик вызовов API
    const callApi = async (method, data = null, id = null) => {
        const apiMethods = {
            getUsers, signup, login, logout,
            addCredit, getCredits, getCreditsPermanent, getCreditById, updateCreditById, deleteCreditById,
            addSpending, getSpendings, getSpendingsPermanent, getSpendingById, updateSpendingById, deleteSpendingById,
            addCategory, getCategories, getCategoryById, updateCategoryById, deleteCategoryById,
            addGoal, getGoals, getGoalById, updateGoalById, setCurrentGoal, getCurrentGoal, deleteGoalById,
            getBalance,
            getRecommendations, getFinancialOverview,
        };

        try {
            let result;
            if (method === 'login' || method === 'signup') {
                result = await apiMethods[method](JSON.parse(data));
                if (result.data && result.data.access_token) {
                    setToken(result.data.access_token);
                }
            } else if (['getCreditById', 'updateCreditById', 'deleteCreditById',
                'getSpendingById', 'updateSpendingById', 'deleteSpendingById',
                'getCategoryById', 'updateCategoryById', 'deleteCategoryById',
                'getGoalById', 'updateGoalById', 'setCurrentGoal', 'deleteGoalById'].includes(method)) {
                result = await apiMethods[method](id, token);
            } else {
                result = await apiMethods[method](token ? token : undefined, ...(data ? [JSON.parse(data)] : []));
            }
            setResponse(result);
        } catch (error) {
            setResponse({ data: null, error: { message: error.message || 'API call failed', status: 500 } });
        }
    };

    // Компонент для рендеринга одной секции API-методов
    const renderSection = (title, methods) => (
        <div key={title} className="mb-6">
            {/* Заголовок секции */}
            <Text variant="h3" className="mb-4 text-primary-600">{title}</Text>
            <div className="space-y-4">
                {methods.map(({ name, method }) => (
                    <div key={method} className="p-4 bg-secondary-50 rounded-lg shadow-sm">
                        <div className="flex items-center space-x-3 mb-2">
                            <button
                                onClick={() => callApi(method, inputData[method], inputIds[method])}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition duration-200"
                            >
                                {name}
                            </button>
                            <Text variant="caption" className="text-secondary-600">Метод: {method}</Text>
                        </div>

                        {/* Поле ввода для методов с телом запроса */}
                        {['login', 'signup', 'addCredit', 'addSpending', 'addCategory', 'addGoal',
                            'updateCredit', 'updateSpending', 'updateCategory', 'updateGoal'].includes(method) && (
                            <textarea
                                value={inputData[method]}
                                onChange={(e) => setInputData({ ...inputData, [method]: e.target.value })}
                                className="w-full p-3 mt-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
                                rows="4"
                                placeholder="Введите данные для запроса в формате JSON"
                            />
                        )}

                        {/* Поле ввода для методов с ID */}
                        {['getCreditById', 'updateCreditById', 'deleteCreditById',
                            'getSpendingById', 'updateSpendingById', 'deleteSpendingById',
                            'getCategoryById', 'updateCategoryById', 'deleteCategoryById',
                            'getGoalById', 'updateGoalById', 'setCurrentGoal', 'deleteGoalById'].includes(method) && (
                            <input
                                type="text"
                                value={inputIds[method]}
                                onChange={(e) => setInputIds({ ...inputIds, [method]: e.target.value })}
                                className="w-full p-3 mt-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Введите ID"
                            />
                        )}

                        {/* Вывод результата */}
                        <pre className="mt-3 p-3 bg-background rounded-lg border border-secondary-200 text-sm text-secondary-800 overflow-auto">
                            {JSON.stringify(response, null, 2)}
                        </pre>
                    </div>
                ))}
            </div>
            {/* Разделительная линия */}
            <hr className="my-6 border-t-2 border-secondary-200" />
        </div>
    );

    // Основной рендер страницы
    return (
        <div className="min-h-screen bg-secondary-50 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Заголовок страницы */}
                <Text variant="h1" className="mb-6 text-primary-800">Тестирование API FinCoach</Text>

                {/* Переключатель моков */}
                <div className="mb-6 flex items-center space-x-3">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={useMocks}
                            onChange={toggleMocks}
                            className="h-5 w-5 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                        />
                        <Text variant="body">Использовать моки</Text>
                    </label>
                    {token && (
                        <Text variant="caption" className="text-secondary-600">
                            Токен: {token.slice(0, 20)}...
                        </Text>
                    )}
                </div>

                {/* Секции API */}
                {renderSection('Аутентификация', [
                    { name: 'Get Users', method: 'getUsers' },
                    { name: 'Signup', method: 'signup' },
                    { name: 'Login', method: 'login' },
                    { name: 'Logout', method: 'logout' },
                ])}
                {renderSection('Кредиты', [
                    { name: 'Add Credit', method: 'addCredit' },
                    { name: 'Get Credits', method: 'getCredits' },
                    { name: 'Get Permanent Credits', method: 'getCreditsPermanent' },
                    { name: 'Get Credit by ID', method: 'getCreditById' },
                    { name: 'Update Credit by ID', method: 'updateCreditById' },
                    { name: 'Delete Credit by ID', method: 'deleteCreditById' },
                ])}
                {renderSection('Расходы', [
                    { name: 'Add Spending', method: 'addSpending' },
                    { name: 'Get Spendings', method: 'getSpendings' },
                    { name: 'Get Permanent Spendings', method: 'getSpendingsPermanent' },
                    { name: 'Get Spending by ID', method: 'getSpendingById' },
                    { name: 'Update Spending by ID', method: 'updateSpendingById' },
                    { name: 'Delete Spending by ID', method: 'deleteSpendingById' },
                ])}
                {renderSection('Категории', [
                    { name: 'Add Category', method: 'addCategory' },
                    { name: 'Get Categories', method: 'getCategories' },
                    { name: 'Get Category by ID', method: 'getCategoryById' },
                    { name: 'Update Category by ID', method: 'updateCategoryById' },
                    { name: 'Delete Category by ID', method: 'deleteCategoryById' },
                ])}
                {renderSection('Цели', [
                    { name: 'Add Goal', method: 'addGoal' },
                    { name: 'Get Goals', method: 'getGoals' },
                    { name: 'Get Goal by ID', method: 'getGoalById' },
                    { name: 'Update Goal by ID', method: 'updateGoalById' },
                    { name: 'Set Current Goal', method: 'setCurrentGoal' },
                    { name: 'Get Current Goal', method: 'getCurrentGoal' },
                    { name: 'Delete Goal by ID', method: 'deleteGoalById' },
                ])}
                {renderSection('Баланс', [
                    { name: 'Get Balance', method: 'getBalance' },
                ])}
                {renderSection('Рекомендации', [
                    { name: 'Get Recommendations', method: 'getRecommendations' },
                    { name: 'Get Financial Overview', method: 'getFinancialOverview' },
                ])}
            </div>
        </div>
    );
}