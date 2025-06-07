// src/components/ui/NavLinkItem.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Text from './Text.js';

const NavLinkItem = ({ to, label, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <span className="mx-4">
      {isActive ? (
          <Text variant="navLinkInactive" className="opacity-50 cursor-default">
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