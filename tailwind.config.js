import { defineConfig } from 'tailwindcss';
import tailwindVite from '@tailwindcss/vite';

export default defineConfig({
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    500: '#3b82f6', // blue-500
                    600: '#2563eb', // blue-600
                    700: '#1d4ed8', // blue-700
                },
                secondary: {
                    50: '#f9fafb', // gray-50
                    200: '#e5e7eb', // gray-200
                    500: '#6b7280', // gray-500
                    800: '#1f2937', // gray-800
                },
                accent: {
                    success: '#10b981', // green-500
                    error: '#ef4444', // red-500
                    warning: '#eab308', // yellow-500
                },
                background: '#ffffff', // white
            },
        },
    },
    plugins: [tailwindVite],
});