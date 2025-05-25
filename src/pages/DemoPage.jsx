import React, {useState, useEffect} from 'react';
// eslint-disable-next-line
import {motion, AnimatePresence} from 'framer-motion';
import Text from '../components/ui/Text';
import creditsDesktop from '../assets/images/credits-desktop.png';
import spendingsDesktop from '../assets/images/spendings-desktop.png';
import mainPageChartDesktop from '../assets/images/mainPageChart-desktop.png';
import goalsDesktop from '../assets/images/goals-desktop.png';
import recomendationsDesktop from '../assets/images/recomendations-desktop.png';
import balanceDesktop from '../assets/images/balanc-desktop.png';
import mobileDesktop from '../assets/images/mobile-vew-desktop.png';
import {Link} from "react-router-dom";

// Данные для блоков
const sections = [
    {
        title: 'Визуализация финансов',
        description: 'Наглядные графики покажут динамику ваших доходов и расходов за разные периоды. ' +
            'Отслеживайте тренды, выявляйте пики трат и принимайте осознанные финансовые решения.',
        image: mainPageChartDesktop,
        alt: 'Скриншот графика (Десктоп)',
        bgColor: 'bg-pink-100',
        textColor: '!text-pink-800',
    },
    {
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
        title: 'Управляйте финансовыми целями',
        description: 'Ставьте перед собой конкретные цели (например, накопить на отпуск или покупку)' +
            ' и отслеживайте прогресс с удобным виджетом на главном экране.',
        image: goalsDesktop,
        alt: 'Скриншот страницы Цели (Десктоп)',
        bgColor: 'bg-green-100',
        textColor: '!text-green-800',
    },
    {
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
        title: 'Персональные рекомендации',
        description: 'Получайте автоматические рекомендации на основе анализа ваших операций. ' +
            'Узнайте, как оптимизировать расходы и быстрее достичь целей.',
        image: recomendationsDesktop,
        alt: 'Скриншот рекомендаций (Десктоп)',
        bgColor: 'bg-purple-100',
        textColor: '!text-purple-800',
    },
    {
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

// Варианты анимации для блоков
const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
        transition: {duration: 0.6, ease: 'easeOut'},
    },
    exit: (direction) => ({
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
        transition: {duration: 0.6, ease: 'easeOut'},
    }),
};

const DemoPage = () => {
    const [[currentIndex, direction], setCurrentIndex] = useState([0, 0]);

    // Обработчики для переключения блоков
    const nextSlide = () => {
        setCurrentIndex([currentIndex + 1, 1]);
    };

    const prevSlide = () => {
        setCurrentIndex([currentIndex - 1, -1]);
    };

    // Цикличность
    const wrappedIndex = (currentIndex + sections.length) % sections.length;

    // Обработчик клавиш
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft' && currentIndex !== 0) prevSlide();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex]);

    return (
        <div className="max-w-7xl mx-auto px-2  overflow-x-hidden">
            {/* Заголовок страницы и описание */}
            <motion.div
                className="text-center py-4 relative"
                initial={{opacity: 0, y: 50}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.8, ease: 'easeOut'}}
            >
                <span className="text-2xl md:text-3xl text-blue-800">
                    Ваш личный финансовый наставник
                </span>
                <div className="mt-4">
                    <span className="text-gray-600 max-w-2xl mx-auto text-sm md:text-[clamp(0.875rem,3vw,1rem)]">
                        Financial Coach - ваш надёжный помощник в управлении личными финансами. Отслеживайте доходы и
                        расходы, ставьте цели и получайте персональные рекомендации, чтобы достичь финансовой
                        стабильности.{' '}
                        <Link
                            to="/login"
                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors border-b border-blue-300 hover:border-blue-600"
                        >
                            Войдите
                        </Link>{' '}
                        или{' '}
                        <Link
                            to="/signup"
                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors border-b border-blue-300 hover:border-blue-600"
                        >
                            зарегистрируйтесь
                        </Link>{' '}
                        прямо сейчас, чтобы начать путь к финансовой свободе.
                    </span>
                </div>
            </motion.div>


            {/* Слайдер */}
            <div className="relative flex flex-col items-center pt-5 ml-[6vw] mr-[6vw] min-h-[70vh]">
                <AnimatePresence custom={direction}>
                    <motion.div
                        key={wrappedIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute flex flex-col items-center justify-center gap-2"
                    >
                        <motion.div
                            className="relative ml-5 mr-5 border-2 border-gradient-to-r max-w-0.8 from-blue-200 to-blue-400 rounded-lg shadow-xl"
                            initial={{opacity: 0, scale: 0.9}}
                            animate={{opacity: 1, scale: 1}}
                            transition={{duration: 0.6, ease: 'easeOut'}}
                        >
                            <img
                                src={sections[wrappedIndex].image}
                                alt={sections[wrappedIndex].alt}
                                className="rounded-lg max-w-full max-h-[60vh] mx-auto"
                            />
                            <div
                                className={`hidden absolute bottom-4 shadow-2xl right-0 transform translate-x-1/4 md:flex mr-4 flex-col ${sections[wrappedIndex].bgColor} 
                            rounded-lg p-4 w-1/2`}>
                                <Text
                                    className={`text-[clamp(1rem,1.3vw,1.3vw)] text-center font-semibold mb-2 ${sections[wrappedIndex].textColor}`}>
                                    {sections[wrappedIndex].title}
                                </Text>
                                <Text variant="body" className="text-[clamp(0.7rem,1.1vw,1rem)] text-gray-800">
                                    {sections[wrappedIndex].description}
                                </Text>
                            </div>
                            <div
                                className={`md:hidden mt-4 shadow-2xl flex mr-4 flex-col w-full ${sections[wrappedIndex].bgColor} 
                            rounded-lg p-4 w-1/2`}>
                                <Text
                                    className={`text-[clamp(1rem,1.3vw,1.3vw)] text-center font-semibold mb-2 ${sections[wrappedIndex].textColor}`}>
                                    {sections[wrappedIndex].title}
                                </Text>
                                <Text variant="body" className="text-[clamp(0.7rem,1.1vw,1rem)] text-gray-800">
                                    {sections[wrappedIndex].description}
                                </Text>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>

                {/* Стрелки */}
                <motion.div
                    className="fixed right-4 cursor-pointer"
                    onClick={nextSlide}
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 0.5}}
                >
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1E40AF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </motion.div>

                {currentIndex !== 0 && (
                    <motion.div
                        className="fixed left-4 cursor-pointer"
                        onClick={prevSlide}
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{delay: 0.5}}
                    >
                        <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#1E40AF"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default DemoPage;