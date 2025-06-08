// IncomeExpenseChart.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import IncomeExpenseChart from './IncomeExpenseChart';

// Мокаем Recharts
vi.mock('recharts', () => ({
    LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
    BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
    Line: () => <div data-testid="line" />,
    Bar: () => <div data-testid="bar" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
}));

// Тестовые данные
const mockCredits = [
    {
        id: 1,
        date: '2024-01-15T00:00:00Z',
        amount: 50000,
        is_permanent: false,
        end_date: '2024-01-15T00:00:00Z',
    },
    {
        id: 2,
        date: '2024-01-20T00:00:00Z',
        amount: 30000,
        is_permanent: true,
        end_date: '2024-12-31T00:00:00Z',
    },
];

const mockSpendings = [
    {
        id: 1,
        date: '2024-01-15T00:00:00Z',
        amount: 1000,
        is_permanent: false,
        end_date: '2024-01-15T00:00:00Z',
    },
    {
        id: 2,
        date: '2024-01-20T00:00:00Z',
        amount: 2000,
        is_permanent: false,
        end_date: '2024-01-20T00:00:00Z',
    },
];

const defaultProps = {
    credits: mockCredits,
    spendings: mockSpendings,
    isLoadingData: false,
};

describe('IncomeExpenseChart', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should render correctly with default props', () => {
        render(<IncomeExpenseChart {...defaultProps} />);

        expect(screen.getByText('Динамика доходов и расходов')).toBeInTheDocument();
        expect(screen.getByText('Линии')).toBeInTheDocument();
        expect(screen.getByText('Столбцы')).toBeInTheDocument();
        expect(screen.getByText('За год')).toBeInTheDocument();
        expect(screen.getByText('За месяц')).toBeInTheDocument();
        expect(screen.getByText('За все время')).toBeInTheDocument();
    });

    it('should render line chart by default', () => {
        render(<IncomeExpenseChart {...defaultProps} />);

        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });

    it('should switch to bar chart when bar button is clicked', async () => {
        render(<IncomeExpenseChart {...defaultProps} />);

        const barButton = screen.getByText('Столбцы');
        fireEvent.click(barButton);

        await waitFor(() => {
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
            expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
        });
    });

    it('should switch periods correctly', async () => {
        render(<IncomeExpenseChart {...defaultProps} />);

        const allTimeButton = screen.getByText('За все время');
        expect(allTimeButton).toHaveClass('bg-blue-600');

        const monthButton = screen.getByText('За месяц');
        fireEvent.click(monthButton);

        await waitFor(() => {
            expect(monthButton).toHaveClass('bg-blue-600');
            expect(allTimeButton).toHaveClass('bg-gray-200');
        });
    });

    it('should disable buttons when loading', () => {
        render(<IncomeExpenseChart {...defaultProps} isLoadingData={true} />);

        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
            expect(button).toBeDisabled();
        });
    });

    it('should show chart even with empty data', () => {
        render(<IncomeExpenseChart credits={[]} spendings={[]} isLoadingData={false} />);

        // Компонент показывает график даже с пустыми данными
        expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should handle empty credits array', () => {
        render(<IncomeExpenseChart credits={[]} spendings={mockSpendings} />);

        expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should handle empty spendings array', () => {
        render(<IncomeExpenseChart credits={mockCredits} spendings={[]} />);

        expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should handle undefined props gracefully', () => {
        render(<IncomeExpenseChart />);

        expect(screen.getByText('Динамика доходов и расходов')).toBeInTheDocument();
        // Компонент показывает график даже без данных
        expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should handle window resize correctly', () => {
        render(<IncomeExpenseChart {...defaultProps} />);

        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 500,
        });

        fireEvent(window, new Event('resize'));

        expect(screen.getByText('Динамика доходов и расходов')).toBeInTheDocument();
    });

    it('should render chart with data for year period', async () => {
        render(<IncomeExpenseChart {...defaultProps} />);

        const yearButton = screen.getByText('За год');
        fireEvent.click(yearButton);

        await waitFor(() => {
            expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
        });
    });

    it('should render chart with data for month period', async () => {
        render(<IncomeExpenseChart {...defaultProps} />);

        const monthButton = screen.getByText('За месяц');
        fireEvent.click(monthButton);

        await waitFor(() => {
            expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
        });
    });

    it('should handle permanent credits and spendings correctly', () => {
        const permanentCredits = [
            {
                id: 1,
                date: '2024-01-01T00:00:00Z',
                amount: 50000,
                is_permanent: true,
                end_date: '2024-12-31T00:00:00Z',
            }
        ];

        const permanentSpendings = [
            {
                id: 1,
                date: '2024-01-01T00:00:00Z',
                amount: 5000,
                is_permanent: true,
                end_date: '2024-12-31T00:00:00Z',
            }
        ];

        render(<IncomeExpenseChart credits={permanentCredits} spendings={permanentSpendings} />);

        expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should call prepareChartData with correct parameters', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        render(<IncomeExpenseChart {...defaultProps} />);

        expect(consoleSpy).toHaveBeenCalledWith('prepareChartData called with period:', 'all-time');

        consoleSpy.mockRestore();
    });
});
