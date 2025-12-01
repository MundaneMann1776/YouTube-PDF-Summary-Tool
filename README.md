# **Video**_**to_PDF**

Video to PDF summarizer project (Desktop App v0.5)

Transform YouTube videos into detailed, professional PDF summaries using the power of Google Gemini. Now available as a standalone desktop application for macOS and Windows with multi-language support.

Here is what this tool does:

1. AI Summarization : uses Google Gemini to analyze video content in 5 languages (EN, TR, FR, DE, ES)

2. PDF Generation : creates professional APA-style PDF documents

3. Smart Search : finds transcripts or synthesizes summaries from web data

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
4. Run the desktop app (Development)
	- `npm run electron:dev`
5. Build for Production
    - `npm run electron:build` (Creates an installer in `dist/`)

## **How the code works:**
For Frontend: React with TypeScript and Tailwind CSS for a responsive UI.

For Desktop Wrapper: Uses **Electron** to run the web app as a native desktop application.

For Backend: Uses Google Gemini API directly from the client. **Privacy Focused:** Your API key is stored locally on your machine and never sent to any third-party server.

I've used Google's new Antigravity extensively for this project, and I must say even though this is my first time ever building a desktop app, it was so much fun. Please be patient with me, and let me know if you have any questions or suggestions.
