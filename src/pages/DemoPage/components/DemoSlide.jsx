import React from 'react';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import Text from '../../../components/ui/Text';

const DemoSlide = ({ section, direction }) => {
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

    return (
        <motion.div
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
                    src={section.image}
                    alt={section.alt}
                    className="rounded-lg max-w-full max-h-[60vh] mx-auto"
                />
                <div
                    className={`hidden absolute bottom-4 shadow-2xl right-0 transform translate-x-1/4 md:flex mr-4 flex-col ${section.bgColor} 
                    rounded-lg p-4 w-1/2`}>
                    <Text
                        className={`text-[clamp(1rem,1.3vw,1.3vw)] text-center font-semibold mb-2 ${section.textColor}`}>
                        {section.title}
                    </Text>
                    <Text variant="body" className="text-[clamp(0.7rem,1.1vw,1rem)] text-gray-800">
                        {section.description}
                    </Text>
                </div>
                <div
                    className={`md:hidden mt-4 shadow-2xl flex mr-4 flex-col w-full ${section.bgColor} 
                    rounded-lg p-4 w-1/2`}>
                    <Text
                        className={`text-[clamp(1rem,1.3vw,1.3vw)] text-center font-semibold mb-2 ${section.textColor}`}>
                        {section.title}
                    </Text>
                    <Text variant="body" className="text-[clamp(0.7rem,1.1vw,1rem)] text-gray-800">
                        {section.description}
                    </Text>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DemoSlide;
