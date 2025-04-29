import { useState } from 'react';
import { getUseMocks, setUseMocks } from '../api/config';
import {
    getUsers,
    signup,
    login,
    logout,
} from '../api/auth';
import {
    addCredit,
    getCredits,
    getCreditsPermanent,
    getCreditById,
    updateCreditById,
    deleteCreditById,
} from '../api/credit';
import {
    addSpending,
    getSpendings,
    getSpendingsPermanent,
    getSpendingById,
    updateSpendingById,
    deleteSpendingById,
} from '../api/spendings';
import {
    addCategory,
    getCategories,
    getCategoryById,
    updateCategoryById,
    deleteCategoryById,
} from '../api/categories';
import {
    addGoal,
    getGoals,
    getGoalById,
    updateGoalById,
    setCurrentGoal,
    getCurrentGoal,
    deleteGoalById,
} from '../api/goals';
import { getBalance } from '../api/balance';
import {
    getRecommendations,
    getFinancialOverview,
} from '../api/recommendations';

// Тестовые данные для методов с телом запроса
const testData = {
    signup: { user_name: 'test', login: 'test', password: 'test' },
    login: { login: 'mot', password: 'mot' },
    addCredit: { amount: 1000000, description: 'Test credit', is_permanent: false },
    addSpending: { amount: 1000, description: 'Test spending', category_id: 1, is_permanent: false },
    addCategory: { name: 'Test Category', description: 'Test description' },
    addGoal: { amount: 1000000, description: 'Test goal', wish_date: '2025-12-31T00:00:00Z' },
    updateCredit: { amount: 2000000, description: 'Updated credit', is_permanent: true },
    updateSpending: { amount: 2000, description: 'Updated spending', category_id: 1, is_permanent: true },
    updateCategory: { name: 'Updated Category', description: 'Updated description' },
    updateGoal: { amount: 2000000, description: 'Updated goal', wish_date: '2026-12-31T00:00:00Z' },
};

