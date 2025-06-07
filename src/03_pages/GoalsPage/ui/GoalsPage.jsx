// GoalsPage/ui/GoalsPage.jsx
import React from 'react';
import Text from '../../../04_components/ui/Text';
import TextButton from '../../../04_components/ui/TextButton';
import useGoalsStore from '../../../02_stores/goalsStore/goalsStore.ts';
import useModalStore from '../../../02_stores/modalStore';
import useBalanceStore from '../../../02_stores/balanceStore/balanceStore.ts';
import GoalsCardList from '../../../04_components/mobile/GoalsCardList';
import Table from '../../../04_components/ui/Table';
import {goalsPageHandlers} from '../utils/goalsPageHandlers.js';
import {getGoalColumns} from '../config/tableColumns';

export default function GoalsPage() {
    // Хуки сторов
    const { goals, loading, error, currentGoal, clearError } = useGoalsStore();
    const { balance, isLoading: isBalanceLoading } = useBalanceStore();
    const { openModal, closeModal } = useModalStore();

    // Получаем хендлеры из кастомного хука
    const { handleAddClick, handleEditClick, handleDeleteClick, handleSetCurrentClick } = goalsPageHandlers({
        currentGoal,
        clearError,
        openModal,
        closeModal
    });

    // Конфигурация колонок таблицы
    const goalColumns = getGoalColumns(currentGoal, balance, handleEditClick, handleDeleteClick, handleSetCurrentClick);

    // Вычисляемые значения
    const displayError = error;

    // Функции рендеринга
    const renderCurrentGoalSection = () => {
        if (loading || isBalanceLoading) {
            return (
                <div className="text-blue-700">
                    <Text variant="body">Загрузка текущей цели и баланса...</Text>
                </div>
            );
        }

        if (currentGoal) {
            return (
                <div className="flex items-center flex-wrap gap-x-4">
                    <Text variant="body" className="font-semibold">{currentGoal.description}</Text>
                    <Text variant="body">
                        Сумма: {typeof currentGoal.amount === 'number'
                        ? currentGoal.amount.toLocaleString('ru-RU', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })
                        : currentGoal.amount} ₽
                    </Text>
                    {currentGoal.wish_date && currentGoal.wish_date !== "0001-01-01T00:00:00Z" && (
                        <Text variant="body">
                            Желаемая дата: {new Date(currentGoal.wish_date).toLocaleDateString('ru-RU')}
                        </Text>
                    )}
                    {currentGoal.is_achieved && currentGoal.achievement_date && currentGoal.achievement_date !== "0001-01-01T00:00:00Z" && (
                        <Text variant="body" className="text-green-700">
                            Достигнута: {new Date(currentGoal.achievement_date).toLocaleDateString('ru-RU')}
                        </Text>
                    )}
                </div>
            );
        }

        return (
            <Text variant="body" className="text-blue-700 ml-2">
                Текущая цель не установлена.
            </Text>
        );
    };

    const renderGoalsContent = () => {
        if (loading && goals === null && !isBalanceLoading) {
            return (
                <div className="text-center p-4">
                    <Text variant="body">Загрузка списка целей...</Text>
                </div>
            );
        }

        if (!loading && goals !== null && goals.length === 0) {
            return (
                <div className="p-4 text-center">
                    <Text variant="body">У вас пока нет добавленных целей.</Text>
                </div>
            );
        }

        const shouldShowTable = (goals !== null && goals.length > 0) || (loading && goals === null);

        if (shouldShowTable) {
            return (
                <>
                    <Table
                        data={goals || []}
                        columns={goalColumns}
                        loading={loading}
                        emptyMessage="У вас пока нет добавленных целей."
                        className="min-w-full hidden md:table"
                    />
                    <GoalsCardList
                        className="block md:hidden"
                        goals={goals}
                        currentGoal={currentGoal}
                        balance={balance}
                        loading={loading}
                        currentGoalLoading={loading}
                        isBalanceLoading={isBalanceLoading}
                        handleEditClick={handleEditClick}
                        handleDeleteClick={handleDeleteClick}
                        handleSetCurrentClick={handleSetCurrentClick}
                    />
                    {loading && goals !== null && goals.length > 0 && (
                        <div className="text-center p-4">
                            <Text variant="body">Обновление списка целей...</Text>
                        </div>
                    )}
                </>
            );
        }

        return null;
    };

    return (
        <div className="bg-secondary-50">
            <main className="max-w-7xl mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <Text variant="h2">Мои цели</Text>
                    <TextButton onClick={handleAddClick}>
                        Добавить цель
                    </TextButton>
                </div>

                {displayError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {displayError.message}
                    </div>
                )}

                <div className="hidden md:block mb-6 p-4 bg-blue-100 border border-blue-300 rounded-md shadow-sm">
                    <Text variant="h3" className="mb-2 text-blue-800">Текущая цель:</Text>
                    {renderCurrentGoalSection()}
                </div>

                <div>
                    {renderGoalsContent()}
                </div>
            </main>
        </div>
    );
}
