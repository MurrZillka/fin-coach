import PropTypes from 'prop-types';

const variants = {
    h1: 'text-2xl font-semibold text-background',
    h2: 'text-xl font-semibold text-secondary-800',
    h3: 'text-lg font-medium text-secondary-800',
    h4: 'text-base font-medium text-secondary-800',
    th: 'text-base font-semibold text-secondary-800',
    tdPrimary: 'text-base font-normal text-secondary-800',
    tdSecondary: 'text-base font-normal text-secondary-500',
    button: 'text-base font-normal text-background',
    tooltip: 'text-xs font-normal text-background',
    navLink: 'text-base font-normal text-secondary-200 hover:text-primary-500',
    navLinkInactive: 'text-base font-normal text-secondary-200',
    error: 'text-sm font-normal text-accent-error',
    success: 'text-sm font-normal text-accent-success',
    caption: 'text-sm font-normal text-secondary-500',
    label: 'text-sm font-medium text-secondary-800',
    accent: 'text-base font-semibold text-primary-600',
    formError: 'text-sm font-normal text-form-error',
};

export default function Text({ variant = 'tdPrimary', children, className = '' }) {
    return (
        <span className={`${variants[variant]} ${className}`}>
      {children}
    </span>
    );
}

Text.propTypes = {
    variant: PropTypes.oneOf(Object.keys(variants)),
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};