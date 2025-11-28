import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon } from './IconComponents';

interface ApiKeyModalProps {
    isOpen: boolean;
    onSave: (apiKey: string) => void;
    onClose: () => void;
    initialKey?: string;
    theme: 'light' | 'dark';
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, onClose, initialKey = '', theme }) => {
    const [apiKey, setApiKey] = useState(initialKey);
    const [error, setError] = useState('');

    useEffect(() => {
        setApiKey(initialKey);
    }, [initialKey]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiKey.trim()) {
            setError('API Key cannot be empty');
            return;
        }
        onSave(apiKey.trim());
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`w-full max-w-md p-6 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
                <h2 className="text-2xl font-bold mb-4">Gemini API Key</h2>
                <p className={`mb-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    To use this application, you need to provide your own Google Gemini API Key.
                    The key is stored locally on your device.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="apiKey" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            API Key
                        </label>
                        <input
                            type="password"
                            id="apiKey"
                            value={apiKey}
                            onChange={(e) => {
                                setApiKey(e.target.value);
                                setError('');
                            }}
                            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none ${theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                }`}
                            placeholder="AIzaSy..."
                        />
                        {error && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><ExclamationCircleIcon className="w-4 h-4" /> {error}</p>}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${theme === 'dark'
                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                        >
                            Save Key
                        </button>
                    </div>
                </form>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1"
                    >
                        Get an API Key <span aria-hidden="true">&rarr;</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;
