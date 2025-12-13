<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { type VideoAnalysis, AnalysisStatus, type SummaryLength } from './types';
import { analyzeVideo } from './services/geminiService';
import { generatePdf } from './services/pdfService';
import { validateVideoExists } from './services/youtubeService';
import { useLanguage } from './i18n/useLanguage';

// Icons
import VideoIcon from './components/icons/VideoIcon.vue';
import DownloadIcon from './components/icons/DownloadIcon.vue';
import SpinnerIcon from './components/icons/SpinnerIcon.vue';
import CheckCircleIcon from './components/icons/CheckCircleIcon.vue';
import ExclamationCircleIcon from './components/icons/ExclamationCircleIcon.vue';
import RetryIcon from './components/icons/RetryIcon.vue';
import SunIcon from './components/icons/SunIcon.vue';
import MoonIcon from './components/icons/MoonIcon.vue';
import TrashIcon from './components/icons/TrashIcon.vue';
import InformationCircleIcon from './components/icons/InformationCircleIcon.vue';
import SettingsIcon from './components/icons/SettingsIcon.vue';

// Components
import InfoModal from './components/InfoModal.vue';
import ApiKeyModal from './components/ApiKeyModal.vue';

const { t, language, setLanguage } = useLanguage();

// State
const linksInput = ref('');
const videoAnalyses = ref<VideoAnalysis[]>([]);
const isProcessing = ref(false);
const globalError = ref('');
const summaryLength = ref<SummaryLength>('medium');
const theme = ref<'light' | 'dark'>('dark');
const pdfGeneratingId = ref<string | null>(null);
const isInfoModalOpen = ref(false);
const isApiKeyModalOpen = ref(false);
const apiKey = ref('');
const selectedModel = ref('gemini-2.5-flash');
const showLangMenu = ref(false);

const isCancelledRef = ref(false);

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' }
] as const;

// Computed & Helpers
const isValidYoutubeUrl = (url: string): boolean => {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return pattern.test(url);
};

