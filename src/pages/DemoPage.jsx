import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Text from '../components/ui/Text';
import creditsDesktop from '../assets/images/credits-desktop.png';
import mainPageChartDesktop from '../assets/images/mainPageChart-desktop.png';
import goalsDesktop from '../assets/images/goals-desktop.png';
import recomendationsDesktop from '../assets/images/recomendations-desktop.png';
import mainPageChartMobile from '../assets/images/mainPageChart-mobile.png';
import creditsMobile from '../assets/images/credits-mobile.png';
import goalsMobile from '../assets/images/goals-mobile.png';

// Данные для блоков
const sections = [
    {
        title: 'Учет Доходов и Расходов',
        description: 'Легко добавляйте все ваши поступления и траты. Классифицируйте расходы, чтобы видеть структуру ваших трат. Наш интуитивно понятный интерфейс позволяет быстро вносить данные.',
        image: creditsDesktop,
        alt: 'Скриншот страницы Доходы/Расходы (Десктоп)',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
    },
    {
        title: 'Визуализация Финансов',
        description: 'Наглядные графики покажут динамику ваших доходов и расходов за разные периоды. Отслеживайте тренды, выявляйте пики трат и принимайте осознанные финансовые решения.',
        image: mainPageChartDesktop,
        alt: 'Скриншот графика (Десктоп)',
        bgColor: 'bg-pink-100',
        textColor: 'text-pink-800',
    },
    {
        title: 'Управление Финансовыми Целями',
        description: 'Ставьте перед собой конкретные цели (например, накопить на отпуск или покупку) и отслеживайте прогресс с удобным виджетом на главном экране.',
        image: goalsDesktop,
        alt: 'Скриншот страницы Цели (Десктоп)',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
    },
    {
        title: 'Персональные Рекомендации',
        description: 'Получайте автоматические рекомендации на основе анализа ваших операций. Узнайте, как оптимизировать расходы и быстрее достичь целей.',
        image: recomendationsDesktop,
        alt: 'Скриншот рекомендаций (Десктоп)',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
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
        transition: { duration: 0.6, ease: 'easeOut' },
    },
    exit: (direction) => ({
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
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
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8">
            {/* Заголовок страницы и описание */}
            <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <Text className="text-2xl md:text-3xl font-bold text-blue-800">
                    Ваш Личный Финансовый Коуч
                </Text>
                <div className="mt-4">
                    <Text variant="body" className="text-gray-600 max-w-2xl mx-auto text-[clamp(0.875rem,3vw,1rem)]">
                        Financial Coach — ваш надёжный помощник в управлении финансами. Отслеживайте доходы и расходы, ставьте цели и получайте персональные рекомендации, чтобы достичь финансовой стабильности. Удобный интерфейс и адаптивный дизайн всегда под рукой.
                    </Text>
                </div>
            </motion.div>

            {/* Слайдер */}
            <div className="relative flex flex-col items-center justify-center min-h-[70vh]">
                <AnimatePresence initial={false} custom={direction}>
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
                            className="relative w-full max-w-[50vw] border-2 border-gradient-to-r from-blue-200 to-blue-400 rounded-lg shadow-xl"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        >
                            <img
                                src={sections[wrappedIndex].image}
                                alt={sections[wrappedIndex].alt}
                                className="rounded-lg max-w-full h-auto mx-auto"
                            />
                            <div className={`absolute bottom-4 right-0 transform translate-x-1/4 w-1/2 max-w-sm ${sections[wrappedIndex].bgColor} opacity-90 rounded-lg p-4 text-center`}>
                                <Text className={`text-[clamp(1.25rem,4vw,1.5rem)] font-semibold mb-2 ${sections[wrappedIndex].textColor}`}>
                                    {sections[wrappedIndex].title}
                                </Text>
                                <Text variant="body" className="text-[clamp(0.875rem,3vw,1rem)] text-gray-800">
                                    {sections[wrappedIndex].description}
                                </Text>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>

                {/* Стрелки */}
                <motion.div
                    className="fixed right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    onClick={nextSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
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
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </motion.div>

                {currentIndex !== 0 && (
                    <motion.div
                        className="fixed left-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                        onClick={prevSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
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
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default DemoPage;