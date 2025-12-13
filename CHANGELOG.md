# Changelog

All notable changes to this project will be documented in this file.

## [0.6.0] - 2025-12-13

### ⚡ Framework Migration (Vue.js 3)
- **Rebuilt Core**: Completely migrated from **Electron + React** to a lightweight, standalone **Vue.js 3** web application.
- **Improved Performance**: faster load times and smoother interactions thanks to Vite and Vue's reactivity system.
- **Web Deployment**: Optimized for GitHub Pages deployment (removed Electron dependencies).

### 🎨 UI Overhaul
- **Brand New Design**: Implemented a modern "glassmorphism" aesthetic with animated gradient backgrounds.
- **Typography**: Switched to **Roboto** (sans) and **Merriweather** (serif) for a professional look.
- **Polished Components**: Redesigned modals, buttons, and inputs with standardized focus states and transitions.
- **Accessibility**: Improved keyboard navigation (`focus-visible`) and added ARIA labels to icon buttons.

### 📄 PDF Engine Upgrade
- **Better Formatting**: Rewrote the PDF generator to support **Bold** and *Italic* markdown parsing.
- **Professional Layout**: Added a dedicated cover page, table of contents-style headers, and pagination (Page X of Y).
- **Times New Roman**: Switched document font to standard professional serif.

### 🔧 Fixes & Cleanup
- **Tailwind Config**: Fixed missing content paths that were breaking styles.
- **Fonts**: Fixed local font loading issues.
- **Cleanup**: Removed unused Electron/React files and obsolete configurations.

## [0.5.0] - 2025-12-01

### 🌍 Internationalization (i18n)
- **Multi-Language Support**: Added full support for **English, Turkish, French, German, and Spanish**.
- **Dynamic UI**: All interface elements now instantly switch to the selected language.
- **Localized Reports**: AI-generated summaries are now created in the selected language.

### 📄 Professional Reports
- **APA Style**: PDF reports now follow strict APA formatting (Double spacing, 1-inch margins, Roboto font).
- **Improved Layout**: Added Title Page, Page Numbers, and clean heading hierarchy.

### 💅 UI/UX Modernization
- **Glassmorphic Dock**: Replaced standard buttons with a sleek, floating glassmorphic dock.
- **Animations**: Added smooth transitions for theme switching and interactions.
- **Refined Inputs**: Modernized input fields and switches for a premium feel.

### 🔧 Improvements
- **Model Switching**: Added ability to select different Gemini models in Settings.
- **Branding**: Updated footer to "Powered by Google Gemini" and bumped version to v0.5.
- **Git Helper**: Added `push_changes.sh` script to simplify GitHub contributions.

## [0.4.0] - 2025-11-28

### 🚀 New Desktop Experience
- **Electron Migration**: The application is now a standalone desktop app for macOS and Windows.
- **Native Integration**: Runs outside the browser with a custom dock icon and native window management.

### 🔒 Security & Privacy
- **Local API Key Management**: Users can now enter their Gemini API key directly in the app. Keys are stored securely in local storage and never sent to third-party servers.
- **Content Security Policy (CSP)**: Implemented strict CSP headers to prevent unauthorized script execution and ensure data safety.

### 💅 UI/UX Improvements
- **Tailwind CSS**: Migrated the entire styling engine to Tailwind CSS v3 for a modern, consistent look.
- **Redesigned About Section**: Completely revamped the "About This App" modal with a cleaner, card-based layout and clearer instructions.
- **Custom App Icon**: Added a polished, transparent-corner app icon for a professional desktop feel.

### 🐛 Fixes
- Fixed `noembed.com` connection issues by updating CSP rules.
- Resolved Tailwind CSS configuration conflicts by stabilizing on version 3.
- Fixed dark mode styling inconsistencies in the new modal.