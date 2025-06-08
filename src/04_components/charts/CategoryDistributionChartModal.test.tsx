// CategoryDistributionChartModal.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoryDistributionChartModal from './CategoryDistributionChartModal';

// Мокаем сторы
const mockUseSpendingsStore = vi.fn();
const mockUseCategoryStore = vi.fn();

vi.mock('../../02_stores/spendingsStore/spendingsStore', () => ({
    default: () => mockUseSpendingsStore(),
}));

vi.mock('../../02_stores/categoryStore/categoryStore', () => ({
    default: () => mockUseCategoryStore(),
}));

// Мокаем агрегатор
const mockAggregateSpendingsByCategory = vi.fn();
vi.mock('../../07_utils/spendingAggregator', () => ({
    aggregateSpendingsByCategory: mockAggregateSpendingsByCategory,
}));

// Мокаем Recharts
vi.mock('recharts', () => ({
    PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
    Pie: () => <div data-testid="pie" />,
    Cell: () => <div data-testid="cell" />,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
}));

// Мокаем framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, onClick, ...props }: any) => (
            <div onClick={onClick} {...props}>{children}</div>
        ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Тестовые данные
const mockSpendings = [
    {
        id: 1,
        user_id: 1,
        is_delete: false,
        amount: 1000,
        description: 'Еда',
        is_permanent: false,
        date: '2024-01-15T00:00:00Z',
        category_id: 1,
        end_date: '2024-01-15T00:00:00Z',
        full_amount: 1000
    },
    {
        id: 2,
        user_id: 1,
        is_delete: false,
        amount: 2000,
        description: 'Транспорт',
        is_permanent: false,
        date: '2024-01-20T00:00:00Z',
        category_id: 2,
        end_date: '2024-01-20T00:00:00Z',
        full_amount: 2000
    },
];

const mockCategories = [
    { id: 1, name: 'Еда', description: 'Продукты питания', is_delete: false, user_id: 1 },
    { id: 2, name: 'Транспорт', description: 'Проезд', is_delete: false, user_id: 1 },
];

const mockCategoriesMonth = {
    'Еда': 5000,
    'Транспорт': 3000,
};

const mockCategoryColorMap = {
    'Еда': '#FF6384',
    'Транспорт': '#36A2EB',
};

const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Распределение расходов',
};

describe('CategoryDistributionChartModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockUseSpendingsStore.mockReturnValue({
            spendings: mockSpendings,
            loading: false,
            fetchSpendings: vi.fn(),
        });

        mockUseCategoryStore.mockReturnValue({
            categories: mockCategories,
            loading: false,
            fetchCategories: vi.fn(),
            categoriesMonth: mockCategoriesMonth,
            getCategoriesMonth: vi.fn(),
            categoryColorMap: mockCategoryColorMap,
        });

        mockAggregateSpendingsByCategory.mockReturnValue({
            'Еда': 1000,
            'Транспорт': 2000,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should render correctly when modal is open', () => {
        render(<CategoryDistributionChartModal {...defaultProps} />);

        expect(screen.getByText('Распределение расходов в текущем месяце')).toBeInTheDocument();
        expect(screen.getByText('Текущий месяц')).toBeInTheDocument();
        expect(screen.getByText('Последние 30 дней')).toBeInTheDocument();
        expect(screen.getByText('Последний год')).toBeInTheDocument();
        expect(screen.getByText('Все время')).toBeInTheDocument();
    });

    it('should not render when modal is closed', () => {
        render(<CategoryDistributionChartModal {...defaultProps} isOpen={false} />);

        expect(screen.queryByText('Распределение расходов')).not.toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
        const mockOnClose = vi.fn();
        render(<CategoryDistributionChartModal {...defaultProps} onClose={mockOnClose} />);

        const closeButton = screen.getByLabelText('Закрыть модальное окно');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should display current month data from categoriesMonth', () => {
        render(<CategoryDistributionChartModal {...defaultProps} />);

        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
        expect(screen.getByText('₽8,000')).toBeInTheDocument(); // 5000 + 3000
    });

    it('should switch periods and call aggregator', async () => {
        render(<CategoryDistributionChartModal {...defaultProps} />);

        const allTimeButton = screen.getByText('Все время');
        fireEvent.click(allTimeButton);

        await waitFor(() => {
            expect(mockAggregateSpendingsByCategory).toHaveBeenCalledWith(
                mockSpendings,
                mockCategories,
                'allTime'
            );
        });

        expect(screen.getByText('₽3,000')).toBeInTheDocument(); // 1000 + 2000
    });

    it('should show loading when data is loading', () => {
        mockUseSpendingsStore.mockReturnValue({
            spendings: null,
            loading: true,
            fetchSpendings: vi.fn(),
        });

        render(<CategoryDistributionChartModal {...defaultProps} />);

        expect(screen.getByText('Загрузка данных...')).toBeInTheDocument();
    });

    it('should show no data message when no data available', () => {
        mockUseCategoryStore.mockReturnValue({
            categories: mockCategories,
            loading: false,
            fetchCategories: vi.fn(),
            categoriesMonth: {},
            getCategoriesMonth: vi.fn(),
            categoryColorMap: mockCategoryColorMap,
        });

        render(<CategoryDistributionChartModal {...defaultProps} />);

        expect(screen.getByText('Нет данных о расходах для выбранного периода.')).toBeInTheDocument();
    });

    it('should call fetch methods when modal opens with no data', () => {
        const mockFetchSpendings = vi.fn();
        const mockFetchCategories = vi.fn();
        const mockGetCategoriesMonth = vi.fn();

        mockUseSpendingsStore.mockReturnValue({
            spendings: null,
            loading: false,
            fetchSpendings: mockFetchSpendings,
        });

        mockUseCategoryStore.mockReturnValue({
            categories: null,
            loading: false,
            fetchCategories: mockFetchCategories,
            categoriesMonth: null,
            getCategoriesMonth: mockGetCategoriesMonth,
            categoryColorMap: {},
        });

        render(<CategoryDistributionChartModal {...defaultProps} />);

        expect(mockFetchSpendings).toHaveBeenCalledTimes(1);
        expect(mockFetchCategories).toHaveBeenCalledTimes(1);
        expect(mockGetCategoriesMonth).toHaveBeenCalledTimes(1);
    });

    it('should update title when period changes', async () => {
        render(<CategoryDistributionChartModal {...defaultProps} />);

        expect(screen.getByText('Распределение расходов в текущем месяце')).toBeInTheDocument();

        const lastYearButton = screen.getByText('Последний год');
        fireEvent.click(lastYearButton);

        await waitFor(() => {
            expect(screen.getByText('Распределение расходов за последний год')).toBeInTheDocument();
        });
    });

    it('should handle empty aggregator data', () => {
        mockAggregateSpendingsByCategory.mockReturnValue({});

        render(<CategoryDistributionChartModal {...defaultProps} />);

        const allTimeButton = screen.getByText('Все время');
        fireEvent.click(allTimeButton);

        expect(screen.getByText('Нет данных о расходах для выбранного периода.')).toBeInTheDocument();
    });
});
