/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                'dark-gray': '#1e1f22',
                'dark-gray-2': '#2b2d31',
                'dark-gray-3': '#313338',
                'dark-text': '#fff',
                'dark-text-2': '#e5e7eb',
                'dark-text-3': '#d1d5db',
                'light-gray-1': '#f7f7f7',
                'light-gray-2': '#eaeaea',
                'light-gray-3': '#d4d4d4',
                'light-text': '#030712', //bg-gray-100
                'light-text-2': '#0f172a', //bg-gray-200
                'light-text-3': '#475569', //bg-gray-300
            },
        },
    },
    plugins: [],
};
