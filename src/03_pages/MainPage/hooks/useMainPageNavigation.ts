// 03_pages/MainPage/hooks/useMainPageNavigation.ts
import { useNavigate } from "react-router-dom";

export const useMainPageNavigation = () => {
    const navigate = useNavigate();

    const handleViewIncomeClick = () => {
        navigate('/credits');
    };

    const handleViewExpensesClick = () => {
        navigate('/spendings');
    };

    const handleViewGoalsClick = () => {
        navigate('/goals');
    };

    return {
        handleViewIncomeClick,
        handleViewExpensesClick,
        handleViewGoalsClick,
    };
};
