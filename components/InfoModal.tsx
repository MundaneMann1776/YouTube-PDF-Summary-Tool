import React from 'react';
import { XMarkIcon } from './IconComponents';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, theme }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in-fast"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] p-6 sm:p-8 m-4 rounded-xl shadow-2xl border overflow-y-auto ${theme === 'dark'
            ? 'bg-gray-800 border-gray-700 text-gray-200'
            : 'bg-white border-gray-200 text-gray-800'
          }`}
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 ${theme === 'dark'
              ? 'text-gray-400 hover:bg-gray-700 focus:ring-offset-gray-800'
              : 'text-gray-500 hover:bg-gray-100 focus:ring-offset-white'
            }`}
          aria-label="Close modal"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-red-500">
          About This App
        </h2>

        <div className="space-y-8">
          <section>
            <h3 className={`text-xl font-semibold mb-3 border-b pb-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>How It Works</h3>
            <ol className={`list-decimal list-inside space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>
                <span className="font-semibold">Input & Validation:</span> You paste one or more public YouTube video URLs. The app first validates these links using a public oEmbed service to ensure they are valid and to retrieve the video titles.
              </li>
              <li>
                <span className="font-semibold">AI Analysis:</span> The validated video information is sent to Google's **Gemini 2.5 Flash Lite** model, optimized for speed and efficiency.
              </li>
              <li>
                <span className="font-semibold">Information Gathering:</span> The AI intelligently searches for the video's transcript. If a transcript isn't available, it synthesizes a summary from reputable reviews, articles, and descriptions found online.
              </li>
              <li>
                <span className="font-semibold">Summarization:</span> The AI synthesizes the gathered information into a coherent summary, tailored to the 'short', 'medium', or 'comprehensive' length you selected.
              </li>
              <li>
                <span className="font-semibold">PDF Generation:</span> You can download the final, formatted summary as a professional-looking PDF document for offline use.
              </li>
            </ol>
          </section>

          <section>
            <h3 className={`text-xl font-semibold mb-3 border-b pb-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>Limitations</h3>
            <ul className={`list-disc list-inside space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>The app cannot analyze private, unlisted, age-restricted, or members-only videos.</li>
              <li>Summary quality is highly dependent on the public availability of information. New, obscure, or non-English videos may yield limited or no results.</li>
              <li>The AI is powerful but not perfect. It may occasionally make mistakes or miss nuances from the video.</li>
            </ul>
          </section>

          <section>
            <h3 className={`text-xl font-semibold mb-3 border-b pb-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>Technology Stack</h3>
            <ul className={`list-disc list-inside space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <li><span className="font-semibold">AI Model:</span> Google Gemini 2.5 Flash Lite</li>
              <li><span className="font-semibold">Frontend:</span> React, TypeScript, Tailwind CSS</li>
              <li><span className="font-semibold">PDF Generation:</span> jsPDF</li>
              <li><span className="font-semibold">URL Validation:</span> noembed.com (oEmbed provider)</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;

