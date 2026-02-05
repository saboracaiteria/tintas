/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Roboto', 'sans-serif'],
            },
            colors: {
                brand: {
                    purple: 'var(--color-header-bg)',
                    red: 'var(--color-button-primary)',
                    green: '#4caf50',
                    dark: 'var(--color-text-primary)',
                    bg: 'var(--color-background)',
                }
            }
        },
    },
    plugins: [],
}
