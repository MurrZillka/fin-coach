import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { demoSections } from "../data/demoSections.js";
import { useSlider } from "../hooks/useSlider.js";
import DemoSlide from "../components/DemoSlide.jsx";
import DemoNavigation from "../components/DemoNavigation.jsx";
import DemoHeader from "../components/DemoHeader.jsx";

const DemoPage = () => {
    const { direction, wrappedIndex, next, prev, canGoPrev } = useSlider(demoSections.length);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft' && canGoPrev) prev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [next, prev, canGoPrev]);

    return (
        <div className="max-w-7xl mx-auto px-2 overflow-x-hidden">
            <DemoHeader />

            <div className="relative flex flex-col items-center pt-5 ml-[6vw] mr-[6vw] min-h-[70vh]">
                <AnimatePresence custom={direction}>
                    <DemoSlide
                        key={wrappedIndex}
                        section={demoSections[wrappedIndex]}
                        direction={direction}
                    />
                </AnimatePresence>

                <DemoNavigation onNext={next} onPrev={prev} canGoPrev={canGoPrev} />
            </div>
        </div>
    );
};

export default DemoPage;