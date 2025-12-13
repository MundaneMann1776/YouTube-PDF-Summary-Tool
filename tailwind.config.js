/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.vue",
        "./main.ts",
        "./components/**/*.{js,ts,jsx,tsx,vue}",
        "./services/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}