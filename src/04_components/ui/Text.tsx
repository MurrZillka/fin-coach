// src/components/ui/Text.tsx
import React from 'react';

const variants = {
    h1: 'text-2xl font-semibold text-background',
    h2: 'text-xl font-semibold text-secondary-800',
    h3: 'text-lg font-medium text-secondary-800',
    h4: 'text-base font-medium text-secondary-800',
    body: 'text-base font-normal text-secondary-800',
    bodySecondary: 'text-base font-normal text-secondary-500',
    caption: 'text-sm font-normal text-secondary-500',
    label: 'text-sm font-medium text-secondary-800',
    accent: 'text-base font-semibold text-primary-600',
    error: 'text-sm font-normal text-accent-error',
    success: 'text-sm font-normal text-accent-success',
    formError: 'text-sm font-normal text-form-error',
    balance: 'md:text-2xl text-xl',
    button: 'text-base font-normal text-background',
    tooltip: 'text-xs font-normal text-background',
    navLink: 'text-base font-normal text-secondary-200 hover:text-primary-500',
    th: 'text-base font-semibold text-secondary-800',
    navLinkInactive: 'text-base font-normal opacity-50 cursor-default',
    empty: ''
};

const defaultTags = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    body: 'p',
    bodySecondary: 'p',
    caption: 'span',
    label: 'label',
    accent: 'span',
    error: 'span',
    success: 'span',
    formError: 'span',
    balance: 'span',
    button: 'span',
    tooltip: 'span',
    navLink: 'span',
    th: 'span',
} as const;

type Variant = keyof typeof variants;
type AllowedTags = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'label' | string;

interface TextProps {
    variant?: Variant;
    children: React.ReactNode;
    className?: string;
    as?: AllowedTags;
}

export default function Text({
                                 variant = 'body',
                                 children,
                                 className = '',
                                 as
                             }: TextProps) {
    const Component = as || defaultTags[variant as keyof typeof defaultTags] || 'span';
    const variantClass = variants[variant as Variant] || '';
    const finalClasses = `${variantClass} ${className}`.trim();

    return (
        // @ts-ignore — если TypeScript ругается на Component как строку
        <Component className={finalClasses}>
            {children}
        </Component>
    );
}
