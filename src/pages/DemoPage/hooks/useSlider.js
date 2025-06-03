import { useState, useCallback } from 'react';

export const useSlider = (itemsCount) => {
    const [[currentIndex, direction], setCurrentIndex] = useState([0, 0]);

    const next = useCallback(() => {
        setCurrentIndex([currentIndex + 1, 1]);
    }, [currentIndex]);

    const prev = useCallback(() => {
        setCurrentIndex([currentIndex - 1, -1]);
    }, [currentIndex]);

    const wrappedIndex = (currentIndex + itemsCount) % itemsCount;
    const canGoPrev = currentIndex !== 0;

    return {
        currentIndex,
        direction,
        wrappedIndex,
        next,
        prev,
        canGoPrev
    };
};
