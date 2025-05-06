// src/pages/CreditsPage.jsx
import React, { useEffect } from 'react';
// Импортируем стор доходов
import useCreditStore from '../stores/creditStore';
// Импортируем стор модальных окон
import useModalStore from '../stores/modalStore';
// Импортируем UI компоненты
import Text from '../components/ui/Text';
import TextButton from '../components/ui/TextButton';
import IconButton from '../components/ui/IconButton';
// Импортируем иконки
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';


export default function CreditsPage() {
    // Получаем состояние и действия из стора доходов
    const { credits, loading, error, fetchCredits, clearError } = useCreditStore();
    // Получаем действия из стора модальных окон
    const { openModal } = useModalStore();

    // --- useEffect для первичной загрузки данных ---
    useEffect(() => {
        // Условие загрузки:
        // - Если сейчас не идет загрузка (!loading)
        // - И список доходов еще не был загружен (credits === null)
        // - И нет ошибки от предыдущей попытки загрузки (!error)
        if (!loading && credits === null && !error) {
            console.log('CreditsPage: Triggering fetchCredits...');
            fetchCredits(); // Вызываем действие загрузки
        }

        // Очищаем ошибку при размонтировании компонента
        return () => {
            clearError();
        };
        // Зависимости: fetchCredits, loading, credits, error, clearError
    }, [fetchCredits, loading, credits, error, clearError]);

    // --- Обработчики действий ---
    // ЭТОТ БЛОК ДОЛЖЕН ПРИСУТСТВОВАТЬ В ФАЙЛЕ
    // Открытие модального окна добавления дохода
    const handleAddCredit = () => {
        console.log('CreditsPage: Opening Add Credit modal');
        // Здесь будут props для формы добавления
        openModal('addCredit', { /* ... */ });
    };

    // Открытие модального окна редактирования дохода
    const handleEditCredit = (creditId) => {
        console.log(`CreditsPage: Opening Edit Credit modal for ID: ${creditId}`);
        // Здесь нужно будет получить данные конкретного дохода по creditId из стора или через API,
        // и передать их в props для формы редактирования.
        // openModal('editCredit', { creditId: creditId, initialData: {...} });
    };

    // Открытие модального окна подтверждения удаления
    const handleDeleteCredit = (creditId) => {
        console.log(`CreditsPage: Opening Delete Credit confirmation for ID: ${creditId}`);
        // openModal('confirmDelete', { itemType: 'доход', itemId: creditId, onDeleteConfirm: () => { /* логика удаления */ } });
    };
    // --- Конец обработчиков действий ---


    // --- Рендеринг ---
    return (
        <div className="max-w-4xl mx-auto p-4 min-h-screen">
            {/* Заголовок */}
            <Text variant="h2" className="mb-6 text-center">Мои Доходы</Text>

            {/* Кнопка добавления нового дохода */}
            <div className="mb-6 text-right">
                {/* Убедись, что handleAddCredit определен выше */}
                <TextButton onClick={handleAddCredit}>
                    <PlusIcon className="h-5 w-5 mr-1" />
                    Добавить доход
                </TextButton>
            </div>

            {/* Индикатор загрузки */}
            {/* Показываем загрузку, если loading true, И у нас еще нет загруженных данных (credits === null) */}
            {loading && credits === null && (
                <div className="text-center">
                    <Text variant="body">Загрузка доходов...</Text>
                </div>
            )}
            {/* Показываем индикатор загрузки поверх уже имеющихся данных, если идет обновление/удаление */}
            {loading && credits !== null && (
                <div className="text-center">
                    <Text variant="body">Обновление данных...</Text>
                </div>
            )}


            {/* Отображение ошибки */}
            {/* Показываем ошибку, если она есть */}
            {error && (
                <div className="text-center text-error-500">
                    <Text variant="body">Ошибка загрузки: {error.message || 'Неизвестная ошибка'}</Text>
                    {/* Повторить загрузку показываем только если нет текущей загрузки */}
                    {!loading && (
                        <TextButton onClick={fetchCredits} className="mt-2">
                            Повторить загрузку
                        </TextButton>
                    )}
                </div>
            )}

            {/* Отображение списка доходов */}
            {/* Показываем список, если не идет загрузка, нет ошибки, И список credits НЕ null И его длина > 0 */}
            {!loading && !error && credits !== null && credits.length > 0 && (
                <ul className="space-y-4">
                    {credits.map(credit => (
                        <li key={credit.id} className="bg-white p-4 rounded-md shadow-sm flex justify-between items-center">
                            {/* ... детали дохода ... */}
                            <div className="flex-grow mr-4">
                                <Text variant="bodyLarge" className="font-semibold">{credit.description}</Text>
                                <Text variant="body" className="text-accent-success mt-1">
                                    {typeof credit.amount === 'number' ? credit.amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : credit.amount} ₽
                                    {' от '}
                                    {credit.date ? new Date(credit.date).toLocaleDateString() : 'Не указана'}
                                    {credit.is_permanent && ' (Постоянный)'}
                                </Text>
                            </div>
                            {/* ... кнопки действий ... */}
                            <div className="flex-shrink-0 flex items-center">
                                {/* Убедись, что handleEditCredit определен выше */}
                                <IconButton
                                    icon={PencilIcon}
                                    onClick={() => handleEditCredit(credit.id)}
                                    className="text-secondary-600 hover:text-primary-600 mr-2"
                                />
                                {/* Убедись, что handleDeleteCredit определен выше */}
                                <IconButton
                                    icon={TrashIcon}
                                    onClick={() => handleDeleteCredit(credit.id)}
                                    className="text-secondary-600 hover:text-error-600"
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Сообщение, если список доходов пуст */}
            {/* Показываем, если не загрузка, нет ошибки, список credits НЕ null И его длина === 0 */}
            {!loading && !error && credits !== null && credits.length === 0 && (
                <div className="text-center text-secondary-600">
                    <Text variant="body">У вас пока нет добавленных доходов.</Text>
                </div>
            )}

            {/* Модальные окна */}

        </div>
    );
}