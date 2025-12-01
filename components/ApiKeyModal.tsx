import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon } from './IconComponents';
import { useLanguage } from '../i18n/LanguageContext';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (key: string) => void;
    theme: 'light' | 'dark';
    selectedModel?: string;
    onModelChange?: (model: string) => void;
    initialKey?: string;
}

const MODELS = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Recommended)' },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-flash-latest', name: 'Gemini Flash Latest' },
    { id: 'gemini-flash-lite-latest', name: 'Gemini Flash-Lite Latest' },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash-Lite' },
];

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, theme, selectedModel = 'gemini-2.5-flash', onModelChange, initialKey = '' }) => {
    const { t } = useLanguage();
    const [key, setKey] = useState(initialKey);
    const [error, setError] = useState('');

    useEffect(() => {
        setKey(initialKey);
    }, [initialKey]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!key.trim()) {
            setError(t.settings.apiKeyEmptyError);
            return;
        }
        onSave(key.trim());
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`w-full max-w-md p-6 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {t.settings.title}
                    </h2>
                    <button onClick={onClose} className={`p-1 rounded-full hover:bg-opacity-10 ${theme === 'dark' ? 'hover:bg-white text-gray-400' : 'hover:bg-black text-gray-500'}`}>
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Model Selection */}
                    {onModelChange && (
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t.settings.modelLabel}
                            </label>
                            <select
                                value={selectedModel}
                                onChange={(e) => onModelChange(e.target.value)}
                                className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none transition-all ${theme === 'dark'
                                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                    }`}
                            >
                                {MODELS.map(model => (
                                    <option key={model.id} value={model.id}>{model.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* API Key Input */}
                    <div>
                        <label htmlFor="apiKey" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t.settings.apiKeyLabel}
                        </label>
                        <input
                            type="password"
                            id="apiKey"
                            value={key}
                            onChange={(e) => {
                                setKey(e.target.value);
                                setError('');
                            }}
                            placeholder={t.settings.apiKeyPlaceholder}
                            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none transition-all ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                        />
                        {error && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><ExclamationCircleIcon className="w-4 h-4" /> {error}</p>}
                        <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Your API Key is stored locally on your device and is never sent to me.
                        </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1"
                        >
                            {t.settings.getKeyLink} <span aria-hidden="true">&rarr;</span>
                        </a>
                    </div>
                </div>

                <div className={`p-6 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
                    <button
                        onClick={handleSave}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors shadow-lg flex items-center justify-center gap-2"
                    >
                        <CheckCircleIcon className="w-5 h-5" />
                        {t.buttons.save}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;
