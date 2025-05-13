// src/components/GoalsCardList.jsx
import React from 'react';
import Text from './ui/Text';
import IconButton from './ui/IconButton';
import {CheckCircleIcon, PencilIcon, StarIcon, TrashIcon, XCircleIcon} from '@heroicons/react/24/outline'; // Добавлен StarIcon

const GoalsCardList = ({
                           goals,
                           currentGoal,
                           balance, // Получаем баланс для расчета процента
                           loading, // Получаем статус загрузки для индикатора
                           currentGoalLoading, // Статус загрузки текущей цели
                           isBalanceLoading, // Статус загрузки баланса
                           handleEditClick,
                           handleDeleteClick,
                           handleSetCurrentClick, // Обработчик для установки текущей цели
                           className
                       }) => {
    // --- Расчет процента и определение класса цвета для иконки (для мобильной плашки текущей цели) ---
    let percentage = 0;
    let starColorClass = 'text-gray-500'; // Цвет по умолчанию

    // Рассчитываем процент только если это текущая цель, баланс и сумма цели - числа и сумма цели > 0
    if (currentGoal && typeof balance === 'number' && typeof currentGoal.amount === 'number' && currentGoal.amount > 0) {
        const achieved = balance >= 0 ? balance : 0; // Достигнутая часть
        percentage = Math.min((achieved / currentGoal.amount) * 100, 100); // Процент (не более 100)

        // Определяем класс цвета на основе процента
        if (percentage < 25) {
            starColorClass = 'text-red-500';
        } else if (percentage < 50) {
            starColorClass = 'text-orange-500';
        } else if (percentage < 75) {
            starColorClass = 'text-yellow-500';
        } else { // percentage >= 75
            starColorClass = 'text-green-500';
        }
        if (percentage >= 100) {
            starColorClass = 'text-green-600';
        }
    }
    // --- Конец расчета для мобильной плашки ---

    // Основной контейнер для мобильного представления: плашка текущей цели + сетка карточек
    return (
        <div className={`block md:hidden ${className}`}> {/* Этот div виден только на мобильных */}

            {/* Секция для Текущей цели (мобильная версия) */}
            {/* Используем стили, похожие на десктопную плашку */}
            <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-md shadow-sm">
                <Text variant="h3" className="mb-2 text-blue-800">Текущая цель:</Text>
                {currentGoalLoading || isBalanceLoading ? (
                    <div className="text-blue-700"><Text variant="body">Загрузка текущей цели и баланса...</Text></div>
                ) : currentGoal ? (
                    <div className="flex items-start flex-wrap gap-x-4 gap-y-2"> {/* items-start для выравнивания текста */}
                        {/* Описание цели с иконкой звезды по цвету процента */}
                        <div className="flex items-center"> {/* Контейнер для иконки и текста */}
                            {/* Иконка звезды с цветом по проценту */}
                            <StarIcon className={`w-5 h-5 mr-1 ${starColorClass}`} />
                            <Text variant="body" className="font-semibold text-blue-900">{currentGoal.description}</Text> {/* Более темный цвет для описания текущей */}
                        </div>
                        {/* Сумма цели */}
                        <Text variant="body" className="text-blue-800"> {/* Цвет текста для суммы */}
                            Сумма: {typeof currentGoal.amount === 'number'
                                ? currentGoal.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                : currentGoal.amount}
                            {'\u00A0'}₽ {/* Неразрывный пробел */}
                        </Text>
                        {/* Желаемая дата */}
                        {currentGoal.wish_date && currentGoal.wish_date !== "0001-01-01T00:00:00Z" && (
                            <Text variant="body" className="text-blue-800">Желаемая дата: {new Date(currentGoal.wish_date).toLocaleDateString('ru-RU')}</Text>
                            )}
                        {/* Достигнута / Дата достижения */}
                        {currentGoal.is_achieved && currentGoal.achievement_date && currentGoal.achievement_date !== "0001-01-01T00:00:00Z" ? (
                            <Text variant="body" className="text-green-700">Достигнута: {new Date(currentGoal.achievement_date).toLocaleDateString('ru-RU')}</Text> // Формат даты
                        ) : (
                            // Добавляем индикатор прогресса, если цель не достигнута
                            currentGoal.amount > 0 && typeof balance === 'number' && typeof currentGoal.amount === 'number' && ( // Проверяем, что можно рассчитать прогресс
                                <Text variant="body" className={`font-semibold ${percentage >= 100 ? 'text-green-700' : 'text-blue-800'}`}> {/* Цвет текста прогресса */}
                                    Прогресс: {percentage.toFixed(0)}% {/* Округление процента */}
                                </Text>
                            )
                        )}
                    </div>
                ) : (
                    <Text variant="body" className="text-blue-700 ml-2">Текущая цель не установлена.</Text>
                )}
            </div>


            {/* Сетка карточек целей */}
            {/* Используем Grid для создания карточек одинаковой высоты */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] px-4 pt-4 pb-8 gap-4"> {/* p-4 убрано, т.к. есть на родительском div */}
                {goals !== null && goals.length > 0 ? (
                    goals.map((goal, index) => {
                        const isCurrent = currentGoal && currentGoal.id === goal.id;
                        // Для карточек не нужно повторно рассчитывать starColorClass,
                        // т.к. индикатор текущей цели будет в отдельной верхней плашке.
                        // В карточке будет только кнопка "Установить текущей".

                        return (
                            // Карточка одной цели
                            <div key={goal.id} className="p-3 bg-background rounded-md shadow-xl flex flex-col justify-between gap-1"> {/* min-w и min-h убраны */}
                                {/* Описание */}
                                <Text variant="tdPrimary" className="text-sm font-semibold truncate">
                                    {goal.description || `Цель #${index + 1}`}
                                </Text>
                                {/* Сумма */}
                                <div className="flex items-center gap-1">
                                    <Text variant="tdSecondary" className="text-xs font-normal text-gray-600">
                                        Сумма:
                                    </Text>
                                    <Text variant="tdPrimary" className="text-sm text-blue-700 font-semibold"> {/* Цвет суммы для обычных целей */}
                                        {typeof goal.amount === 'number'
                                            ? goal.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                            : goal.amount}
                                        {'\u00A0'}₽ {/* Неразрывный пробел */}
                                    </Text>
                                </div>
                                {/* Желаемая дата */}
                                <div className="flex items-center gap-1">
                                    <Text variant="tdSecondary" className="text-xs text-gray-600">
                                        Дата:
                                    </Text>
                                    <Text variant="tdSecondary" className="text-xs">
                                        {goal.wish_date && goal.wish_date !== "0001-01-01T00:00:00Z" ? new Date(goal.wish_date).toLocaleDateString('ru-RU') : '-'} {/* Формат даты */}
                                    </Text>
                                </div>
                                {/* Статус цели (достигнута/нет) */}
                                <div className="flex items-center gap-1">
                                    {goal.is_achieved ? (
                                        <>
                                            <CheckCircleIcon className="h-3 w-3 text-green-500" /> {/* Зеленая иконка, если достигнута */}
                                            <Text variant="tdSecondary" className="text-xs text-green-700">
                                                Достигнута {/* Текст статуса */}
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <XCircleIcon className="h-3 w-3 text-gray-400" /> {/* Серая иконка, если не достигнута */}
                                            <Text variant="tdSecondary" className="text-xs text-gray-600">
                                                Не достигнута {/* Текст статуса */}
                                            </Text>
                                        </>
                                    )}
                                </div>
                                {/* Действия */}
                                <div className="flex gap-1 mt-auto"> {/* mt-auto чтобы кнопки были внизу карточки */}
                                    <IconButton
                                        icon={PencilIcon}
                                        tooltip="Редактировать"
                                        className="p-1 text-primary-600 hover:bg-primary-600/10 hover:text-primary-500"
                                        onClick={() => handleEditClick(goal)}
                                    />
                                    {/* Кнопка "Установить текущей": отображаем только если цель НЕ текущая */}
                                    {!isCurrent && (
                                        <IconButton
                                            icon={StarIcon}
                                            tooltip="Установить как текущую"
                                            className="p-1 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                                            onClick={() => handleSetCurrentClick(goal)}
                                        />
                                    )}
                                    <IconButton
                                        icon={TrashIcon}
                                        tooltip="Удалить"
                                        className="p-1 text-accent-error hover:bg-accent-error/10 hover:text-accent-error/80"
                                        onClick={() => handleDeleteClick(goal)}
                                    />
                                </div>
                            </div>
                        );
                    })
                ) : (
                    // Состояние "Нет целей" внутри контейнера Grid
                    <div className="col-span-full p-4 text-center"> {/* col-span-full чтобы текст занимал всю ширину */}
                        <Text variant="body">У вас пока нет добавленных целей.</Text>
                    </div>
                )}
                {/* Индикатор загрузки/обновления внутри контейнера Grid */}
                {loading && goals !== null ? (
                    <div className="col-span-full text-center p-4"> {/* col-span-full чтобы индикатор занимал всю ширину */}
                        <Text variant="body">Обновление списка целей...</Text>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default GoalsCardList;