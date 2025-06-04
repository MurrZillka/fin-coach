import React from 'react';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";

const DemoHeader = () => {
    return (
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
    );
};

export default DemoHeader;
