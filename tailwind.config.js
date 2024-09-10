/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                'dark-gray': '#1e1f22',
                'dark-gray-2': '#2b2d31',
                'dark-gray-3': '#313338',
            },
        },
    },
    plugins: [],
};
