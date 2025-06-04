// src/components/ui/Table.jsx
import Text from './Text';

export default function Table({
                                  data = [],
                                  columns = [],
                                  loading = false,
                                  emptyMessage = "Нет данных для отображения",
                                  className = ""
                              }) {
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
                    {/* Номер строки */}
                    <td className="pl-4 pr-0 py-4">
                        <Text variant="tdPrimary">{index + 1}</Text>
                    </td>

                    {/* Данные колонок */}
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
