<div align="center">
  <h1 align="center">Video to PDF Summarizer 🎥 -> 📄</h1>
  <p align="center">
    Transform YouTube videos into detailed, professional PDF summaries using the power of Google Gemini 2.5 Flash Lite.
  </p>
  <p align="center">
    ![Video to PDF UI](YOUR_SCREENSHOT_HERE.png)
  </p>
  <p align="center">
    > **Setup Instruction:** Please take a screenshot of the running application and save it as `screenshot.png` in this directory. Then update the link above to `![Video to PDF UI](screenshot.png)`.
  </p>
</div>

## 🚀 Features

- **AI-Powered Summarization**: Leverages the advanced capabilities of the Gemini model to generate accurate and insightful summaries.
- **Video to PDF**: Automatically formats and exports summaries into clean, professional PDF documents.
- **Batch Processing**: Queue multiple videos for analysis and process them sequentially.
- **Customizable Detail**: Choose between short, medium, or comprehensive summary lengths.
- **Smart Validation**: Automatically checks for valid, public YouTube URLs before processing.
- **Dark/Light Mode**: A responsive and accessible UI with theme support.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: TailwindCSS (via CDN), Vanilla CSS
- **AI**: Google Gemini API
- **PDF Generation**: jsPDF

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MundaneMann1776/Youtube-Video-Summarizer-Tool.git
   cd Youtube-Video-Summarizer-Tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env.local` file in the root directory and add your API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Run the Application**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
