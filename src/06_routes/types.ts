import React from "react";

export interface LinkItem {
    path: string;
    label: string;
}

export interface RouteItem {
    path: string;
    element: React.JSX.Element;
    isProtected?: boolean;
}