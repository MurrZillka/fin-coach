//03_Pages/CreditsPage/config/modalFields.ts

// Типы для полей формы
export type FieldType = 'text' | 'number' | 'date' | 'checkbox' | 'select';

export interface FormField {
    name: string;
    label: string;
    required: boolean;
    type: FieldType;
    placeholder?: string;
    options?: Array<{ value: string | number; label: string }>;
    min?: number;
    max?: number;
    step?: number;
}

// Интерфейс для данных формы дохода
export interface CreditFormData {
    description: string;
    amount: number;
    date: string;
    is_permanent: boolean;
    is_exhausted?: boolean;
    end_date?: string;
}

// Функция для получения полей формы дохода
export const getCreditFields = (formData: Partial<CreditFormData>): FormField[] => {
    const fields: FormField[] = [
        {
            name: 'description',
            label: 'Описание дохода',
            required: true,
            type: 'text',
            placeholder: 'Введите описание дохода'
        },
        {
            name: 'amount',
            label: 'Сумма',
            required: true,
            type: 'number',
            min: 0,
            step: 0.01
        },
        {
            name: 'date',
            label: 'Дата начала',
            required: true,
            type: 'date',
        },
        {
            name: 'is_permanent',
            label: 'Это постоянный доход?',
            required: false,
            type: 'checkbox',
        }
    ];

    if (formData.is_permanent) {
        fields.push({
            name: 'is_exhausted',
            label: 'Этот источник иссяк?',
            required: false,
            type: 'checkbox',
        });

        if (formData.is_exhausted) {
            fields.push({
                name: 'end_date',
                label: 'Дата окончания',
                required: false,
                type: 'date',
            });
        }
    }

    return fields;
};

// Валидация формы
export const validateCreditForm = (formData: Partial<CreditFormData>): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!formData.description?.trim()) {
        errors.description = 'Описание дохода обязательно для заполнения';
    }

    if (!formData.amount || formData.amount <= 0) {
        errors.amount = 'Сумма должна быть больше 0';
    }

    if (!formData.date) {
        errors.date = 'Дата начала обязательна для заполнения';
    }

    if (formData.is_permanent && formData.is_exhausted && !formData.end_date) {
        errors.end_date = 'Дата окончания обязательна, если источник иссяк';
    }

    if (formData.is_permanent && formData.is_exhausted && formData.end_date && formData.date) {
        const startDate = new Date(formData.date);
        const endDate = new Date(formData.end_date);

        if (endDate <= startDate) {
            errors.end_date = 'Дата окончания должна быть позже даты начала';
        }
    }

    return errors;
};

// Начальные значения формы
export const getInitialCreditFormData = (): CreditFormData => ({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0], // Текущая дата в формате YYYY-MM-DD
    is_permanent: false,
    is_exhausted: false,
    end_date: ''
});

// Функция для подготовки данных к отправке на сервер
export const prepareCreditDataForSubmit = (formData: CreditFormData): Partial<CreditFormData> => {
    const submitData: Partial<CreditFormData> = {
        description: formData.description.trim(),
        amount: Number(formData.amount),
        date: formData.date,
        is_permanent: formData.is_permanent
    };

    if (formData.is_permanent) {
        submitData.is_exhausted = formData.is_exhausted;

        if (formData.is_exhausted && formData.end_date) {
            submitData.end_date = formData.end_date;
        }
    }

    return submitData;
};
