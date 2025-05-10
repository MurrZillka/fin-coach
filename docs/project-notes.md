# FinCoach: Заметки по фронтенду (10 мая 2025)

## Оптимизация LayoutWithHeader
- **Дата**: 10 мая 2025
- **Файлы**:
    - `src/components/LayoutWithHeader.jsx`: Упрощён рендеринг хедера, модалки вынесены в `ModalManager`, добавлены адаптивные стили для футера.
    - `src/components/ModalManager.jsx`: Новый компонент для рендеринга `Modal` и `ConfirmModal`.
    - `src/index.css`: Добавлены медиа-запросы для футера.

## Изменения
1. **ModalManager**:
    - Рендерит модалки на основе `modalType` из `useModalStore`.
    - Устраняет громоздкую логику в `LayoutWithHeader`.
    - Пример:
      ```javascript
      <ModalManager />

# FinCoach: Заметки по фронтенду (10 мая 2025)

## Исправление ошибок в ModalManager
- **Дата**: 10 мая 2025
- **Проблема**:
    - Ошибка: `Maximum update depth exceeded` в `ModalManager.jsx`.
    - Предупреждение: `The result of getSnapshot should be cached`.
    - Множественные вызовы `initAuth` и `fetchCredits` в `App.jsx`.
- **Файлы**:
    - `src/components/ModalManager.jsx`: Добавлен `shallow` для селектора `useModalStore`.
    - `src/components/LayoutWithHeader.jsx`: Добавлен `ErrorBoundary` вокруг `ModalManager`.
    - `src/components/ErrorBoundary.jsx`: Новый компонент для обработки ошибок.
    - `src/App.jsx`: Исправлены `useEffect` для предотвращения дублирующих вызовов.

## Изменения
1. **ModalManager**:
    - Использует `shallow` для предотвращения бесконечных рендеров:
      ```javascript
      import { shallow } from 'zustand/shallow';
      const { modalType, modalProps, closeModal } = useModalStore(..., shallow);