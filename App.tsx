import React, { useState, useRef, useEffect } from 'react';
import { VideoAnalysis, AnalysisStatus, SummaryLength } from './types';
import { analyzeVideo } from './services/geminiService';
import { generatePdf } from './services/pdfService';
import { validateVideoExists } from './services/youtubeService';
import { VideoIcon, DownloadIcon, SpinnerIcon, CheckCircleIcon, ExclamationCircleIcon, RetryIcon, ChevronDownIcon, SunIcon, MoonIcon, TrashIcon, InformationCircleIcon } from './components/IconComponents';
import InfoModal from './components/InfoModal';

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
      const summary = await analyzeVideo(analysisToRetry.url, videoTitle, analysisToRetry.summaryLength);
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
        const summary = await analyzeVideo(analysis.url, analysis.title!, analysis.summaryLength);
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

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'} font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8 transition-colors duration-300`}>
      <div className="w-full max-w-4xl mx-auto relative">
        <div className="absolute top-0 right-0 flex items-center gap-2">
          <button
            onClick={() => setIsInfoModalOpen(true)}
            className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 ${theme === 'dark'
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 focus:ring-offset-gray-900'
              : 'bg-white/80 hover:bg-gray-100 text-gray-600 focus:ring-offset-gray-50'
              }`}
            aria-label="About this application"
          >
            <InformationCircleIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 ${theme === 'dark'
              ? 'bg-gray-800 hover:bg-gray-700 text-yellow-300 focus:ring-offset-gray-900'
              : 'bg-white/80 hover:bg-gray-100 text-blue-500 focus:ring-offset-gray-50'
              }`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
          </button>
        </div>

        <header className="text-center mb-8 pt-8">
          <div className="flex justify-center items-center gap-4 mb-2">
            <VideoIcon className="w-10 h-10 text-red-500" />
            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-400">
              Video to PDF
            </h1>
          </div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Paste YouTube links to get AI-powered summaries as downloadable PDFs.
          </p>
        </header>

        <main>
          <div className={`rounded-lg p-6 backdrop-blur-sm ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/60 border border-gray-200 shadow-lg'}`}>
            <label htmlFor="video-links" className={`block text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              YouTube Video Links
            </label>
            <textarea
              id="video-links"
              value={linksInput}
              onChange={(e) => setLinksInput(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=...\nhttps://youtu.be/..."
              className={`w-full h-36 p-3 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 resize-none ${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-gray-200 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
              disabled={isProcessing}
            />
            <p className="text-sm text-gray-500 mt-2">Enter one URL per line.</p>
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-yellow-500/80' : 'text-yellow-600/90'}`}>
              Note: This tool relies on public video data. Unlisted or private videos cannot be analyzed.
            </p>

            <div className="mt-6">
              <label className={`block text-sm font-medium mb-2 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Summary Length
              </label>
              <div className="flex justify-center gap-2">
                {(['short', 'medium', 'comprehensive'] as SummaryLength[]).map(length => (
                  <button
                    key={length}
                    onClick={() => setSummaryLength(length)}
                    disabled={isProcessing}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 capitalize border ${summaryLength === length
                      ? 'bg-red-600 border-red-600 text-white'
                      : theme === 'dark'
                        ? 'bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                        : 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {length}
                  </button>
                ))}
              </div>
            </div>

            {globalError && (
              <div className={`mt-4 p-3 border rounded-md whitespace-pre-wrap ${theme === 'dark' ? 'bg-red-900/50 border-red-700 text-red-300' : 'bg-red-100 border-red-300 text-red-800'}`}>
                {globalError}
              </div>
            )}



            <div className="mt-6 flex items-center gap-4">
              {!isProcessing ? (
                <button
                  onClick={handleAnalysis}
                  className={`w-full py-3 px-4 flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 ${theme === 'dark' ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-gray-50'}`}
                >
                  Generate Summaries
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className={`w-full py-3 px-4 flex items-center justify-center gap-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 ${theme === 'dark' ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-gray-50'}`}
                >
                  Stop Analysis
                </button>
              )}
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => setShowFeatures(!showFeatures)}
              className={`w-full flex justify-between items-center text-left p-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700 hover:bg-gray-700/60 focus:ring-offset-gray-900' : 'bg-white/60 border border-gray-200 hover:bg-gray-100/80 shadow-md focus:ring-offset-gray-50'}`}
              aria-expanded={showFeatures}
            >
              <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>Key Features</span>
              <ChevronDownIcon className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} transition-transform duration-300 ${showFeatures ? 'rotate-180' : ''}`} />
            </button>
            {showFeatures && (
              <div className={`mt-2 p-6 border rounded-lg animate-fade-in ${theme === 'dark' ? 'bg-gray-800/30 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
                <ul className="space-y-4">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <CheckCircleIcon className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className={`font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{feature.title}</h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{feature.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

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
                                  try {
                                    generatePdf(title!, summary!);
                                  } finally {
                                    setPdfGeneratingId(null);
                                  }
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
    </div>
  );
};

export default App;