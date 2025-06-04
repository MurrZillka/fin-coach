import creditsDesktop from '../../../assets/images/credits-desktop.png';
import spendingsDesktop from '../../../assets/images/spendings-desktop.png';
import mainPageChartDesktop from '../../../assets/images/mainPageChart-desktop.png';
import goalsDesktop from '../../../assets/images/goals-desktop.png';
import recomendationsDesktop from '../../../assets/images/recomendations-desktop.png';
import balanceDesktop from '../../../assets/images/balanc-desktop.png';
import mobileDesktop from '../../../assets/images/mobile-vew-desktop.png';

export const demoSections = [
    {
        id: 'visualization',
        title: 'Визуализация финансов',
        description: 'Наглядные графики покажут динамику ваших доходов и расходов за разные периоды. ' +
            'Отслеживайте тренды, выявляйте пики трат и принимайте осознанные финансовые решения.',
        image: mainPageChartDesktop,
        alt: 'Скриншот графика (Десктоп)',
        bgColor: 'bg-pink-100',
        textColor: '!text-pink-800',
    },
    {
        id: 'credits',
        title: 'Подробный учет доходов',
        description: 'Учитывайте все свои доходы, как случайные, так и периодические. ' +
            'Классифицируйте расходы, чтобы видеть структуру ваших трат. ' +
            'Наш интуитивно понятный интерфейс позволяет быстро вносить данные.',
        image: creditsDesktop,
        alt: 'Скриншот страницы Доходы (Десктоп)',
        bgColor: 'bg-blue-100',
        textColor: '!text-blue-800',
    },
    {
        id: 'spendings',
        title: 'Детальный учет расходов',
        description: 'Легко добавляйте все ваши запланированные и непредвиденные траты. ' +
            'Они могут быть как разовыми, так и периодическими. ' +
            'Классифицируйте расходы, чтобы увидеть их структуру ' +
            'и избавиться от необдуманных и импульсивных трат.',
        image: spendingsDesktop,
        alt: 'Скриншот страницы Расходы (Десктоп)',
        bgColor: 'bg-red-100',
        textColor: '!text-red-800',
    },
    {
        id: 'goals',
        title: 'Управляйте финансовыми целями',
        description: 'Ставьте перед собой конкретные цели (например, накопить на отпуск или покупку)' +
            ' и отслеживайте прогресс с удобным виджетом на главном экране.',
        image: goalsDesktop,
        alt: 'Скриншот страницы Цели (Десктоп)',
        bgColor: 'bg-green-100',
        textColor: '!text-green-800',
    },
    {
        id: 'balance',
        title: 'Следите за балансом и целью!',
        description: 'Удобный и информативный виджет баланса находится на каждой странице нашего приложения. ' +
            'Он позволит вам эффективнее контролировать расходы. ' +
            'Виджет интегрирован с индикатором прогресса в достижении цели, чтобы помочь вам избежать необдуманных, эмоциональных покупок.',
        image: balanceDesktop,
        alt: 'Скриншот страницы Баланса (Десктоп)',
        bgColor: 'bg-yellow-100',
        textColor: '!text-yellow-800',
    },
    {
        id: 'recommendations',
        title: 'Персональные рекомендации',
        description: 'Получайте автоматические рекомендации на основе анализа ваших операций. ' +
            'Узнайте, как оптимизировать расходы и быстрее достичь целей.',
        image: recomendationsDesktop,
        alt: 'Скриншот рекомендаций (Десктоп)',
        bgColor: 'bg-purple-100',
        textColor: '!text-purple-800',
    },
    {
        id: 'mobile',
        title: 'Версия для телефонов и планшетов',
        description: 'Пользуйтесь нашим приложением на любых типах мобильных устройств. ' +
            'Такой подход позволит вам контролировать финансы в режиме реального времени ' +
            'и не скатиться к бесконтрольным тратам, а также повысить осознанность ваших действий.',
        image: mobileDesktop,
        alt: 'Скриншот экранов мобильных версий',
        bgColor: 'bg-sky-100',
        textColor: '!text-sky-800',
    },
];
