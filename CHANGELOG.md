# Changelog

All notable changes to this project will be documented in this file.
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