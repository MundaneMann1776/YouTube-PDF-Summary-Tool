import { GoogleGenAI } from "@google/genai";
import { SummaryLength } from "../types";


const getLengthInstruction = (length: SummaryLength): string => {
    switch (length) {
        case 'short':
            return "Generate a concise summary (approx. 150-250 words). Structure it with a clear Introduction, Main Points, and Conclusion.";
        case 'medium':
            return "Generate a detailed summary (approx. 400-750 words). Follow APA-style structure: Introduction (thesis/topic), Body Paragraphs (detailed evidence/examples), and Conclusion. Use clear subheadings.";
        case 'comprehensive':
            return "Generate an extensive, in-depth summary (1000+ words). Follow a strict APA-style structure: Abstract/Introduction, Detailed Body Sections with specific examples/chronology, and a Conclusion. Use multiple levels of subheadings to organize the content effectively.";
        default:
            return "Generate a standard summary.";
    }
};

export const analyzeVideo = async (videoUrl: string, videoTitle: string, summaryLength: SummaryLength): Promise<string> => {
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
        throw new Error("API_KEY environment variable not set. Please create a .env.local file with your GEMINI_API_KEY.");
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const lengthInstruction = getLengthInstruction(summaryLength);

    const prompt = `
    You are an intelligent video analyst. Your task is to generate a **comprehensive, detailed summary** of the specific content of the YouTube video titled "${videoTitle}" (${videoUrl}).

    **Goal:** The user wants to know exactly what happens in the video, as if they watched it themselves. Do NOT just summarize the video's description or topic.

    **Instructions:**
    1.  **Find the Content:** Use the Google Search tool to find the **transcript**, **subtitles**, or a **detailed play-by-play** of the video. Search for terms like "transcript of ${videoTitle}", "summary of ${videoTitle} video", or "${videoTitle} key points".
    2.  **Extract & Synthesize:**
        *   **Priority:** Use a transcript or detailed breakdown if available.
        *   **Fallback:** If a full transcript is NOT found, you MUST synthesize a comprehensive summary by combining information from multiple search results (reviews, articles, descriptions, comments). **Do not refuse** to generate a summary just because a full transcript is missing.
    3.  **Maximize Detail:**
        *   Expand on every available point.
        *   Include specific examples, arguments, and context found in the search results.
        *   If the exact chronological order is unclear, organize by key themes or topics.
    4.  **Format:** "${lengthInstruction}"
        *   Use clear headings and bullet points.
        *   **Crucial:** Ensure the summary reflects the *actual spoken and visual content* of the video, not just its title or premise.

    **Output Format:**
    Return the summary directly in **Markdown** format. Do NOT wrap it in JSON or code blocks.

    **Fallback (Only use if ZERO information is found):**
    If you absolutely cannot find *any* relevant information (no reviews, no description, no context) after searching, return exactly this text:
    "The AI could not find enough information to generate a summary. This often happens with very new, obscure, or restricted videos. Please try again later."
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const responseText = response.text;

        if (!responseText) {
            throw new Error("AI model returned an empty response.");
        }

        const failMessage = "The AI could not find enough information to generate a summary.";
        if (responseText.includes(failMessage)) {
            throw new Error(responseText);
        }

        // Clean up any potential markdown code blocks if the model adds them despite instructions
        return responseText.replace(/^```markdown\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim();

    } catch (error) {
        console.error("Error analyzing video with Gemini:", error);

        if (error instanceof Error && (error.message.startsWith("The AI could not find enough information") || error.message.startsWith("AI model returned"))) {
            throw error;
        }

        const originalErrorMsg = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to analyze video. Details: ${originalErrorMsg}`);
    }
};