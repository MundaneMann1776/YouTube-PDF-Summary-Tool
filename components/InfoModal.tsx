import React from 'react';
import { XMarkIcon, VideoIcon, CheckCircleIcon } from './IconComponents';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, theme }) => {
  if (!isOpen) return null;

  const steps = [
    { title: "Paste URL", desc: "Input any public YouTube link." },
    { title: "AI Analysis", desc: "Gemini AI watches and analyzes the content." },
    { title: "Get Summary", desc: "Receive a detailed summary in seconds." },
    { title: "Export PDF", desc: "Download for offline reading." }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-fast p-4"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all ${theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 text-center border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <VideoIcon className="w-6 h-6 text-red-500" />
          </div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Video to PDF
          </h2>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            AI-Powered Video Summarizer
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {steps.map((step, idx) => (
              <div key={idx} className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <div className="text-xs font-bold text-red-500 mb-1">0{idx + 1}</div>
                <div className={`font-semibold text-sm mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  {step.title}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {step.desc}
                </div>
              </div>
            ))}
          </div>

          <div className={`text-xs text-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            <p>Powered by Google Gemini 2.5 Flash Lite</p>
            <p className="mt-1">Version 0.4 • Free & Open Source</p>
          </div>
        </div>

        {/* Close Button */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-800 bg-gray-800/30' : 'border-gray-100 bg-gray-50'}`}>
          <button
            onClick={onClose}
            className={`w-full py-2.5 rounded-xl font-medium transition-colors ${theme === 'dark'
              ? 'bg-white text-black hover:bg-gray-200'
              : 'bg-black text-white hover:bg-gray-800'
              }`}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;

