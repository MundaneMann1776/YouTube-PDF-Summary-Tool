# **Video**_**to_PDF**

Video to PDF summarizer project (Vue.js v0.6)

Transform YouTube videos into detailed, professional PDF summaries using the power of Google Gemini. Now rebuilt as a fast and lightweight Vue.js 3 application with multi-language support.

**[🌐 Try the Web Version (Live Demo)](https://ytvideosummary.netlify.app)**

Here is what this tool does:

1. **AI Summarization**: Uses Google Gemini to analyze video content in 5 languages (EN, TR, FR, DE, ES)
2. **PDF Generation**: Creates professional APA-style PDF documents
3. **Smart Search**: Finds transcripts or synthesizes summaries from web data

## **Building Requirements:**

1. [Node.js](https://nodejs.org/) (v18 or newer)
2. [NPM](https://www.npmjs.com/)
3. Google Gemini API Key (entered in the app settings)

## **Build Instructions:**

1. Clone the repository:
	-  `git clone https://github.com/MundaneMann1776/YouTube-PDF-Summary-Tool.git`
2. CD into the newly cloned directory
	- `cd ./YouTube-PDF-Summary-Tool`
3. Install dependencies
	- `npm install`
4. Run the development server
	- `npm run dev`
5. Build for Production
    - `npm run build` (Creates static files in `dist/`)
    - `npm run preview` (Preview the production build)

## **Tech Stack:**

*   **Frontend**: Vue.js 3 (Composition API), TypeScript
*   **Styling**: Tailwind CSS
*   **Build Tool**: Vite
*   **AI Integration**: Google Gemini API (@google/genai)
*   **PDF Generation**: jsPDF

## **Privacy:**
**Privacy Focused:** Your API key is stored locally on your machine (browser LocalStorage) and never sent to any third-party server besides Google's AI endpoint.

I've used Google's new Antigravity extensively for this project. Please be patient with me, and let me know if you have any questions or suggestions.