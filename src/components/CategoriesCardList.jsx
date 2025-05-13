// src/components/CategoriesCardList.jsx
import React from 'react';
import Text from './ui/Text';
import IconButton from './ui/IconButton';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const CategoriesCardList = ({
                                categories,
                                loading, // Получаем статус загрузки для индикатора "Обновление"
                                handleEditClick,
                                handleDeleteClick,
                                className // Для применения внешних классов видимости (block md:hidden) и отступов
                            }) => {

    // Основной контейнер для мобильного представления: сетка карточек
    // Используем Grid для создания карточек одинаковой высоты
    // p-4 и gap-4 для отступов и промежутков между карточками
    // block md:hidden для контроля видимости
    return (
        <div className={`grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 ${className}`}>
            {/* Проверяем, есть ли категории и не идет ли загрузка, прежде чем мапить */}
            {categories !== null && categories.length > 0 ? (
                categories.map((category, index) => ( // index теперь используется
                    // Карточка одной категории
                    // p-3, bg-background, rounded-md, shadow-sm для стиля карточки
                    // flex-col justify-between gap-1 для внутреннего расположения элементов
                    <div key={category.id} className="p-3 bg-background rounded-md shadow-xl flex flex-col justify-between gap-1">
                        {/* Название категории (и номер по порядку) */}
                        {/* Используем flex и items-baseline для выравнивания номера и текста названия */}
                        <div className="flex items-baseline gap-1">
                            {/* Порядковый номер */}
                            <Text variant="tdSecondary" className="text-xs text-gray-600">{index + 1}.</Text>
                            {/* Само название категории */}
                            <Text variant="tdPrimary" className="text-sm font-semibold truncate">
                                {category.name}
                            </Text>
                        </div>
                        {/* Описание категории */}
                        {/* Описание может быть опциональным */}
                        <Text variant="tdSecondary" className="text-xs text-gray-600">
                            {category.description || 'Без описания'} {/* Текст по умолчанию, если описания нет */}
                        </Text>
                        {/* Действия */}
                        {/* flex gap-1 mt-auto для размещения кнопок внизу с небольшим отступом */}
                        <div className="flex gap-1 mt-auto"> {/* mt-auto выталкивает блок вниз */}
                            {/* Кнопка Редактировать - вызывает handleEditClick */}
                            {/* p-1 для небольшого отступа вокруг иконки внутри кнопки */}
                            <IconButton
                                icon={PencilIcon}
                                tooltip="Редактировать"
                                className="p-1 text-primary-600 hover:bg-primary-600/10 hover:text-primary-500"
                                onClick={() => handleEditClick(category)} // Передаем всю категорию
                            />
                            {/* Кнопка Удалить - вызывает handleDeleteClick */}
                            <IconButton
                                icon={TrashIcon}
                                tooltip="Удалить"
                                className="p-1 text-accent-error hover:bg-accent-error/10 hover:text-accent-error/80"
                                onClick={() => handleDeleteClick(category.id)} // Передаем ID
                            />
                        </div>
                    </div>
                ))
            ) : (
                // Этот блок будет показан, если категории === null или length === 0
                // но только если внешний компонент (CategoriesPage) решит его показать
                // Мы также добавляем col-span-full, чтобы текст занимал всю ширину Grid контейнера
                categories !== null && categories.length === 0 && !loading && (
                    <div className="col-span-full p-4 text-center">
                        <Text variant="body">У вас пока нет категорий. Создайте первую!</Text>
                    </div>
                )
            )}
            {/* Индикатор фоновой загрузки/обновления списка внутри контейнера Grid */}
            {/* Показываем, если loading true, но категории уже не null (идет обновление) */}
            {loading && categories !== null ? (
                <div className="col-span-full text-center p-4">
                    <Text variant="body">Обновление списка категорий...</Text>
                </div>
            ) : null}
        </div>
    );
};

export default CategoriesCardList;