# YouTube Video to PDF Summarizer 🎥 ➡️ 📄

**Transform YouTube videos into detailed, professional PDF summaries using the power of Google Gemini AI.**

This tool is a fast, lightweight, and privacy-focused web application built with **Vue.js 3**. It allows you to generate comprehensive summaries of YouTube videos in multiple languages and export them as neatly formatted, professional PDF documents perfect for studying, research, or archiving.

### 🚀 **[Live Demo: Try it on GitHub Pages](https://mundanemann1776.github.io/YouTube-PDF-Summary-Tool/)**

---

## 📖 About

The **YouTube Video to PDF Summarizer** bridges the gap between video content and written documentation. Whether you're a student trying to summarize a lecture, a researcher gathering data, or just someone who prefers reading over watching, this tool automates the process.

It goes beyond simple transcription. By leveraging **Google Gemini**, it "watches" the video (processing transcripts and metadata) to generate a structured, intelligent summary that captures key points, arguments, and context. It then formats this directly into a clean, APA-style PDF document ready for download.

## ✨ Features

*   **🧠 AI-Powered Analysis**: Utilizes the latest Google Gemini models to understand and summarize complex video content.
*   **🌍 Multi-Language Support**: Generate summaries in **English, Turkish, French, German, and Spanish**.
*   **📄 Professional PDF Export**: improved PDF engine generates clean, formatted documents with cover pages, headers, table of contents-style structure, and proper typography (Times New Roman).
*   **⚡ Fast & Lightweight**: Rebuilt from scratch using Vue.js 3 and Vite for instant load times and smooth performance.
*   **🎨 Modern UI**: A beautiful, responsive interface featuring glassmorphism, dark/light mode, and smooth animations.
*   **🔍 Smart Validation**: Automatically checks if videos are public and valid before processing.

## 🛠️ How It Works

1.  **Input**: You paste one or more YouTube video URLs.
2.  **Validation**: The app verifies the video exists and is public.
3.  **AI Processing**: 
    *   The app sends a prompt to Google Gemini with the video context.
    *   Gemini (via Google Search grounding) finds the transcript and relevant details.
    *   It synthesizes a structured summary based on your selected length (Short, Medium, Comprehensive).
4.  **PDF Generation**: The app formats the Markdown summary into a PDF using a custom rendering engine.

---

## 🚀 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or newer)
*   A **Google Gemini API Key** (Get one for free at [Google AI Studio](https://aistudio.google.com/))

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/MundaneMann1776/YouTube-PDF-Summary-Tool.git
    cd YouTube-PDF-Summary-Tool
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The app will open at `http://localhost:5173`.

4.  **Build for Production**
    ```bash
    npm run build
    ```

---

## 🔒 Privacy & Security

**Your privacy is paramount.**

*   **Local Storage**: Your Google Gemini API Key is stored **only** in your browser's LocalStorage.
*   **Direct Connection**: The app communicates directly from your browser to Google's AI servers. Your API key and data **never** pass through any intermediate server or backend owned by me.
*   **Open Source**: The code is fully open-source, so you can verify exactly how your data is handled.

---

## 💻 Tech Stack

*   **Framework**: [Vue.js 3](https://vuejs.org/) (Composition API, Script Setup)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **AI Model**: [Google Gemini](https://deepmind.google/technologies/gemini/) (via `@google/genai` SDK)
*   **PDF Engine**: [jsPDF](https://github.com/parallax/jsPDF)
*   **Icons**: Hand-crafted SVG components

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).