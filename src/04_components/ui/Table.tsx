// src/components/ui/Table.tsx
import React from 'react';
import Text from './Text'; // Путь поправишь, если нужно

interface Column<T> {
    key: string;
    header: string;
    headerClassName?: string;
    cellClassName?: string;
    component: React.ComponentType<{ data: T; index: number }>;
    props?: Record<string, unknown>;
}

interface TableProps<T> {
    data?: T[];
    columns?: Column<T>[];
    loading?: boolean;
    emptyMessage?: string;
    className?: string;
}

function Table<T extends { id?: string | number }>({
    data = [],
    columns = [],
    loading = false,
    emptyMessage = "Нет данных для отображения",
    className = ""
}: TableProps<T>) {
    if (loading && (!data || data.length === 0)) {
        return (
            <div className="text-center p-4">
                <Text variant="body">Загрузка...</Text>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center p-4">
                <Text variant="body">{emptyMessage}</Text>
            </div>
        );
    }

    return (
        <table className={`min-w-full ${className}`}>
            <thead className="bg-secondary-200">
            <tr>
                <th className="text-left pl-4 pr-0 py-4">
                    <Text variant="th">№</Text>
                </th>
                {columns.map((column) => (
                    <th
                        key={column.key}
                        className={column.headerClassName || "text-left p-4"}
                    >
                        <Text variant="th">{column.header}</Text>
                    </th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.map((row, index) => (
                <tr
                    key={row.id || index}
                    className={index % 2 === 0 ? 'bg-background' : 'bg-secondary-50'}
                >
                    <td className="pl-4 pr-0 py-4">
                        <Text variant="body">{index + 1}</Text>
                    </td>
                    {columns.map((column) => (
                        <td
                            key={column.key}
                            className={column.cellClassName || "px-2 py-4"}
                        >
                            <column.component
                                data={row}
                                index={index}
                                {...column.props}
                            />
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    );
}

export default Table;