export default function TestApi() {
    const [useMocks, setLocalUseMocks] = useState(getUseMocks());
    const [token, setToken] = useState('');
    const [response, setResponse] = useState({});

    // Переключение моков
    const toggleMocks = () => {
        const newValue = !useMocks;
        setLocalUseMocks(newValue);
        setUseMocks(newValue);
    };

    // Очистка токена
    const clearToken = () => {
        setToken('');
    };

    // Обработчик API-вызовов
    const callApi = async (method, section) => {
        // Проверка токена для авторизованных методов
        const requiresToken = !['getUsers', 'signup', 'login'].includes(method);
        if (requiresToken && !token) {
            setResponse({
                [section]: { [method]: { error: { message: 'Token required', status: 401 } } },
            });
            return;
        }

        try {
            let result;
            switch (method) {
                // Auth
                case 'getUsers':
                    result = await getUsers();
                    break;
                case 'signup':
                    result = await signup(testData.signup);
                    break;
                case 'login':
                    result = await login(testData.login);
                    if (result.data?.access_token) {
                        setToken(result.data.access_token);
                    }
                    break;
                case 'logout':
                    result = await logout(token);
                    if (result.data?.status === 200) {
                        setToken('');
                    }
                    break;
                // Credit
                case 'addCredit':
                    result = await addCredit(testData.addCredit, token);
                    break;
                case 'getCredits':
                    result = await getCredits(token);
                    break;
                case 'getCreditsPermanent':
                    result = await getCreditsPermanent(token);
                    break;
                case 'getCreditById':
                    result = await getCreditById(1, token);
                    break;
                case 'updateCreditById':
                    result = await updateCreditById(1, testData.updateCredit, token);
                    break;
                case 'deleteCreditById':
                    result = await deleteCreditById(1, token);
                    break;
                // Spendings
                case 'addSpending':
                    result = await addSpending(testData.addSpending, token);
                    break;
                case 'getSpendings':
                    result = await getSpendings(token);
                    break;
                case 'getSpendingsPermanent':
                    result = await getSpendingsPermanent(token);
                    break;
                case 'getSpendingById':
                    result = await getSpendingById(1, token);
                    break;
                case 'updateSpendingById':
                    result = await updateSpendingById(1, testData.updateSpending, token);
                    break;
                case 'deleteSpendingById':
                    result = await deleteSpendingById(1, token);
                    break;
                // Categories
                case 'addCategory':
                    result = await addCategory(testData.addCategory, token);
                    break;
                case 'getCategories':
                    result = await getCategories(token);
                    break;
                case 'getCategoryById':
                    result = await getCategoryById(1, token);
                    break;
                case 'updateCategoryById':
                    result = await updateCategoryById(1, testData.updateCategory, token);
                    break;
                case 'deleteCategoryById':
                    result = await deleteCategoryById(1, token);
                    break;
                // Goals
                case 'addGoal':
                    result = await addGoal(testData.addGoal, token);
                    break;
                case 'getGoals':
                    result = await getGoals(token);
                    break;
                case 'getGoalById':
                    result = await getGoalById(1, token);
                    break;
                case 'updateGoalById':
                    result = await updateGoalById(1, testData.updateGoal, token);
                    break;
                case 'setCurrentGoal':
                    result = await setCurrentGoal(1, token);
                    break;
                case 'getCurrentGoal':
                    result = await getCurrentGoal(token);
                    break;
                case 'deleteGoalById':
                    result = await deleteGoalById(1, token);
                    break;
                // Balance
                case 'getBalance':
                    result = await getBalance(token);
                    break;
                // Recommendations
                case 'getRecommendations':
                    result = await getRecommendations(token);
                    break;
                case 'getFinancialOverview':
                    result = await getFinancialOverview(token);
                    break;
                default:
                    throw new Error('Unknown method');
            }
            setResponse((prev) => ({
                ...prev,
                [section]: { ...prev[section], [method]: result },
            }));
        } catch (error) {
            setResponse((prev) => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [method]: { error: { message: error.message, status: 500 } },
                },
            }));
        }
    };

    // Рендеринг секции
    const renderSection = (section, methods) => (
        <div style={{ marginBottom: '20px' }}>
            <h2>{section}</h2>
            <div style={{ marginBottom: '10px' }}>
                {methods.map(({ name, method }) => (
                    <button
                        key={method}
                        onClick={() => callApi(method, section)}
                        style={{ marginRight: '10px', padding: '5px 10px' }}
                    >
                        {name}
                    </button>
                ))}
            </div>
            {response[section] && (
                <pre style={{ background: '#f4f4f4', padding: '10px', maxHeight: '300px', overflow: 'auto' }}>
          {JSON.stringify(response[section], null, 2)}
        </pre>
            )}
        </div>
    );

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Test API</h1>
            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={toggleMocks}
                    style={{ padding: '5px 10px', marginRight: '10px' }}
                >
                    Mocks: {useMocks ? 'ON' : 'OFF'}
                </button>
                <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter token"
                    style={{ padding: '5px', width: '300px', marginRight: '10px' }}
                />
                <button
                    onClick={clearToken}
                    style={{ padding: '5px 10px' }}
                >
                    Clear Token
                </button>
            </div>
            {renderSection('Auth', [
                { name: 'Get Users', method: 'getUsers' },
                { name: 'Signup', method: 'signup' },
                { name: 'Login', method: 'login' },
                { name: 'Logout', method: 'logout' },
            ])}
            {renderSection('Credit', [
                { name: 'Add Credit', method: 'addCredit' },
                { name: 'Get Credits', method: 'getCredits' },
                { name: 'Get Permanent Credits', method: 'getCreditsPermanent' },
                { name: 'Get Credit by ID', method: 'getCreditById' },
                { name: 'Update Credit by ID', method: 'updateCreditById' },
                { name: 'Delete Credit by ID', method: 'deleteCreditById' },
            ])}
            {renderSection('Spendings', [
                { name: 'Add Spending', method: 'addSpending' },
                { name: 'Get Spendings', method: 'getSpendings' },
                { name: 'Get Permanent Spendings', method: 'getSpendingsPermanent' },
                { name: 'Get Spending by ID', method: 'getSpendingById' },
                { name: 'Update Spending by ID', method: 'updateSpendingById' },
                { name: 'Delete Spending by ID', method: 'deleteSpendingById' },
            ])}
            {renderSection('Categories', [
                { name: 'Add Category', method: 'addCategory' },
                { name: 'Get Categories', method: 'getCategories' },
                { name: 'Get Category by ID', method: 'getCategoryById' },
                { name: 'Update Category by ID', method: 'updateCategoryById' },
                { name: 'Delete Category by ID', method: 'deleteCategoryById' },
            ])}
            {renderSection('Goals', [
                { name: 'Add Goal', method: 'addGoal' },
                { name: 'Get Goals', method: 'getGoals' },
                { name: 'Get Goal by ID', method: 'getGoalById' },
                { name: 'Update Goal by ID', method: 'updateGoalById' },
                { name: 'Set Current Goal', method: 'setCurrentGoal' },
                { name: 'Get Current Goal', method: 'getCurrentGoal' },
                { name: 'Delete Goal by ID', method: 'deleteGoalById' },
            ])}
            {renderSection('Balance', [
                { name: 'Get Balance', method: 'getBalance' },
            ])}
            {renderSection('Recommendations', [
                { name: 'Get Recommendations', method: 'getRecommendations' },
                { name: 'Get Financial Overview', method: 'getFinancialOverview' },
            ])}
        </div>
    );
}