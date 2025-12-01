import React, { useState, useRef, useEffect } from 'react';
import { VideoAnalysis, AnalysisStatus, SummaryLength } from './types';
import { analyzeVideo } from './services/geminiService';
import { generatePdf } from './services/pdfService';
import { validateVideoExists } from './services/youtubeService';
import { VideoIcon, DownloadIcon, SpinnerIcon, CheckCircleIcon, ExclamationCircleIcon, RetryIcon, ChevronDownIcon, SunIcon, MoonIcon, TrashIcon, InformationCircleIcon, SettingsIcon } from './components/IconComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from './i18n/LanguageContext';
import { Language } from './i18n/translations';
import InfoModal from './components/InfoModal';
import ApiKeyModal from './components/ApiKeyModal';

// Since Cog6ToothIcon is not in IconComponents, I will add a simple SettingsIcon to IconComponents first or just use a placeholder SVG in the button.
// Let's check IconComponents first. I'll stick to adding the import and using a raw SVG if needed or update IconComponents.
// For now, I'll assume I can add a Settings icon to IconComponents or just inline it.
// Let's just inline a settings icon for simplicity in the button.

const App: React.FC = () => {
  const [linksInput, setLinksInput] = useState<string>('');
  const [videoAnalyses, setVideoAnalyses] = useState<VideoAnalysis[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string>('');
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('medium');
  const [showFeatures, setShowFeatures] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [pdfGeneratingId, setPdfGeneratingId] = useState<string | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');

  useEffect(() => {
    const storedKey = localStorage.getItem('GEMINI_API_KEY');
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      // Prompt for key if not found
      setIsApiKeyModalOpen(true);
    }

    const storedModel = localStorage.getItem('GEMINI_MODEL');
    if (storedModel) {
      setSelectedModel(storedModel);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('GEMINI_API_KEY', key);
  };

  const handleSaveModel = (model: string) => {
    setSelectedModel(model);
    localStorage.setItem('GEMINI_MODEL', model);
  };

  const isCancelledRef = useRef<boolean>(false);

  useEffect(() => {
    const stillProcessing = videoAnalyses.some(
      (a) => a.status === AnalysisStatus.Processing || a.status === AnalysisStatus.Pending
    );
    setIsProcessing(stillProcessing);
  }, [videoAnalyses]);

  const features = [
    { title: "AI-Powered Summarization", description: "Utilizes Google's powerful Gemini model to generate accurate and detailed summaries of video content." },
    { title: "Customizable Summary Length", description: "Choose between short, medium, or comprehensive summaries to get the level of detail you need." },
    { title: "Batch Processing", description: "Analyze multiple videos at once with real-time status updates for each link." },
    { title: "Downloadable PDFs", description: "Easily save and share your video summaries by downloading them as neatly formatted PDF files." },
    { title: "Smart URL Validation", description: "Instantly verifies if your YouTube links are valid and public, saving you time before processing." },
    { title: "Robust Error Handling", description: "Get clear feedback on any issues and easily retry failed analyses with a single click." }
  ];

  const isValidYoutubeUrl = (url: string): boolean => {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return pattern.test(url);
  };

  const handleStop = () => {
    isCancelledRef.current = true;
    setVideoAnalyses(prev =>
      prev.map(a =>
        a.status === AnalysisStatus.Processing || a.status === AnalysisStatus.Pending
          ? { ...a, status: AnalysisStatus.Error, error: 'Analysis cancelled by user.' }
          : a
      )
    );
  };

  const handleRetry = async (videoId: string) => {
    isCancelledRef.current = false;
    setGlobalError('');

    const analysisToRetry = videoAnalyses.find(a => a.id === videoId);
    if (!analysisToRetry) {
      return;
    }

    // Set the specific item to processing
    setVideoAnalyses(prev => prev.map(a =>
      a.id === videoId ? { ...a, status: AnalysisStatus.Processing, error: undefined } : a
    ));

    if (!apiKey) {
      setVideoAnalyses(prev => prev.map(a =>
        a.id === videoId ? { ...a, status: AnalysisStatus.Error, error: "API Key is missing. Please check settings." } : a
      ));
      setIsApiKeyModalOpen(true);
      return;
    }

    try {
      // Step 1: Re-validate video existence and get title
      const validationResult = await validateVideoExists(analysisToRetry.url);
      if (isCancelledRef.current) throw new Error('Analysis cancelled by user.');

      if (!validationResult.isValid) {
        throw new Error(validationResult.error || 'An unknown validation error occurred.');
      }

      const videoTitle = validationResult.title!;
      setVideoAnalyses(prev => prev.map(a => a.id === videoId ? { ...a, title: videoTitle } : a));

      // Step 2: Process the video
      const summary = await analyzeVideo(analysisToRetry.url, videoTitle, analysisToRetry.summaryLength, apiKey, selectedModel);
      if (isCancelledRef.current) throw new Error('Analysis cancelled by user.');

      // Success
      setVideoAnalyses(prev => prev.map(a =>
        a.id === videoId ? { ...a, status: AnalysisStatus.Success, summary, title: videoTitle } : a
      ));

    } catch (error) {
      if (!isCancelledRef.current) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        setVideoAnalyses(prev => prev.map(a =>
          a.id === videoId ? { ...a, status: AnalysisStatus.Error, error: errorMessage } : a
        ));
      }
    }
  };

  const handleAnalysis = async () => {
    setGlobalError('');
    isCancelledRef.current = false;
    const urls = linksInput.split('\n').map(link => link.trim()).filter(link => link);
    const invalidUrlFormat = urls.filter(url => !isValidYoutubeUrl(url));

    if (invalidUrlFormat.length > 0) {
      setGlobalError(`Invalid YouTube URL format detected:\n${invalidUrlFormat.join('\n')}`);
      return;
    }

    if (urls.length === 0) {
      setGlobalError("Please enter at least one YouTube URL.");
      return;
    }

    if (!apiKey) {
      setGlobalError("API Key is missing. Please enter your Google Gemini API Key in the settings.");
      setIsApiKeyModalOpen(true);
      return;
    }

    const initialAnalyses: VideoAnalysis[] = urls.map(url => ({
      id: self.crypto.randomUUID(),
      url,
      status: AnalysisStatus.Pending,
      summaryLength,
    }));
    setVideoAnalyses(initialAnalyses);

    // Step 1: Validate video existence and get title
    const validationPromises = initialAnalyses.map(async (analysis) => {
      const validationResult = await validateVideoExists(analysis.url);
      if (isCancelledRef.current) return analysis;

      if (!validationResult.isValid) {
        return {
          ...analysis,
          status: AnalysisStatus.Error,
          error: validationResult.error || 'An unknown validation error occurred.'
        };
      }
      return { ...analysis, title: validationResult.title }; // Keep as pending, add title
    });

    const validatedAnalyses = await Promise.all(validationPromises);
    setVideoAnalyses(validatedAnalyses);

    if (isCancelledRef.current) {
      handleStop();
      return;
    }

    const analysesToProcess = validatedAnalyses.filter(a => a.status === AnalysisStatus.Pending);

    // Step 2: Process valid videos
    for (const analysis of analysesToProcess) {
      if (isCancelledRef.current) {
        break;
      }

      setVideoAnalyses(prev => prev.map(a => a.id === analysis.id ? { ...a, status: AnalysisStatus.Processing } : a));

      try {
        // Pass the validated title to the analysis function for better context
        const summary = await analyzeVideo(analysis.url, analysis.title!, analysis.summaryLength, apiKey, selectedModel, language);
        if (isCancelledRef.current) break;
        setVideoAnalyses(prev => prev.map(a => a.id === analysis.id ? { ...a, status: AnalysisStatus.Success, summary } : a));
      } catch (error) {
        if (isCancelledRef.current) break;
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        setVideoAnalyses(prev => prev.map(a => a.id === analysis.id ? { ...a, status: AnalysisStatus.Error, error: errorMessage } : a));
      }
    }

    if (isCancelledRef.current) {
      handleStop();
    }
  };

  const handleClearAll = () => {
    setLinksInput('');
    setVideoAnalyses([]);
    setGlobalError('');
  };

  // Progress calculation
  const totalVideos = videoAnalyses.length;
  const processedVideos = videoAnalyses.filter(a => a.status === AnalysisStatus.Success || a.status === AnalysisStatus.Error).length;
  const progress = totalVideos > 0 ? (processedVideos / totalVideos) * 100 : 0;

  const StatusIndicator: React.FC<{ status: AnalysisStatus }> = ({ status }) => {
    switch (status) {
      case AnalysisStatus.Processing:
        return <div className="flex items-center gap-2 text-blue-500"><SpinnerIcon className="w-5 h-5" /> Processing...</div>;
      case AnalysisStatus.Success:
        return <div className="flex items-center gap-2 text-green-500"><CheckCircleIcon className="w-5 h-5" /> Success</div>;
      case AnalysisStatus.Error:
        return <div className="flex items-center gap-2 text-red-500"><ExclamationCircleIcon className="w-5 h-5" /> Error</div>;
      case AnalysisStatus.Pending:
      default:
        return <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Pending</div>;
    }
  };

  const { t, language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', label: 'Español', flag: '🇪🇸' }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'} font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8 transition-colors duration-300`}>
      <div className="w-full max-w-4xl mx-auto relative">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`absolute top-4 right-4 flex items-center gap-1 p-1.5 rounded-full border shadow-lg backdrop-blur-md z-50 ${theme === 'dark'
            ? 'bg-gray-800/40 border-gray-700/50 shadow-black/20'
            : 'bg-white/40 border-white/50 shadow-gray-200/50'
            }`}
        >
          {/* Language Selector */}
          <div className="relative group">
            <button className={`p-2 rounded-full transition-colors duration-200 focus:outline-none flex items-center justify-center w-9 h-9 text-lg ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'
              }`}>
              {languages.find(l => l.code === language)?.flag}
            </button>

            <div className={`absolute right-0 top-full mt-2 w-32 py-1 rounded-xl shadow-xl border backdrop-blur-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right ${theme === 'dark'
              ? 'bg-gray-800/90 border-gray-700'
              : 'bg-white/90 border-gray-200'
              }`}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${language === lang.code
                    ? theme === 'dark' ? 'text-white font-bold' : 'text-black font-bold'
                    : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={`w-px h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300/50'}`} />

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsInfoModalOpen(true)}
            className={`p-2 rounded-full transition-colors duration-200 focus:outline-none ${theme === 'dark'
              ? 'text-gray-300 hover:bg-white/10'
              : 'text-gray-600 hover:bg-black/5'
              }`}
            aria-label="About this application"
          >
            <InformationCircleIcon className="w-5 h-5" />
          </motion.button>

          <div className={`w-px h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300/50'}`} />

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-full transition-colors duration-200 focus:outline-none ${theme === 'dark'
              ? 'text-yellow-300 hover:bg-white/10'
              : 'text-blue-500 hover:bg-black/5'
              }`}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          <div className={`w-px h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300/50'}`} />

          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsApiKeyModalOpen(true)}
            className={`p-2 rounded-full transition-colors duration-200 focus:outline-none ${theme === 'dark'
              ? 'text-gray-300 hover:bg-white/10'
              : 'text-gray-600 hover:bg-black/5'
              }`}
            aria-label="Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </motion.button>
        </motion.div>

        <header className="text-center mb-8 pt-8">
          <div className="flex justify-center items-center gap-4 mb-2">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-400 rounded-full blur opacity-40 animate-pulse"></div>
              <VideoIcon className="w-16 h-16 text-red-500 relative z-10 drop-shadow-2xl" />
            </div>
          </div>
          <h1 className={`text-5xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r ${theme === 'dark' ? 'from-white to-gray-400' : 'from-gray-900 to-gray-600'}`}>
            {t.appTitle}
          </h1>
          <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t.appSubtitle}
          </p>
        </header>

        <main>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`rounded-2xl p-8 backdrop-blur-xl shadow-2xl ${theme === 'dark'
              ? 'bg-gray-800/40 border border-gray-700/50 shadow-black/20'
              : 'bg-white/60 border border-white/50 shadow-xl shadow-blue-100/20'
              }`}
          >
            <label htmlFor="video-links" className={`block text-lg font-medium mb-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t.inputLabel}
            </label>
            <div className="relative">
              <textarea
                id="video-links"
                value={linksInput}
                onChange={(e) => setLinksInput(e.target.value)}
                placeholder={t.inputPlaceholder}
                className={`w-full h-40 p-4 rounded-xl border transition-all duration-200 resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${theme === 'dark'
                  ? 'bg-gray-900/50 border-gray-700 focus:border-red-500/50 focus:ring-red-500 text-gray-200 placeholder-gray-600'
                  : 'bg-white/50 border-gray-200 focus:border-blue-500/50 focus:ring-blue-500 text-gray-900 placeholder-gray-400'
                  }`}
                disabled={isProcessing}
              />
            </div>

            <div className="flex justify-between items-start mt-3">
              <p className="text-xs text-gray-500">{t.enterUrlHint}</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-yellow-500/80' : 'text-yellow-600/80'}`}>
                {t.publicVideoHint}
              </p>
            </div>

            <div className="mt-8">
              <label className={`block text-sm font-medium mb-3 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t.summaryLength}
              </label>
              <div className={`flex p-1 rounded-xl ${theme === 'dark' ? 'bg-gray-900/30 border border-gray-700/50' : 'bg-gray-100/50 border border-gray-200/50'}`}>
                {(['short', 'medium', 'comprehensive'] as SummaryLength[]).map(length => (
                  <button
                    key={length}
                    onClick={() => setSummaryLength(length)}
                    disabled={isProcessing}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${summaryLength === length
                      ? theme === 'dark'
                        ? 'bg-gray-700 text-white shadow-sm'
                        : 'bg-white text-gray-900 shadow-sm'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                      }`}
                  >
                    {t.lengths[length]}
                  </button>
                ))}
              </div>
            </div>

            {globalError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-xl border flex gap-3 items-start ${theme === 'dark' ? 'bg-red-900/20 border-red-800/50 text-red-200' : 'bg-red-50 border-red-100 text-red-700'
                  }`}
              >
                <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm whitespace-pre-wrap">{globalError}</span>
              </motion.div>
            )}

            <div className="mt-8">
              {!isProcessing ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAnalysis}
                  className={`w-full py-4 px-6 flex items-center justify-center gap-3 rounded-xl font-bold text-white shadow-lg transition-all duration-200 ${theme === 'dark'
                    ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-red-900/20'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-blue-200/50'
                    }`}
                >
                  <VideoIcon className="w-5 h-5" />
                  {t.generateBtn}
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStop}
                  className={`w-full py-4 px-6 flex items-center justify-center gap-3 rounded-xl font-bold text-white shadow-lg transition-all duration-200 ${theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                >
                  <SpinnerIcon className="w-5 h-5" />
                  {t.stopBtn}
                </motion.button>
              )}
            </div>
          </motion.div>


          {videoAnalyses.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Results</h2>
                {!isProcessing && (
                  <button
                    onClick={handleClearAll}
                    className={`p-2 rounded-lg transition-colors duration-200 border ${theme === 'dark'
                      ? 'border-gray-600 text-gray-400 hover:bg-gray-700 hover:border-gray-500'
                      : 'border-gray-300 text-gray-500 hover:bg-gray-100 hover:border-gray-400'
                      }`}
                    aria-label="Clear all results"
                    title="Clear all results"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {videoAnalyses.map(({ id, url, status, title, summary, error }) => {
                  const isGeneratingPdf = pdfGeneratingId === id;
                  return (
                    <div key={id} className={`rounded-lg p-4 border transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>{title || url}</p>
                          <p className="text-xs text-gray-500 truncate">{title ? url : ''}</p>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div className="w-36">
                            <StatusIndicator status={status} />
                          </div>
                          {status === AnalysisStatus.Error ? (
                            <button
                              onClick={() => handleRetry(id)}
                              disabled={isProcessing}
                              className={`flex items-center justify-center gap-2 w-[140px] py-2 px-4 bg-yellow-600 hover:bg-yellow-700 rounded-md text-sm font-medium transition-colors ${theme === 'dark' ? 'disabled:bg-gray-800 disabled:text-gray-500' : 'disabled:bg-gray-200 disabled:text-gray-400'} disabled:cursor-not-allowed`}
                            >
                              <RetryIcon className="w-4 h-4" />
                              Retry Analysis
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setPdfGeneratingId(id);
                                setTimeout(() => {
                                  generatePdf(title!, summary!)
                                    .catch(err => console.error("PDF generation failed:", err))
                                    .finally(() => setPdfGeneratingId(null));
                                }, 10);
                              }}
                              disabled={status !== AnalysisStatus.Success || isGeneratingPdf}
                              className={`flex items-center justify-center gap-2 w-[140px] py-2 px-4 rounded-md text-sm font-medium transition-colors ${isGeneratingPdf
                                ? (theme === 'dark' ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500')
                                : (theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500' : 'bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400')
                                } disabled:cursor-not-allowed`}
                            >
                              {isGeneratingPdf ? (
                                <>
                                  <SpinnerIcon className="w-4 h-4" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <DownloadIcon className="w-4 h-4" />
                                  Download PDF
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      {status === AnalysisStatus.Error && (
                        <p className={`mt-2 text-sm p-2 rounded-md ${theme === 'dark' ? 'text-red-400 bg-red-900/30' : 'text-red-700 bg-red-100'}`}>{error}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </main>
      </div>
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        theme={theme}
      />
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onSave={handleSaveApiKey}
        onClose={() => setIsApiKeyModalOpen(false)}
        initialKey={apiKey}
        theme={theme}
        selectedModel={selectedModel}
        onModelChange={handleSaveModel}
      />
    </div>
  );
};

export default App;