// 03_pages/MainPage/hooks/useMainPageModals.ts
import { useState } from 'react';

export const useMainPageModals = () => {
    const [isRecommendationsModalOpen, setIsRecommendationsModalOpen] = useState(false);
    const [isCategoryChartModalOpen, setIsCategoryChartModalOpen] = useState(false);

    const handleOpenRecommendationsModal = () => {
        console.log('MainPage: Opening recommendations modal.');
        setIsRecommendationsModalOpen(true);
    };

    const handleCloseRecommendationsModal = () => {
        console.log('MainPage: Closing recommendations modal.');
        setIsRecommendationsModalOpen(false);
    };

    const handleOpenCategoryChartModal = () => {
        console.log('MainPage: Opening category chart modal.');
        setIsCategoryChartModalOpen(true);
    };

    const handleCloseCategoryChartModal = () => {
        console.log('MainPage: Closing category chart modal.');
        setIsCategoryChartModalOpen(false);
    };

    return {
        // Состояния модалок
        isRecommendationsModalOpen,
        isCategoryChartModalOpen,

        // Обработчики
        handleOpenRecommendationsModal,
        handleCloseRecommendationsModal,
        handleOpenCategoryChartModal,
        handleCloseCategoryChartModal,
    };
};
