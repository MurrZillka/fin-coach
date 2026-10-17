import React, { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { demoSections } from "../data/demoSections.js";
import { useSlider } from "../hooks/useSlider.js";
import DemoSlide from "../components/DemoSlide.jsx";
import DemoNavigation from "../components/DemoNavigation.jsx";
import DemoHeader from "../components/DemoHeader.jsx";

const DemoPage = () => {
  const { direction, wrappedIndex, next, prev, canGoPrev } = useSlider(
    demoSections.length,
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft" && canGoPrev) prev();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev, canGoPrev]);

  const handleBackgroundClick = (event) => {
    // Картинку и карточку описания не используем для переключения.
    if (event.target.closest("[data-demo-slide]")) return;

    const { left, width } = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - left;

    if (clickX < width / 2) {
      if (canGoPrev) prev();
    } else {
      next();
    }
  };

  const handleNextClick = (event) => {
    event.stopPropagation();
    next();
  };

  const handlePrevClick = (event) => {
    event.stopPropagation();
    prev();
  };

  return (
    <div className="overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-2">
        <DemoHeader />
      </div>

      <div onClick={handleBackgroundClick}>
        <div className="max-w-7xl mx-auto px-2">
          <div className="relative flex flex-col items-center pt-5 ml-[6vw] mr-[6vw] min-h-[70vh]">
            <AnimatePresence custom={direction}>
              <DemoSlide
                key={wrappedIndex}
                section={demoSections[wrappedIndex]}
                direction={direction}
              />
            </AnimatePresence>

            <DemoNavigation
              onNext={handleNextClick}
              onPrev={handlePrevClick}
              canGoPrev={canGoPrev}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
