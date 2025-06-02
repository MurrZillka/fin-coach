// src/components/ui/cells/SpendingAmountCell.jsx
import Text from '../Text';

export default function SpendingAmountCell({ data }) {
    if (data.is_permanent) {
        return (
            <>
                <div className="flex flex-wrap items-baseline mb-1">
                    <Text variant="tdSecondary" className="text-xs text-gray-600 mr-1 mb-1 whitespace-nowrap">
                        Разовый платеж:
                    </Text>
                    <Text variant="tdPrimary" className="text-accent-error font-semibold">
                        {typeof data.amount === 'number'
                            ? data.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : data.amount}
                        {'\u00A0'}₽
                    </Text>
                </div>
                <div className="flex items-center">
                    <Text variant="tdSecondary" className="font-normal text-gray-600 mr-1">Всего:</Text>
                    <Text variant="tdPrimary" className="text-accent-error font-semibold">
                        {typeof data.full_amount === 'number'
                            ? data.full_amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : data.full_amount}
                        {'\u00A0'}₽
                    </Text>
                </div>
            </>
        );
    }

    return (
        <div className="flex items-center">
            <Text variant="tdSecondary" className="font-normal text-gray-600 mr-1">Сумма:</Text>
            <Text variant="tdPrimary" className="text-accent-error font-semibold">
                {typeof data.amount === 'number'
                    ? data.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : data.amount}
                {'\u00A0'}₽
            </Text>
        </div>
    );
}
