// 03_pages/GoalsPage/utils/goalsPageHandlers.ts
import { dataCoordinator } from '../../../dataCoordinator';
import { goalFields } from '../config/modalFields';
import type { Goal, GoalRequest } from '../../../01_api/goals/types';

// Типы для параметров хендлеров
export interface GoalsPageHandlersParams {
    currentGoal: Goal | null;
    clearError: () => void;
    openModal: (modalType: string, config: ModalConfig) => void;
    closeModal: () => void;
}

// Типы для конфигурации модальных окон
export interface ModalConfig {
    title: string;
    fields?: any[];
    initialData?: any;
    onSubmit?: (formData: any) => Promise<void>;
    submitText?: string;
    message?: string;
    onConfirm?: () => Promise<void>;
    confirmText?: string;
}

// Типы для возвращаемых хендлеров
export interface GoalsPageHandlers {
    handleAddClick: () => void;
    handleEditClick: (goal: Goal) => void;
    handleDeleteClick: (goal: Goal) => void;
    handleSetCurrentClick: (goal: Goal) => void;
}

export const goalsPageHandlers = ({
    currentGoal,
    clearError,
    openModal,
    closeModal
}: GoalsPageHandlersParams): GoalsPageHandlers => {
    // API хендлеры
    const handleAddSubmit = async (formData: GoalRequest): Promise<void> => {
        try {
            await dataCoordinator.addGoal(formData);
            closeModal();
        } catch (err: any) {
            console.error('Error during add goal:', err);
            closeModal();
        }
    };

    const handleEditSubmit = async (id: number, formData: GoalRequest): Promise<void> => {
        try {
            await dataCoordinator.updateGoal(id, formData);
            closeModal();
        } catch (err: any) {
            console.error('Error during edit goal:', err);
            closeModal();
        }
    };

    const handleDeleteConfirm = async (id: number): Promise<void> => {
        try {
            await dataCoordinator.deleteGoal(id);
            closeModal();
        } catch (err: any) {
            console.error('Error during delete goal:', err);
            closeModal();
        }
    };

    const handleSetCurrentConfirm = async (id: number): Promise<void> => {
        try {
            await dataCoordinator.setCurrentGoalById(id);
            closeModal();
        } catch (err: any) {
            console.error('Error during setting goal as current:', err);
            closeModal();
        }
    };

    // UI хендлеры
    const handleAddClick = (): void => {
        clearError();
        openModal('addGoal', {
            title: 'Добавить цель',
            fields: goalFields,
            initialData: {},
            onSubmit: handleAddSubmit,
            submitText: 'Добавить',
        });
    };

    const handleEditClick = (goal: Goal): void => {
        clearError();
        openModal('editGoal', {
            title: 'Редактировать цель',
            fields: goalFields,
            initialData: {
                ...goal,
                wish_date: goal.wish_date && goal.wish_date !== "0001-01-01T00:00:00Z"
                    ? new Date(goal.wish_date).toISOString().split('T')[0]
                    : '',
            },
            onSubmit: (formData: GoalRequest) => handleEditSubmit(goal.id, formData),
            submitText: 'Сохранить изменения',
        });
    };

    const handleDeleteClick = (goal: Goal): void => {
        clearError();
        const goalDescription = goal.description || `с ID ${goal.id}`;
        const formattedAmount = typeof goal.amount === 'number'
            ? goal.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : goal.amount;
        const message = `Вы уверены, что хотите удалить цель "${goalDescription}" на сумму ${formattedAmount} ₽?`;

        openModal('confirmDeleteGoal', {
            title: 'Подтверждение удаления цели',
            message: message,
            onConfirm: () => handleDeleteConfirm(goal.id),
            confirmText: 'Удалить',
        });
    };

    const handleSetCurrentClick = (goal: Goal): void => {
        clearError();
        if (currentGoal && currentGoal.id === goal.id) {
            return;
        }

        const goalDescription = goal.description || `с ID ${goal.id}`;
        const message = `Вы уверены, что хотите установить цель "${goalDescription}" как текущую?`;

        openModal('confirmSetCurrentGoal', {
            title: 'Установить текущую цель',
            message: message,
            onConfirm: () => handleSetCurrentConfirm(goal.id),
            confirmText: 'Установить',
        });
    };

    return {
        handleAddClick,
        handleEditClick,
        handleDeleteClick,
        handleSetCurrentClick
    };
};
