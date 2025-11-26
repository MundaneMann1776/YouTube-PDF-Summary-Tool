# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-11-26

### 🚀 Features
- **Gemini 2.5 Flash Lite**: Upgraded the AI model to `gemini-2.5-flash-lite` for a better balance of speed, cost, and performance.
- **Enhanced PDF Generation**:
    - Completely rewritten PDF engine using manual line-by-line rendering.
    - Enforced **APA Style** formatting (Times New Roman, Double Spacing, 1-inch margins).
    - Fixed text overlapping and layout issues.
- **Smart Summarization**:
    - Implemented a "Best Effort" strategy: The AI now synthesizes summaries from web searches (reviews, articles) if a full transcript is unavailable, preventing refusals.
    - Removed strict JSON requirements to eliminate parsing errors and improve robustness.
- **UI Improvements**:
    - Moved the **Trash/Clear** button to the Results header for better usability.
    - Updated the **About This App** modal with current model information and features.
    - Added a pulsing progress indicator for better visual feedback.

### 🐛 Fixes
- Fixed "Invalid or empty structure" errors by switching to direct Markdown response handling.
- Fixed "I cannot watch videos" refusals by optimizing the system prompt.
- Fixed PDF filename generation to handle special characters safely.
- Fixed spinner animation issues in the UI.

### ⚙️ Configuration
- Added `.env.example` for easier developer setup.
- Updated `README.md` with professional project description and setup instructions.
