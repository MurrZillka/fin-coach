import React from 'react';
// eslint-disable-next-line
import { motion } from 'framer-motion';

const DemoNavigation = ({ onNext, onPrev, canGoPrev }) => {
    return (
        <>
            {/* Стрелка вправо */}
            <motion.div
                className="fixed right-4 cursor-pointer"
                onClick={onNext}
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

            {/* Стрелка влево */}
            {canGoPrev && (
                <motion.div
                    className="fixed left-4 cursor-pointer"
                    onClick={onPrev}
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
        </>
    );
};

export default DemoNavigation;
