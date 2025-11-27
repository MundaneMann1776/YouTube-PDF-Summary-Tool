# **Video**_**to_PDF**

Video to PDF summarizer project

Transform YouTube videos into detailed, professional PDF summaries using the power of Google Gemini 2.5 Flash Lite.

Here is what this tool does:

1. AI Summarization : uses Gemini 2.5 Flash Lite to analyze video content

2. PDF Generation : creates professional APA-style PDF documents

3. Smart Search : finds transcripts or synthesizes summaries from web data

## **Building Requirements:**

1. [Node.js](https://nodejs.org/) (v18 or newer)

2. [NPM](https://www.npmjs.com/)

3. Google Gemini API Key

## **Build Instructions:**

1. Clone the repository:
	-  `git clone https://github.com/MundaneMann1776/YouTube-PDF-Summary-Tool.git`
2. CD into the newly cloned directory
	- `cd ./YouTube-PDF-Summary-Tool`
3. Install dependencies
	- `npm install`
4. Configure Environment
	- Create a `.env.local` file
	- Add your API key: `VITE_GEMINI_API_KEY=your_key_here`
5. Run the development server
	- `npm run dev`
6. Open the app
	- The app will be available at `http://localhost:5173`

## **How the code works:**
for Frontend: simple, React with TypeScript and Tailwind CSS for a responsive UI.

for Backend: uses Google Gemini API directly from the client (securely via env vars) to process video data and generate summaries, then uses jsPDF to render the PDF client-side.

should work with necessary dependencies installed!

LMK if you would like an in-depth explanation of how the code works aswell :)
