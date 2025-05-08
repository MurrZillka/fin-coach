// src/components/GoalProgressWidget.jsx
import React from 'react';
import useGoalsStore from '../stores/goalsStore'; // Импортируем стор Целей
import useBalanceStore from '../stores/balanceStore'; // Импортируем стор Баланса
import Text from './ui/Text'; // Импортируем компонент Text


export default function GoalProgressWidget() {
    // Получаем текущую цель и статус загрузки из стора Целей
    const { currentGoal, currentGoalLoading } = useGoalsStore();
    // Получаем баланс и статус его загрузки из стора Баланса (переименовываем isLoading)
    const { balance, isLoading: isBalanceLoading } = useBalanceStore();

    // Общий статус загрузки виджета
    const isLoading = currentGoalLoading || isBalanceLoading;

    // --- Расчеты Прогресса ---
    let percentage = 0; // Процент достижения цели
    let remainingAmount = null; // Оставшаяся сумма до цели

    // Выполняем расчеты только если есть загруженная текущая цель, загруженный баланс,
    // и целевая сумма является положительным числом (чтобы избежать деления на ноль)
    if (currentGoal && typeof balance === 'number' && typeof currentGoal.amount === 'number' && currentGoal.amount > 0) {
        // Достигнутая часть - это текущий баланс (если он >= 0)
        const achieved = balance >= 0 ? balance : 0;
        // Процент достижения: (достигнуто / цель) * 100. Ограничиваем 100%.
        percentage = Math.min((achieved / currentGoal.amount) * 100, 100);
        // Оставшаяся сумма: цель - достигнуто. Минимум 0.
        remainingAmount = Math.max(0, currentGoal.amount - achieved);
    }

    // --- Логика Определения Цвета Сегментов (базовая версия) ---
    const numSegments = 20; // Количество прямоугольников в полоске прогресса
    const segments = Array.from({ length: numSegments }); // Массив для отрисовки кубиков

    // Вспомогательная функция для получения CSS класса цвета для сегмента
    // Основана на общем проценте достижения цели
    const getSegmentColorClass = (segmentIndex, totalPercentage) => {
        // Процент прогресса, соответствующий концу текущего сегмента (от 0 до 100)
        const segmentEndPercentage = ((segmentIndex + 1) / numSegments) * 100;

        if (totalPercentage >= segmentEndPercentage) {
            // Если общий прогресс достиг или превысил конец сегмента, он "заполнен".
            // Определяем его цвет на основе процента, который он представляет.
            // Для простой версии: переключаем цвет на определенных порогах
            const barPercentagePoint = segmentEndPercentage; // Используем конец сегмента как точку отсчета для цвета

            if (barPercentagePoint <= 25) return 'bg-red-500';      // Красный до 25%
            if (barPercentagePoint <= 50) return 'bg-orange-500';   // Оранжевый до 50%
            if (barPercentagePoint <= 75) return 'bg-yellow-500';   // Желтый до 75%
            if (barPercentagePoint <= 100) return 'bg-green-500';  // Зеленый до 100%
            // Если процент > 100, все сегменты зеленые (обработано ограничением percentage)
            return 'bg-green-500';

        } else {
            // Сегмент еще не достигнут
            return 'bg-gray-300'; // Цвет незаполненного сегмента (светло-серый)
        }

        // Для плавного перехода цвета (красный->оранжевый->желтый->зеленый) потребовалась бы более сложная функция
        // интерполяции цвета, которая на вход принимает процент (0-100) и возвращает hex-код или RGB цвет.
    };

    // --- Условный рендеринг Виджета ---

    // Состояние загрузки
    if (isLoading) {
        return (
            // Контейнер плейсхолдера в правой части (используем те же классы, что были в BalanceWidget)
            <div className="flex-shrink-0 w-1/3 text-right">
                <Text variant="body" className="text-secondary-600 italic">
                    Загрузка цели и баланса...
                </Text>
            </div>
        );
    }

    // Если нет текущей цели или она достигнута
    if (!currentGoal || currentGoal.is_achieved) {
        return (
            // Контейнер для сообщения об отсутствии/достижении цели
            <div className="flex-shrink-0 w-1/3 text-right">
                <Text variant="body" className="text-secondary-600 italic">
                    {/* Отображаем разный текст в зависимости от наличия цели и ее статуса */}
                    {currentGoal ? 'Текущая цель достигнута!' : 'Текущая цель не установлена.'}
                </Text>
            </div>
        );
    }

    // --- Рендеринг Виджета Прогресса, если есть текущая, недостигнутая цель ---

    // Форматируем оставшуюся сумму для отображения
    const formattedRemainingAmount = typeof remainingAmount === 'number'
        ? remainingAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '--.--';

    // Форматируем процент для отображения (округляем)
    const formattedPercentage = percentage.toFixed(0); // Округляем до целых процентов

    return (
        // Главный контейнер виджета прогресса (используем те же классы, что были в плейсхолдере)
        // flex-col items-end: располагаем элементы в колонку по правому краю
        <div className="flex-shrink-0 w-1/3 text-right flex flex-col items-end">

            {/* Текст: Сколько осталось до цели */}
            {/* Отображаем этот текст только если remainingAmount > 0 */}
            {remainingAmount > 0 && (
                <Text variant="body" className="text-secondary-800 mb-1"> {/* mb-1: небольшой нижний отступ */}
                    До достижения цели осталось: {formattedRemainingAmount} ₽
                </Text>
            )}
            {/* Текст: Если цель достигнута или превышена (хотя этот компонент рендерится только для !is_achieved) */}
            {/* Этот блок, скорее всего, не будет рендериться здесь, но оставим его для полноты */}
            {remainingAmount <= 0 && percentage >= 100 && !currentGoal.is_achieved && (
                <Text variant="body" className="text-green-700 mb-1 font-semibold">
                    Почти у цели! 🎉 (100%+)
                </Text>
            )}

            {/* Контейнер для Полосы Прогресса и Процентов */}
            {/* items-center: выравниваем полосу и текст процента по центру по вертикали */}
            <div className="w-full flex items-center">
                {/* Контейнер Полосы Прогресса */}
                {/* flex-grow: занимает все доступное пространство по ширине */}
                {/* h-4: высота полосы, bg-gray-300: цвет фона незаполненной части, rounded: скругление углов */}
                {/* overflow-hidden: обрезаем содержимое по скругленным углам */}
                {/* mr-2: правый отступ от полосы до текста с процентами */}
                <div className="flex-grow flex h-4 bg-gray-300 rounded overflow-hidden mr-2">
                    {/* Отрисовываем сегменты полосы */}
                    {segments.map((_, index) => (
                        <div
                            key={index} // Ключ для React списка
                            // h-full: высота 100% родителя, flex-grow: занимает равное пространство,
                            // border-r border-white: рисует правую границу белого цвета между сегментами
                            // last:border-r-0: убирает границу у последнего сегмента
                            // Получаем класс цвета динамически
                            className={`h-full flex-grow border-r border-white last:border-r-0 ${getSegmentColorClass(index, percentage)}`}
                            // flexBasis: задаем базовую ширину каждого сегмента как равную долю от 100%
                            style={{ flexBasis: `${100 / numSegments}%` }}
                        ></div>
                    ))}
                </div>

                {/* Текст с Процентом Достижения */}
                <Text variant="body" className="text-secondary-800 font-semibold">{formattedPercentage}%</Text>
            </div>
        </div>
    );
}