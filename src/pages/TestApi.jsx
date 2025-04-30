import { useState, useEffect } from 'react';
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

    // Синхронизация useMocks с config.useMocks
    useEffect(() => {
        setUseMocks(useMocks);
    }, [useMocks]);

    // Переключение моков
    const toggleMocks = () => {
        setLocalUseMocks((prev) => !prev);
    };

    // Очистка токена
    const clearToken = () => {
        setToken('');
    };

    // Обновление входных данных
    const updateInputData = (method, value) => {
        setInputData((prev) => ({ ...prev, [method]: value }));
    };

    // Обновление ID
    const updateInputId = (method, value) => {
        setInputIds((prev) => ({ ...prev, [method]: value }));
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

        // Парсинг JSON для методов с данными
        const methodsWithData = [
            'signup',
            'login',
            'addCredit',
            'addSpending',
            'addCategory',
            'addGoal',
            'updateCreditById',
            'updateSpendingById',
            'updateCategoryById',
            'updateGoalById',
        ];
        let parsedData;
        if (methodsWithData.includes(method)) {
            try {
                parsedData = JSON.parse(inputData[method]);
            } catch {
                setResponse({
                    [section]: { [method]: { error: { message: 'Invalid JSON input', status: 400 } } },
                });
                return;
            }
        }

        // Парсинг ID для методов с ID
        const methodsWithId = [
            'getCreditById',
            'updateCreditById',
            'deleteCreditById',
            'getSpendingById',
            'updateSpendingById',
            'deleteSpendingById',
            'getCategoryById',
            'updateCategoryById',
            'deleteCategoryById',
            'getGoalById',
            'updateGoalById',
            'setCurrentGoal',
            'deleteGoalById',
        ];
        let parsedId;
        if (methodsWithId.includes(method)) {
            parsedId = parseInt(inputIds[method], 10);
            if (isNaN(parsedId)) {
                setResponse({
                    [section]: { [method]: { error: { message: 'Invalid ID', status: 400 } } },
                });
                return;
            }
        }

        try {
            let result;
            switch (method) {
                // Auth
                case 'getUsers':
                    result = await getUsers();
                    break;
                case 'signup':
                    result = await signup(parsedData);
                    break;
                case 'login':
                    result = await login(parsedData);
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
                    result = await addCredit(parsedData, token);
                    break;
                case 'getCredits':
                    result = await getCredits(token);
                    break;
                case 'getCreditsPermanent':
                    result = await getCreditsPermanent(token);
                    break;
                case 'getCreditById':
                    result = await getCreditById(parsedId, token);
                    break;
                case 'updateCreditById':
                    result = await updateCreditById(parsedId, parsedData, token);
                    break;
                case 'deleteCreditById':
                    result = await deleteCreditById(parsedId, token);
                    break;
                // Spendings
                case 'addSpending':
                    result = await addSpending(parsedData, token);
                    break;
                case 'getSpendings':
                    result = await getSpendings(token);
                    break;
                case 'getSpendingsPermanent':
                    result = await getSpendingsPermanent(token);
                    break;
                case 'getSpendingById':
                    result = await getSpendingById(parsedId, token);
                    break;
                case 'updateSpendingById':
                    result = await updateSpendingById(parsedId, parsedData, token);
                    break;
                case 'deleteSpendingById':
                    result = await deleteSpendingById(parsedId, token);
                    break;
                // Categories
                case 'addCategory':
                    result = await addCategory(parsedData, token);
                    break;
                case 'getCategories':
                    result = await getCategories(token);
                    break;
                case 'getCategoryById':
                    result = await getCategoryById(parsedId, token);
                    break;
                case 'updateCategoryById':
                    result = await updateCategoryById(parsedId, parsedData, token);
                    break;
                case 'deleteCategoryById':
                    result = await deleteCategoryById(parsedId, token);
                    break;
                // Goals
                case 'addGoal':
                    result = await addGoal(parsedData, token);
                    break;
                case 'getGoals':
                    result = await getGoals(token);
                    break;
                case 'getGoalById':
                    result = await getGoalById(parsedId, token);
                    break;
                case 'updateGoalById':
                    result = await updateGoalById(parsedId, parsedData, token);
                    break;
                case 'setCurrentGoal':
                    result = await setCurrentGoal(parsedId, token);
                    break;
                case 'getCurrentGoal':
                    result = await getCurrentGoal(token);
                    break;
                case 'deleteGoalById':
                    result = await deleteGoalById(parsedId, token);
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
                    <div key={method} style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                            onClick={() => callApi(method, section)}
                            style={{ padding: '5px 10px' }}
                        >
                            {name}
                        </button>
                        {[
                            'signup',
                            'login',
                            'addCredit',
                            'addSpending',
                            'addCategory',
                            'addGoal',
                            'updateCreditById',
                            'updateSpendingById',
                            'updateCategoryById',
                            'updateGoalById',
                        ].includes(method) && (
                            <textarea
                                value={inputData[method]}
                                onChange={(e) => updateInputData(method, e.target.value)}
                                placeholder="Edit JSON here"
                                style={{
                                    width: '300px',
                                    minHeight: '50px',
                                    maxHeight: '150px',
                                    padding: '5px',
                                    fontFamily: 'monospace',
                                    fontSize: '14px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                                    resize: 'vertical',
                                    outline: 'none',
                                }}
                            />
                        )}
                        {[
                            'getCreditById',
                            'updateCreditById',
                            'deleteCreditById',
                            'getSpendingById',
                            'updateSpendingById',
                            'deleteSpendingById',
                            'getCategoryById',
                            'updateCategoryById',
                            'deleteCategoryById',
                            'getGoalById',
                            'updateGoalById',
                            'setCurrentGoal',
                            'deleteGoalById',
                        ].includes(method) && (
                            <input
                                type="number"
                                value={inputIds[method]}
                                onChange={(e) => updateInputId(method, e.target.value)}
                                placeholder="Enter ID"
                                style={{
                                    width: '80px',
                                    padding: '5px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    outline: 'none',
                                }}
                            />
                        )}
                    </div>
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
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                    onClick={toggleMocks}
                    style={{ padding: '5px 10px' }}
                >
                    Mocks: {useMocks ? 'ON' : 'OFF'}
                </button>
                <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter token"
                    style={{
                        padding: '5px',
                        width: '300px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        outline: 'none',
                    }}
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