import React, {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import Text from '../components/ui/Text';
import creditsDesktop from '../assets/images/credits-desktop.png';
import mainPageChartDesktop from '../assets/images/mainPageChart-desktop.png';
import goalsDesktop from '../assets/images/goals-desktop.png';
import recomendationsDesktop from '../assets/images/recomendations-desktop.png';
import mainPageChartMobile from '../assets/images/mainPageChart-mobile.png';
import creditsMobile from '../assets/images/credits-mobile.png';
import goalsMobile from '../assets/images/goals-mobile.png';
import {Link} from "react-router-dom";

// Данные для блоков
const sections = [
    {
        title: 'Визуализация финансов',
        description: 'Наглядные графики покажут динамику ваших доходов и расходов за разные периоды. Отслеживайте тренды, выявляйте пики трат и принимайте осознанные финансовые решения.',
        image: mainPageChartDesktop,
        alt: 'Скриншот графика (Десктоп)',
        bgColor: 'bg-pink-100',
        textColor: '!text-pink-800',
    },
    {
        title: 'Учет доходов и расходов',
        description: 'Легко добавляйте все ваши поступления и траты. Классифицируйте расходы, чтобы видеть структуру ваших трат. Наш интуитивно понятный интерфейс позволяет быстро вносить данные.',
        image: creditsDesktop,
        alt: 'Скриншот страницы Доходы/Расходы (Десктоп)',
        bgColor: 'bg-blue-100',
        textColor: '!text-blue-800',
    },
    {
        title: 'Управление финансовыми целями',
        description: 'Ставьте перед собой конкретные цели (например, накопить на отпуск или покупку) и отслеживайте прогресс с удобным виджетом на главном экране.',
        image: goalsDesktop,
        alt: 'Скриншот страницы Цели (Десктоп)',
        bgColor: 'bg-green-100',
        textColor: '!text-green-800',
    },
    {
        title: 'Персональные рекомендации',
        description: 'Получайте автоматические рекомендации на основе анализа ваших операций. Узнайте, как оптимизировать расходы и быстрее достичь целей.',
        image: recomendationsDesktop,
        alt: 'Скриншот рекомендаций (Десктоп)',
        bgColor: 'bg-purple-100',
        textColor: '!text-purple-800',
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
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
            {/* Заголовок страницы и описание */}
            <motion.div
                className="text-center py-4 relative"
                initial={{opacity: 0, y: 50}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.8, ease: 'easeOut'}}
            >
                <Text className="text-2xl md:text-3xl font-bold text-blue-800">
                    Ваш личный финансовый наставник
                </Text>
                <div className="mt-4">
                    <Text variant="body" className="text-gray-600 max-w-2xl mx-auto text-[clamp(0.875rem,3vw,1rem)]">
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
                    </Text>
                </div>
            </motion.div>


            {/* Слайдер */}
            <div className="relative flex flex-col items-center pt-5 ml-[6vw] mr-[6vw] min-h-[70vh]">
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
                                className={`absolute bottom-4 shadow-2xl right-0 transform translate-x-1/4 flex flex-col ${sections[wrappedIndex].bgColor} 
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
                    className="fixed right-4 top-1/3 transform -translate-y-1/2 cursor-pointer"
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
                        className="fixed left-4 top-1/3 transform -translate-y-1/2 cursor-pointer"
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