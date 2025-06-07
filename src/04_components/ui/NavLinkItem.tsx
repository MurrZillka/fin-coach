// src/components/ui/NavLinkItem.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Text from './Text';

interface NavLinkItemProps {
    to: string;
    label: string;
    onClick?: () => void;
    className?: string;
}

const NavLinkItem = ({ to, label, onClick }: NavLinkItemProps) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <span className="mx-4">
            {isActive ? (
                <Text variant="navLinkInactive">
                    {label}
                </Text>
            ) : (
                <Link to={to} onClick={onClick}>
                    <Text variant="navLink">
                        {label}
                    </Text>
                </Link>
            )}
        </span>
    );
};

NavLinkItem.displayName = 'NavLinkItem';

export default NavLinkItem;
