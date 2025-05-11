// src/components/GoalProgressWidget.jsx
import React from 'react';
import useGoalsStore from '../stores/goalsStore'; // Импортируем стор Целей
import useBalanceStore from '../stores/balanceStore'; // Импортируем стор Баланса
import Text from './ui/Text'; // Импортируем компонент Text


// --- Вспомогательная функция для правильного склонения слова "день" на русском ---
// Принимает число дней и возвращает "день", "дня" или "дней"
const getDaysNoun = (num) => {
    // Берем абсолютное значение числа, так как склонение зависит от последней цифры
    const absNum = Math.abs(num);
    // Специальные случаи для чисел от 11 до 19 (всегда "дней")
    if (absNum % 100 >= 11 && absNum % 100 <= 19) {
        return 'дней';
    }
    // Общий случай
    const lastDigit = absNum % 10;
    if (lastDigit === 1) {
        return 'день';
    } else if (lastDigit >= 2 && lastDigit <= 4) {
        return 'дня';
    } else {
        return 'дней';
    }
};
// --- Конец вспомогательной функции ---


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

    // --- Расчет Оставшихся Дней и формирование текста даты ---
    let remainingDays = null; // Количество дней до даты (может быть 0 или < 0)
    let daysText = ''; // Текст для отображения дней ("N дней", "сегодня", "просрочено")

    // Проверяем, что текущая цель есть и у нее установлена желаемая дата
    if (currentGoal && currentGoal.wish_date && currentGoal.wish_date !== "0001-01-01T00:00:00Z") {
        try {
            // Преобразуем строку даты в объект Date
            const wishDate = new Date(currentGoal.wish_date);
            const currentDate = new Date();
            // Для корректного расчета разницы в днях, обнуляем время у обеих дат
            wishDate.setHours(0, 0, 0, 0);
            currentDate.setHours(0, 0, 0, 0);

            // Рассчитываем разницу в миллисекундах
            const timeDifference = wishDate.getTime() - currentDate.getTime();
            // Преобразуем миллисекунды в дни и округляем в большую сторону, чтобы учитывать текущий день
            const dayDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

            remainingDays = dayDifference; // Сохраняем количество дней

            // Определяем текст для отображения дней в зависимости от их количества
            if (remainingDays > 0) {
                // Если дней больше 0, используем вспомогательную функцию для склонения слова "день"
                daysText = `${remainingDays} ${getDaysNoun(remainingDays)}`;
            } else if (remainingDays === 0) {
                // Если 0 дней, значит, желаемая дата - сегодня
                daysText = 'сегодня';
            } else { // remainingDays < 0
                // Если дней меньше 0, значит, дата просрочена
                daysText = `просрочено на ${Math.abs(remainingDays)} ${getDaysNoun(Math.abs(remainingDays))}`;
            }
        } catch (e) {
            // Обработка ошибок парсинга даты, если формат некорректен
            console.error("Error calculating remaining days:", e);
            daysText = 'Некорректная дата'; // Отображаем сообщение об ошибке
        }
    } else {
        // Если желаемая дата не установлена
        daysText = 'Дата не указана';
    }
    // --- Конец Расчета Оставшихся Дней ---


    // --- Логика Определения Цвета Сегментов ---
    const numSegments = 40; // Увеличено количество прямоугольников в полоске прогресса в два раза
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
            // ИЗМЕНЕНО: ширина w-1/3 на w-2/3
            <div className="flex-shrink-0 w-2/3 text-right"> {/* ИЗМЕНЕНО w-1/3 на w-2/3 */}
                <Text variant="body" className="text-secondary-600 italic">
                    Загрузка цели и баланса...
                </Text>
            </div>
        );
    }

    // Если нет текущей цели
    if (!currentGoal) {
        return (
            // Контейнер для сообщения об отсутствии цели
            // ИЗМЕНЕНО: ширина w-1/3 на w-2/3
            <div className="flex-shrink-0 w-2/3 text-right"> {/* ИЗМЕНЕНО w-1/3 на w-2/3 */}
                <Text variant="body" className="text-blue-700 font-semibold italic">
                    Вы еще не установили для себя ни одной финансовой цели. Усильте мотивацию, выберите цель!
                </Text>
            </div>
        );
    }

    // Если текущая цель достигнута
    if (currentGoal.is_achieved || percentage >= 100) {
        //let achievedText = 'Установленная Вами цель достигнута! Поздравляем! 🎉';
        // Добавляем дату достижения, если она есть и корректна
        let achievedText = '';
        if (currentGoal.achievement_date && currentGoal.achievement_date !== "0001-01-01T00:00:00Z") {
            try {
                const achievedDate = new Date(currentGoal.achievement_date);
                achievedText = `Установленная Вами цель достигнута ${achievedDate.toLocaleDateString()}! Поздравляем! 🎉`;
                // achievedText += ` (${achievedDate.toLocaleDateString()})`;
            } catch (e) {
                console.error("Error formatting achievement date:", e);
                // В случае ошибки форматирования даты, просто показываем текст без даты
            }
        }
        return (
            // Контейнер для сообщения о достижении цели
            // ИЗМЕНЕНО: ширина w-1/3 на w-2/3
            <div className="flex-shrink-0 w-2/3 text-right"> {/* ИЗМЕНЕНО w-1/3 на w-2/3 */}
                <Text variant="body" className="text-green-700 font-semibold italic">
                    {achievedText}
                </Text>
            </div>
        );
    }


    // --- Рендеринг Виджета Прогресса, если есть текущая, недостигнутая цель и сумма цели > 0 ---
    // Проверяем, что сумма цели положительная, чтобы показать прогресс
    if (typeof currentGoal.amount !== 'number' || currentGoal.amount <= 0) {
        return (
            // ИЗМЕНЕНО: ширина w-1/3 на w-2/3
            <div className="flex-shrink-0 w-2/3 text-right"> {/* ИЗМЕНЕНО w-1/3 на w-2/3 */}
                <Text variant="body" className="text-red-500 italic">
                    Сумма цели должна быть &gt; 0.
                </Text>
            </div>
        );
    }

    // Если есть текущая, недостигнутая цель с положительной суммой цели - показываем прогресс

    const formattedRemainingAmount = typeof remainingAmount === 'number'
        ? remainingAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '--.--';

    // Формируем полную строку текста для верхней строки, ВКЛЮЧАЯ значок рубля
    let infoText = ''; // Используем одну переменную для текста
    const daysPart = (daysText && daysText !== 'Дата не указана' && daysText !== 'Некорректная дата') ? `${daysText}, ` : '';
    infoText = `Ваш прогресс: до достижения текущей цели осталось ${daysPart}${formattedRemainingAmount} ₽`; // Значок рубля ВКЛЮЧЕН здесь

    // Если дата не указана ИЛИ некорректна, добавляем это в конец строки в скобках
    if (daysText === 'Дата не указана' || daysText === 'Некорректная дата') {
        infoText += ` (${daysText})`;
    }

    const formattedPercentage = percentage.toFixed(0);
    return (
        // Главный контейнер виджета прогресса
        // w-2/3: УВЕЛИЧЕНА ширина до 2/3 родителя (футера)
        // flex-shrink-0: предотвращает сжатие
        // flex flex-col: элементы внутри выстраиваются в колонку
        // text-right: текст внутри выравнивается по правому краю (это влияет на Text элементы напрямую)
        // items-start: выравнивает ДОЧЕРНИЕ ЭЛЕМЕНТЫ КОЛОНКИ (div с текстом и div с баром) по левому краю
        <div className="flex-shrink-0 w-2/3 text-right flex flex-col items-start"> {/* ИЗМЕНЕНО: w-1/3 на w-2/3, items-end на items-start */}

            {/* Верхняя строка текста (со значком рубля) */}
            {/* Обернута в div w-full flex justify-end, чтобы она сама выравнивалась по правому краю внутри своих 2/3 ширины */}
            <div className="w-full flex justify-end">
                <Text variant="body" className="text-secondary-800 mb-1"> {/* mb-1: небольшой нижний отступ */}
                    {infoText} {/* Используем строку, которая теперь включает рубль */}
                </Text>
            </div>


            {/* Контейнер для Полосы Прогресса и Процентов */}
            {/* w-full: занимает всю доступную ширину в родительском flex-col (теперь w-2/3) */}
            {/* flex items-center: располагает элементы в строку и выравнивает по центру по вертикали */}
            {/* Этот контейнер теперь начинается от левого края родителя (из-за items-start выше) */}
            <div className="w-full flex items-center">
                {/* Контейнер Полосы Прогресса */}
                {/* flex-grow: теперь этот элемент занимает все оставшееся место в строке после блока процентов */}
                {/* h-4: высота полосы, bg-gray-300: цвет фона, rounded: скругление углов, overflow-hidden */}
                {/* mr-1: небольшой правый отступ перед блоком процентов */}
                {/* УДАЛЕНО: явная ширина w-[90%] и flex-shrink-0. Возвращаем flex-grow. */}
                <div className="flex-grow flex h-4 bg-gray-300 rounded overflow-hidden mr-1"> {/* Возвращен flex-grow, добавлен mr-1 */}
                    {/* Отрисовываем сегменты полосы */}
                    {segments.map((_, index) => (
                        <div
                            key={index} // Ключ для React списка
                            className={`h-full flex-grow border-r border-white last:border-r-0 ${getSegmentColorClass(index, percentage)}`}
                            style={{ flexBasis: `${100 / numSegments}%` }} // Задаем базовую ширину сегмента
                        ></div>
                    ))}
                </div>

                {/* Контейнер для Процентов */}
                {/* flex-shrink-0: предотвращает сжатие этого контейнера */}
                {/* ml-0: убираем левый отступ, т.к. есть mr-1 у бара */}
                {/* text-right: выравнивание текста внутри своего контейнера */}
                {/* minWidth: чтобы процент всегда помещался */}
                {/* УДАЛЕНО: flex-grow */}
                <div className="flex-shrink-0 ml-0 text-right" style={{ minWidth: '40px' }}> {/* Возвращен flex-shrink-0 и minWidth, удален flex-grow */}
                    {/* Текст с Процентом Достижения */}
                    <Text variant="body" className="text-secondary-800 font-semibold">{formattedPercentage}%</Text>
                </div>
                {/* Значок рубля находится в верхней строке */}
            </div>
        </div>
    );
}