// src/components/GoalProgressWidget.jsx
import React from 'react';
import useGoalsStore from '../../stores/goalsStore.js'; // Импортируем стор Целей
import useBalanceStore from '../../stores/balanceStore.js'; // Импортируем стор Баланса
import Text from '../ui/Text.jsx'; // Импортируем компонент Text


// --- Вспомогательная функция для правильного склонения слова "день" ---
const getDaysNoun = (num) => {
    const absNum = Math.abs(num);
    if (absNum % 100 >= 11 && absNum % 100 <= 19) {
        return 'дней';
    }
    const lastDigit = absNum % 10;
    if (lastDigit === 1) {
        return 'день';
    } else if (lastDigit >= 2 && lastDigit <= 4) {
        return 'дня';
    } else {
        return 'дней';
    }
};


export default function GoalProgressWidget() {
    const { currentGoal, currentGoalLoading } = useGoalsStore();
    const { balance, isLoading: isBalanceLoading } = useBalanceStore();

    const isLoading = currentGoalLoading || isBalanceLoading;

    // --- Расчеты Прогресса ---
    let percentage = 0;
    let remainingAmount = null;

    if (currentGoal && typeof balance === 'number' && typeof currentGoal.amount === 'number' && currentGoal.amount > 0) {
        const achieved = balance >= 0 ? balance : 0;
        percentage = Math.min((achieved / currentGoal.amount) * 100, 100);
        remainingAmount = Math.max(0, currentGoal.amount - achieved);
    }

    // --- Расчет Оставшихся Дней и формирование текста даты ---
    let remainingDays = null;
    let daysText = '';

    if (currentGoal && currentGoal.wish_date && currentGoal.wish_date !== "0001-01-01T00:00:00Z") {
        try {
            const wishDate = new Date(currentGoal.wish_date);
            const currentDate = new Date();
            wishDate.setHours(0, 0, 0, 0);
            currentDate.setHours(0, 0, 0, 0);

            const timeDifference = wishDate.getTime() - currentDate.getTime();
            const dayDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

            remainingDays = dayDifference;

            if (remainingDays > 0) {
                daysText = `${remainingDays} ${getDaysNoun(remainingDays)}`;
            } else if (remainingDays === 0) {
                daysText = 'сегодня';
            } else {
                daysText = `просрочено на ${Math.abs(remainingDays)} ${getDaysNoun(Math.abs(remainingDays))}`;
            }
        } catch (e) {
            console.error("Error calculating remaining days:", e);
            daysText = 'Некорректная дата';
        }
    } else {
        daysText = 'Дата не указана';
    }
    // --- Конец Расчета Оставшихся Дней ---


    // --- Логика Определения Цвета Сегментов ---
    const numSegments = 40;
    const segments = Array.from({ length: numSegments });

    const getSegmentColorClass = (segmentIndex, totalPercentage) => {
        const segmentEndPercentage = ((segmentIndex + 1) / numSegments) * 100;

        if (totalPercentage >= segmentEndPercentage) {
            const barPercentagePoint = segmentEndPercentage;

            if (barPercentagePoint <= 25) return 'bg-red-500';
            if (barPercentagePoint <= 50) return 'bg-orange-500';
            if (barPercentagePoint <= 75) return 'bg-yellow-500';
            if (barPercentagePoint <= 100) return 'bg-green-500';
            return 'bg-green-500';

        } else {
            return 'bg-gray-300';
        }
    };

    // --- Условный рендеринг Виджета ---

    if (isLoading) {
        return (
            // Контейнер плейсхолдера: ширина w-full на мобильных, w-2/3 на десктопах
            <div className="flex-shrink-0 w-full md:w-2/3 text-right"> {/* ИЗМЕНЕНО w-1/3 на w-2/3, добавлен w-full */}
                <Text variant="body" className="text-secondary-600 italic">
                    Загрузка цели и баланса...
                </Text>
            </div>
        );
    }

    if (!currentGoal) {
        return (
            // Контейнер для сообщения об отсутствии цели: ширина w-full на мобильных, w-2/3 на дескпопах
            <div className="flex-shrink-0 w-full md:w-2/3 text-left"> {/* ИЗМЕНЕНО w-1/3 на w-2/3, добавлен w-full */}
                <Text variant="body" className="text-blue-700 font-semibold italic">
                    Вы еще не установили для себя главную финансовую цель. Усильте мотивацию, выберите цель!
                </Text>
            </div>
        );
    }

    if (currentGoal.is_achieved || percentage >= 100) {
        let achievedText = '';
        if (currentGoal.achievement_date && currentGoal.achievement_date !== "0001-01-01T00:00:00Z") {
            try {
                const achievedDate = new Date(currentGoal.achievement_date);
                achievedText = `Установленная Вами цель достигнута ${achievedDate.toLocaleDateString('ru-RU')}! Поздравляем! 🎉`; // Формат даты
            } catch (e) {
                console.error("Error formatting achievement date:", e);
            }
        }
        return (
            // Контейнер для сообщения о достижении цели: ширина w-full на мобильных, w-2/3 на десктопах
            <div className=" flex-shrink-0 w-full md:w-2/3 text-left"> {/* ИЗМЕНЕНО w-1/3 на w-2/3, добавлен w-full */}
                <Text variant="body" className="text-green-700 font-semibold italic">
                    {achievedText}
                </Text>
            </div>
        );
    }


    if (typeof currentGoal.amount !== 'number' || currentGoal.amount <= 0) {
        return (
            // Сообщение об ошибке суммы цели: ширина w-full на мобильных, w-2/3 на десктопах
            <div className="flex-shrink-0 w-full md:w-2/3 text-right"> {/* ИЗМЕНЕНО w-1/3 на w-2/3, добавлен w-full */}
                <Text variant="body" className="text-red-500 italic">
                    Сумма цели должна быть &gt; 0.
                </Text>
            </div>
        );
    }

    const formattedRemainingAmount = typeof remainingAmount === 'number'
        ? remainingAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '--.--';

    // Формируем полную строку текста для верхней строки, ВКЛЮЧАЯ неразрывный значок рубля
    let infoText = '';
    const daysPart = (daysText && daysText !== 'Дата не указана' && daysText !== 'Некорректная дата') ? `${daysText}, ` : '';
    // Используем неразрывный пробел перед знаком рубля
    infoText = `До текущей цели осталось ${daysPart}${formattedRemainingAmount}${'\u00A0'}₽`; // Неразрывный пробел перед знаком рубля

    if (daysText === 'Дата не указана' || daysText === 'Некорректная дата') {
        infoText += ` (${daysText})`;
    }

    const formattedPercentage = percentage.toFixed(0);
    return (
        // Главный контейнер виджета прогресса
        // flex-shrink-0: предотвращает сжатие
        // w-full: занимает всю доступную ширину на мобильных/планшетах
        // md:w-2/3: занимает 2/3 ширины на десктопах
        // flex flex-col: элементы внутри выстраиваются в колонку
        // items-start: выравнивает ДОЧЕРНИЕ ЭЛЕМЕНТЫ КОЛОНКИ по левому краю
        <div className="w-full md:w-2/3 flex flex-col items-start"> {/* ИЗМЕНЕНО: w-1/3 на w-2/3, добавлен w-full, удален text-right */}

            {/* Верхняя строка текста (со значком рубля) */}
            {/* Обернута в div w-full flex justify-end, чтобы она сама выравнивалась по правому краю */}
            <div className="w-full flex md:justify-end md:ml-2">
                <Text variant="body" className="text-secondary-800 text-sm">
                    {infoText}
                </Text>
            </div>

            {/* Контейнер для Полосы Прогресса и Процентов */}
            {/* w-full: занимает всю доступную ширину в родительском flex-col */}
            {/* flex items-center: располагает элементы в строку и выравнивает по центру по вертикали */}
            {/* Этот контейнер теперь начинается от левого края родителя (из-за items-start) */}
            <div className="w-full flex items-center md:ml-2">
                {/* Контейнер Полосы Прогресса */}
                {/* flex-grow: занимает все оставшееся место в строке после блока процентов */}
                {/* h-4, bg-gray-300, rounded, overflow-hidden */}
                {/* mr-1: небольшой правый отступ перед блоком процентов */}
                <div className="flex-grow flex h-4 bg-gray-300 rounded overflow-hidden mr-1">
                    {/* Отрисовываем сегменты полосы */}
                    {segments.map((_, index) => (
                        <div
                            key={index}
                            className={`h-full flex-grow border-r border-white last:border-r-0 ${getSegmentColorClass(index, percentage)}`}
                            style={{ flexBasis: `${100 / numSegments}%` }}
                        ></div>
                    ))}
                </div>

                {/* Контейнер для Процентов */}
                {/* flex-shrink-0: предотвращает сжатие */}
                {/* text-right: выравнивание текста внутри */}
                {/* minWidth: чтобы процент всегда помещался */}
                <div className="flex-shrink-0 text-right" style={{ minWidth: '40px' }}> {/* Удален ml-0, т.к. mr-1 на баре, удален flex-grow */}
                    <Text variant="body" className="text-secondary-800 font-semibold">{formattedPercentage}%</Text>
                </div>
            </div>
        </div>
    );
}