const getSummaryLengthClass = (length: string) => {
  const base = 'flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 capitalize flex items-center justify-center gap-2';
  const isSelected = summaryLength.value === length;
  const isDark = theme.value === 'dark';

  if (isSelected) {
    return [base, 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 transform scale-[1.02]'];
  } else {
    return [base, isDark 
      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200' 
      : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-gray-200'];
  }
};

// Lifecycle
onMounted(() => {
  const storedKey = localStorage.getItem('GEMINI_API_KEY');
  if (storedKey) {
    apiKey.value = storedKey;
  } else {
    setTimeout(() => { isApiKeyModalOpen.value = true; }, 500); // Delay slightly for effect
  }

  const storedModel = localStorage.getItem('GEMINI_MODEL');
  if (storedModel) {
    selectedModel.value = storedModel;
  }
});

watch(videoAnalyses, (newVal) => {
  const stillProcessing = newVal.some(
    (a) => a.status === AnalysisStatus.Processing || a.status === AnalysisStatus.Pending
  );
  isProcessing.value = stillProcessing;
}, { deep: true });

// Actions
const handleSaveApiKey = (key: string) => {
  apiKey.value = key;
  localStorage.setItem('GEMINI_API_KEY', key);
};

const handleSaveModel = (model: string) => {
  selectedModel.value = model;
  localStorage.setItem('GEMINI_MODEL', model);
};

const handleStop = () => {
  isCancelledRef.value = true;
  videoAnalyses.value = videoAnalyses.value.map(a =>
    a.status === AnalysisStatus.Processing || a.status === AnalysisStatus.Pending
      ? { ...a, status: AnalysisStatus.Error, error: 'Analysis cancelled by user.' }
      : a
  );
};

const handleRetry = async (videoId: string) => {
  isCancelledRef.value = false;
  globalError.value = '';

  const analysisIndex = videoAnalyses.value.findIndex(a => a.id === videoId);
  if (analysisIndex === -1) return;
  const analysisToRetry = videoAnalyses.value[analysisIndex];

  // Update status
  videoAnalyses.value[analysisIndex] = { ...analysisToRetry, status: AnalysisStatus.Processing, error: undefined };

  if (!apiKey.value) {
    videoAnalyses.value[analysisIndex].status = AnalysisStatus.Error;
    videoAnalyses.value[analysisIndex].error = "API Key is missing. Please check settings.";
    isApiKeyModalOpen.value = true;
    return;
  }

  try {
    const validationResult = await validateVideoExists(analysisToRetry.url);
    if (isCancelledRef.value) throw new Error('Analysis cancelled by user.');

    if (!validationResult.isValid) {
      throw new Error(validationResult.error || 'An unknown validation error occurred.');
    }

    const videoTitle = validationResult.title!;
    videoAnalyses.value[analysisIndex].title = videoTitle;

    const summary = await analyzeVideo(analysisToRetry.url, videoTitle, analysisToRetry.summaryLength, apiKey.value, selectedModel.value, language.value);
    
    if (isCancelledRef.value) throw new Error('Analysis cancelled by user.');

    videoAnalyses.value[analysisIndex] = {
        ...videoAnalyses.value[analysisIndex],
        status: AnalysisStatus.Success,
        summary,
        title: videoTitle
    };

  } catch (error: any) {
    if (!isCancelledRef.value) {
      videoAnalyses.value[analysisIndex].status = AnalysisStatus.Error;
      videoAnalyses.value[analysisIndex].error = error instanceof Error ? error.message : 'An unknown error occurred.';
    }
  }
};

const handleAnalysis = async () => {
  globalError.value = '';
  isCancelledRef.value = false;
  
  const urls = linksInput.value.split('\n').map(link => link.trim()).filter(link => link);
  const invalidUrlFormat = urls.filter(url => !isValidYoutubeUrl(url));

  if (invalidUrlFormat.length > 0) {
    globalError.value = `Invalid YouTube URL format detected:\n${invalidUrlFormat.join('\n')}`;
    return;
  }

  if (urls.length === 0) {
    globalError.value = "Please enter at least one YouTube URL.";
    return;
  }

  if (!apiKey.value) {
    globalError.value = "API Key is missing. Please enter your Google Gemini API Key in the settings.";
    isApiKeyModalOpen.value = true;
    return;
  }

  const initialAnalyses: VideoAnalysis[] = urls.map(url => ({
    id: crypto.randomUUID(),
    url,
    status: AnalysisStatus.Pending,
    summaryLength: summaryLength.value,
  }));
  videoAnalyses.value = initialAnalyses;

  // Step 1: Validate
  const validationPromises = initialAnalyses.map(async (analysis) => {
    const validationResult = await validateVideoExists(analysis.url);
    if (isCancelledRef.value) return analysis;

    if (!validationResult.isValid) {
        return {
            ...analysis,
            status: AnalysisStatus.Error,
            error: validationResult.error || 'An unknown validation error occurred.'
        };
    }
    return { ...analysis, title: validationResult.title };
  });

  const validatedAnalyses = await Promise.all(validationPromises);
  videoAnalyses.value = validatedAnalyses;

  if (isCancelledRef.value) {
    handleStop();
    return;
  }

  const analysesToProcess = validatedAnalyses.filter(a => a.status === AnalysisStatus.Pending);

  // Step 2: Process
  for (const analysis of analysesToProcess) {
    if (isCancelledRef.value) break;

    const idx = videoAnalyses.value.findIndex(a => a.id === analysis.id);
    if (idx !== -1) videoAnalyses.value[idx].status = AnalysisStatus.Processing;

    try {
        const summary = await analyzeVideo(analysis.url, analysis.title!, analysis.summaryLength, apiKey.value, selectedModel.value, language.value);
        if (isCancelledRef.value) break;
        
        const successIdx = videoAnalyses.value.findIndex(a => a.id === analysis.id);
        if (successIdx !== -1) {
            videoAnalyses.value[successIdx] = { ...videoAnalyses.value[successIdx], status: AnalysisStatus.Success, summary };
        }
    } catch (error: any) {
        if (isCancelledRef.value) break;
        const errIdx = videoAnalyses.value.findIndex(a => a.id === analysis.id);
        if (errIdx !== -1) {
             videoAnalyses.value[errIdx] = { 
                 ...videoAnalyses.value[errIdx], 
                 status: AnalysisStatus.Error, 
                 error: error instanceof Error ? error.message : 'An unknown error occurred.' 
             };
        }
    }
  }

  if (isCancelledRef.value) {
    handleStop();
  }
};

const handleClearAll = () => {
    linksInput.value = '';
    videoAnalyses.value = [];
    globalError.value = '';
};

const triggerPdfGeneration = async (id: string, title: string, summary: string) => {
    pdfGeneratingId.value = id;
    try {
        await new Promise(resolve => setTimeout(resolve, 10));
        await generatePdf(title, summary);
    } catch (err) {
        console.error("PDF generation failed:", err);
    } finally {
        pdfGeneratingId.value = null;
    }
};

const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
};

const setLang = (code: any) => {
  setLanguage(code);
  showLangMenu.value = false;
};
</script>

<template>
  <div 
    class="min-h-screen font-sans relative overflow-x-hidden transition-colors duration-500 ease-in-out selection:bg-brand-500 selection:text-white"
    :class="[theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800']"
  >
    <!-- Background Decor -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
            class="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[120px] transition-all duration-1000 opacity-40 mix-blend-screen animate-pulse-slow"
            :class="[theme === 'dark' ? 'bg-brand-900/40' : 'bg-brand-200/60']"
        ></div>
        <div 
            class="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] transition-all duration-1000 opacity-30 mix-blend-screen"
            :class="[theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-200/50']"
        ></div>
    </div>

    <!-- Top Navigation -->
    <nav class="relative z-50 flex items-center justify-end p-6 max-w-6xl mx-auto">
        <div 
            class="flex items-center gap-1 p-1.5 rounded-full border shadow-xl backdrop-blur-xl transition-all duration-300"
            :class="[theme === 'dark' ? 'bg-gray-800/60 border-gray-700/50 shadow-black/20' : 'bg-white/70 border-white/60 shadow-gray-200/50']"
        >
            <!-- Language -->
            <div class="relative">
                <button 
                    @click="showLangMenu = !showLangMenu"
                    class="p-2 rounded-full w-10 h-10 flex items-center justify-center text-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    :aria-label="'Change Language (' + languages.find(l => l.code === language)?.label + ')'"
                >
                    {{ languages.find(l => l.code === language)?.flag }}
                </button>
                
                <Transition name="fade">
                  <div 
                    v-if="showLangMenu"
                    class="absolute right-0 top-full mt-3 w-40 py-2 rounded-2xl shadow-2xl border backdrop-blur-xl flex flex-col overflow-hidden origin-top-right transform"
                    :class="[theme === 'dark' ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200']"
                  >
                      <button
                        v-for="lang in languages"
                        :key="lang.code"
                        @click="setLang(lang.code)"
                        class="px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors hover:bg-brand-50 dark:hover:bg-brand-900/20 focus:outline-none focus-visible:bg-brand-50 dark:focus-visible:bg-brand-900/20"
                        :class="[language === lang.code ? 'text-brand-600 font-bold' : (theme === 'dark' ? 'text-gray-300' : 'text-gray-700')]"
                      >
                        <span class="text-xl">{{ lang.flag }}</span>
                        <span>{{ lang.label }}</span>
                      </button>
                  </div>
                </Transition>
                
                <!-- Overlay to close menu -->
                <div v-if="showLangMenu" @click="showLangMenu = false" class="fixed inset-0 z-[-1]"></div>
            </div>

            <div class="w-px h-5 bg-gray-300/30 dark:bg-gray-600/50 mx-1"></div>

            <button 
                @click="isInfoModalOpen = true"
                class="p-2 rounded-full w-10 h-10 flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/10 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                :class="[theme === 'dark' ? 'text-gray-300' : 'text-gray-600']"
                aria-label="App Information"
            >
                <InformationCircleIcon class="w-5 h-5" />
            </button>

            <button 
                @click="toggleTheme"
                class="p-2 rounded-full w-10 h-10 flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/10 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                :class="[theme === 'dark' ? 'text-yellow-300' : 'text-blue-600']"
                :aria-label="theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            >
                 <SunIcon v-if="theme === 'dark'" class="w-5 h-5" />
                 <MoonIcon v-else class="w-5 h-5" />
            </button>

             <div class="w-px h-5 bg-gray-300/30 dark:bg-gray-600/50 mx-1"></div>

             <button 
                @click="isApiKeyModalOpen = true"
                class="p-2 rounded-full w-10 h-10 flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/10 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                :class="[theme === 'dark' ? 'text-gray-300' : 'text-gray-600']"
                aria-label="Settings & API Key"
            >
                <SettingsIcon class="w-5 h-5" />
            </button>
        </div>
    </nav>

    <main class="relative z-10 max-w-4xl mx-auto px-6 pb-20 pt-8">
        
        <!-- Hero Section -->
        <header class="text-center mb-12">
            <div class="inline-flex items-center justify-center p-4 bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl shadow-xl shadow-brand-600/30 mb-6 transform hover:scale-105 transition-transform duration-500 cursor-default">
                <VideoIcon class="w-12 h-12 text-white drop-shadow-md" />
            </div>
            <h1 class="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-gray-400">
                {{ t.appTitle }}
            </h1>
            <p class="text-lg md:text-xl font-medium opacity-80 max-w-2xl mx-auto leading-relaxed" :class="[theme === 'dark' ? 'text-gray-400' : 'text-gray-600']">
                {{ t.appSubtitle }}
            </p>
        </header>

        <!-- Main Card -->
        <div 
            class="rounded-3xl p-1 shadow-2xl transition-all duration-500"
            :class="[theme === 'dark' ? 'bg-gradient-to-b from-gray-700/50 to-gray-800/50 shadow-black/40' : 'bg-gradient-to-b from-white/80 to-white/40 shadow-xl shadow-brand-900/5']"
        >
            <div 
                class="rounded-[1.3rem] p-6 md:p-10 backdrop-blur-xl h-full"
                :class="[theme === 'dark' ? 'bg-gray-900/80' : 'bg-white/70']"
            >
                <div class="mb-8">
                    <label for="video-links" class="block text-sm font-bold uppercase tracking-wider mb-3 opacity-70 ml-1">
                        {{ t.inputLabel }}
                    </label>
                    <div class="relative group">
                        <textarea
                            id="video-links"
                            v-model="linksInput"
                            :placeholder="t.inputPlaceholder"
                            :disabled="isProcessing"
                            class="w-full h-40 p-5 rounded-2xl border-2 transition-all duration-300 resize-none font-mono text-sm leading-relaxed focus:outline-none"
                            :class="[
                                theme === 'dark' 
                                    ? 'bg-gray-800/50 border-gray-700 text-gray-200 placeholder-gray-600 focus:border-brand-500 focus:bg-gray-800' 
                                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:bg-white shadow-inner'
                            ]"
                        ></textarea>
                         <!-- Hints -->
                         <div class="flex justify-between items-center mt-3 px-1">
                             <p class="text-xs font-medium opacity-50">{{ t.enterUrlHint }}</p>
                             <div class="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                                 <InformationCircleIcon class="w-3.5 h-3.5" />
                                 {{ t.publicVideoHint }}
                             </div>
                         </div>
                    </div>
                </div>

                <!-- Settings Row -->
                <div class="mb-10">
                    <label class="block text-sm font-bold uppercase tracking-wider mb-3 opacity-70 ml-1 text-center">
                        {{ t.summaryLength }}
                    </label>
                    <div class="flex flex-col sm:flex-row gap-3 p-1.5 rounded-2xl" :class="[theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100']">
                         <button
                            v-for="length in ['short', 'medium', 'comprehensive']"
                            :key="length"
                            @click="summaryLength = length as SummaryLength"
                            :disabled="isProcessing"
                            :class="getSummaryLengthClass(length)"
                         >
                            <span v-if="length === 'short'" class="text-lg">📝</span>
                            <span v-if="length === 'medium'" class="text-lg">📑</span>
                            <span v-if="length === 'comprehensive'" class="text-lg">📚</span>
                            {{ t.lengths[length as 'short' | 'medium' | 'comprehensive'] }}
                         </button>
                    </div>
                </div>

                <!-- Global Error -->
                 <Transition name="fade">
                    <div v-if="globalError" class="mb-8 p-4 rounded-xl border-l-4 border-red-500 flex gap-4 items-start shadow-sm" :class="[theme === 'dark' ? 'bg-red-900/10 text-red-200' : 'bg-red-50 text-red-800']">
                        <ExclamationCircleIcon class="w-6 h-6 flex-shrink-0 text-red-500 mt-0.5" />
                        <div class="text-sm font-medium whitespace-pre-wrap leading-relaxed">{{ globalError }}</div>
                    </div>
                 </Transition>

                <!-- Main Action Button -->
                <button
                    v-if="!isProcessing"
                    @click="handleAnalysis"
                    class="w-full py-5 px-8 rounded-2xl font-bold text-white text-lg shadow-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 relative overflow-hidden group"
                    :class="['bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-brand-900/20']"
                >
                    <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                    <VideoIcon class="w-6 h-6 relative z-10" />
                    <span class="relative z-10">{{ t.generateBtn }}</span>
                </button>

                <button
                    v-else
                    @click="handleStop"
                    class="w-full py-5 px-8 rounded-2xl font-bold text-white text-lg shadow-xl transition-all duration-300 hover:bg-gray-700 flex items-center justify-center gap-3 animate-pulse"
                    :class="[theme === 'dark' ? 'bg-gray-800' : 'bg-gray-800']"
                >
                    <SpinnerIcon class="w-6 h-6" />
                    {{ t.stopBtn }}
                </button>
            </div>
        </div>

        <!-- Results List -->
        <Transition name="list" mode="out-in">
            <div v-if="videoAnalyses.length > 0" class="mt-16">
                 <div class="flex justify-between items-center mb-6 px-2">
                      <h2 class="text-2xl font-serif font-bold flex items-center gap-3" :class="[theme === 'dark' ? 'text-gray-200' : 'text-gray-800']">
                          <span>Results</span>
                          <span class="text-sm font-sans font-normal opacity-50 bg-gray-500/10 px-2 py-0.5 rounded-md">{{ videoAnalyses.length }} items</span>
                      </h2>
                      <button
                        v-if="!isProcessing"
                        @click="handleClearAll"
                        class="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border hover:shadow-sm"
                        :class="[theme === 'dark' ? 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-red-400' : 'border-gray-200 text-gray-500 hover:bg-white hover:text-red-600']"
                      >
                        <TrashIcon class="w-4 h-4 transition-colors" />
                        <span>Clear All</span>
                      </button>
                  </div>

                  <div class="space-y-5">
                      <div 
                        v-for="analysis in videoAnalyses" 
                        :key="analysis.id"
                        class="rounded-2xl p-6 border transition-all duration-500 group hover:shadow-md"
                        :class="[theme === 'dark' ? 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/80' : 'bg-white border-gray-100 shadow-sm hover:shadow-lg hover:border-brand-100']"
                      >
                         <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                             <div class="flex-1 min-w-0">
                                 <h3 class="text-base font-bold truncate leading-tight mb-1" :class="[theme === 'dark' ? 'text-gray-200' : 'text-gray-900']">
                                     {{ analysis.title || 'Processing Video...' }}
                                 </h3>
                                 <a 
                                    :href="analysis.url" 
                                    target="_blank" 
                                    class="text-xs truncate font-mono transition-colors hover:underline flex items-center gap-1"
                                    :class="[theme === 'dark' ? 'text-brand-400' : 'text-brand-600']"
                                 >
                                     {{ analysis.url }}
                                     <span class="opacity-50">↗</span>
                                 </a>
                             </div>

                             <div class="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                 <!-- Status -->
                                 <div class="px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2"
                                    :class="[
                                        analysis.status === AnalysisStatus.Processing ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                        analysis.status === AnalysisStatus.Success ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                        analysis.status === AnalysisStatus.Error ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                        'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                    ]"
                                 >
                                     <SpinnerIcon v-if="analysis.status === AnalysisStatus.Processing" class="w-3 h-3" />
                                     <CheckCircleIcon v-else-if="analysis.status === AnalysisStatus.Success" class="w-3 h-3" />
                                     <ExclamationCircleIcon v-else-if="analysis.status === AnalysisStatus.Error" class="w-3 h-3" />
                                     <span>{{ analysis.status }}</span>
                                 </div>

                                 <!-- Action Button -->
                                 <button
                                    v-if="analysis.status === AnalysisStatus.Error"
                                    @click="handleRetry(analysis.id)"
                                    :disabled="isProcessing"
                                    class="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md active:scale-95 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                 >
                                    <RetryIcon class="w-4 h-4" />
                                    Retry
                                 </button>

                                 <button
                                    v-else
                                    @click="triggerPdfGeneration(analysis.id, analysis.title!, analysis.summary!)"
                                    :disabled="analysis.status !== AnalysisStatus.Success || pdfGeneratingId === analysis.id"
                                    class="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border"
                                    :class="[
                                        pdfGeneratingId === analysis.id 
                                            ? (theme === 'dark' ? 'bg-gray-700 text-gray-400 border-gray-600' : 'bg-gray-100 text-gray-400 border-gray-200')
                                            : (theme === 'dark' 
                                                ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' 
                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300')
                                    ]"
                                 >
                                    <template v-if="pdfGeneratingId === analysis.id">
                                        <SpinnerIcon class="w-4 h-4" /> Generating...
                                    </template>
                                    <template v-else>
                                        <DownloadIcon class="w-4 h-4" /> Download PDF
                                    </template>
                                 </button>
                             </div>
                         </div>
                         
                         <!-- Error Message -->
                         <div v-if="analysis.status === AnalysisStatus.Error" class="mt-4 text-xs p-3 rounded-lg font-mono" :class="[theme === 'dark' ? 'bg-red-900/20 text-red-300 border border-red-900/30' : 'bg-red-50 text-red-600 border border-red-100']">
                             > Error: {{ analysis.error }}
                         </div>
                      </div>
                  </div>
            </div>
        </Transition>

    </main>

    <ApiKeyModal 
      :isOpen="isApiKeyModalOpen" 
      :theme="theme" 
      :initialKey="apiKey"
      :selectedModel="selectedModel"
      @close="isApiKeyModalOpen = false"
      @save="handleSaveApiKey"
      @modelChange="handleSaveModel"
    />

    <InfoModal
      :isOpen="isInfoModalOpen"
      :theme="theme"
      @close="isInfoModalOpen = false"
    />
  </div>
</template>

<style>
/* Custom Pulse for background blobs */
@keyframes pulse-slow {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.1); opacity: 0.3; }
}
.animate-pulse-slow {
  animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
