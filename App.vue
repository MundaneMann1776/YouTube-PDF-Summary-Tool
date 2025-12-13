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

// Progress calculation if needed, currently unused in UI logic but good to have
// const progress = computed(() => totalVideos.value > 0 ? (processedVideos.value / totalVideos.value) * 100 : 0);


// Lifecycle
onMounted(() => {
  const storedKey = localStorage.getItem('GEMINI_API_KEY');
  if (storedKey) {
    apiKey.value = storedKey;
  } else {
    isApiKeyModalOpen.value = true;
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

    // Set processing
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
        // Slight delay to allow UI to update
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

const setLang = (code: any) => setLanguage(code);

const getSummaryLengthClass = (length: string) => {
  const base = 'flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize';
  const isSelected = summaryLength.value === length;
  const isDark = theme.value === 'dark';

  if (isSelected) {
    return [base, isDark ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'];
  } else {
    return [base, isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'];
  }
};

</script>

<template>
  <div :class="['min-h-screen font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8 transition-colors duration-300', theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800']">
    <div class="w-full max-w-4xl mx-auto relative">
      
      <!-- Top Bar -->
      <div 
        class="absolute top-4 right-4 flex items-center gap-1 p-1.5 rounded-full border shadow-lg backdrop-blur-md z-50 transition-all duration-500 ease-out transform"
        :class="[
           theme === 'dark' ? 'bg-gray-800/40 border-gray-700/50 shadow-black/20' : 'bg-white/40 border-white/50 shadow-gray-200/50'
        ]"
      >
        <!-- Language Selector -->
        <div class="relative group">
            <button :class="['p-2 rounded-full transition-colors duration-200 focus:outline-none flex items-center justify-center w-9 h-9 text-lg', theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5']">
                {{ languages.find(l => l.code === language)?.flag }}
            </button>
            <div :class="['absolute right-0 top-full mt-2 w-32 py-1 rounded-xl shadow-xl border backdrop-blur-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50', theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200']">
                 <button
                  v-for="lang in languages"
                  :key="lang.code"
                  @click="setLang(lang.code)"
                  :class="['w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors', language === lang.code ? (theme === 'dark' ? 'text-white font-bold' : 'text-black font-bold') : (theme === 'dark' ? 'text-gray-300' : 'text-gray-700')]"
                >
                  <span>{{ lang.flag }}</span>
                  <span>{{ lang.label }}</span>
                </button>
            </div>
        </div>

        <div :class="['w-px h-4', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300/50']"></div>

        <button 
            @click="isInfoModalOpen = true"
            :class="['p-2 rounded-full transition-colors duration-200 focus:outline-none hover:scale-110 active:scale-95 transform', theme === 'dark' ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600 hover:bg-black/5']"
        >
            <InformationCircleIcon class="w-5 h-5" />
        </button>

        <div :class="['w-px h-4', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300/50']"></div>

        <button 
            @click="toggleTheme"
            :class="['p-2 rounded-full transition-colors duration-200 focus:outline-none hover:scale-110 active:scale-95 transform', theme === 'dark' ? 'text-yellow-300 hover:bg-white/10' : 'text-blue-500 hover:bg-black/5']"
        >
             <SunIcon v-if="theme === 'dark'" class="w-5 h-5" />
             <MoonIcon v-else class="w-5 h-5" />
        </button>

         <div :class="['w-px h-4', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300/50']"></div>

         <button 
            @click="isApiKeyModalOpen = true"
            :class="['p-2 rounded-full transition-colors duration-200 focus:outline-none hover:scale-110 active:scale-95 transform', theme === 'dark' ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600 hover:bg-black/5']"
        >
            <SettingsIcon class="w-5 h-5" />
        </button>

      </div>

      <!-- Header -->
      <header class="text-center mb-8 pt-8">
          <div class="flex justify-center items-center gap-4 mb-2">
            <div class="relative">
              <div class="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-400 rounded-full blur opacity-40 animate-pulse"></div>
              <VideoIcon class="w-16 h-16 text-red-500 relative z-10 drop-shadow-2xl" />
            </div>
          </div>
          <h1 :class="['text-5xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r', theme === 'dark' ? 'from-white to-gray-400' : 'from-gray-900 to-gray-600']">
            {{ t.appTitle }}
          </h1>
          <p :class="['text-lg font-medium', theme === 'dark' ? 'text-gray-400' : 'text-gray-500']">
            {{ t.appSubtitle }}
          </p>
      </header>

      <main>
          <!-- Input Section -->
          <div 
            class="rounded-2xl p-8 backdrop-blur-xl shadow-2xl transition-all duration-500"
            :class="[
                theme === 'dark' ? 'bg-gray-800/40 border border-gray-700/50 shadow-black/20' : 'bg-white/60 border border-white/50 shadow-xl shadow-blue-100/20'
            ]"
          >
             <label for="video-links" :class="['block text-lg font-medium mb-4', theme === 'dark' ? 'text-gray-200' : 'text-gray-700']">
                 {{ t.inputLabel }}
             </label>
             <div class="relative">
                <textarea
                    id="video-links"
                    v-model="linksInput"
                    :placeholder="t.inputPlaceholder"
                    :disabled="isProcessing"
                    :class="['w-full h-40 p-4 rounded-xl border transition-all duration-200 resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50', theme === 'dark' ? 'bg-gray-900/50 border-gray-700 focus:border-red-500/50 focus:ring-red-500 text-gray-200 placeholder-gray-600' : 'bg-white/50 border-gray-200 focus:border-blue-500/50 focus:ring-blue-500 text-gray-900 placeholder-gray-400']"
                ></textarea>
             </div>

             <div class="flex justify-between items-start mt-3">
                 <p class="text-xs text-gray-500">{{ t.enterUrlHint }}</p>
                 <p :class="['text-xs', theme === 'dark' ? 'text-yellow-500/80' : 'text-yellow-600/80']">{{ t.publicVideoHint }}</p>
             </div>

             <!-- Summary Length -->
             <div class="mt-8">
                 <label :class="['block text-sm font-medium mb-3 text-center', theme === 'dark' ? 'text-gray-400' : 'text-gray-500']">
                    {{ t.summaryLength }}
                 </label>
                 <div :class="['flex p-1 rounded-xl', theme === 'dark' ? 'bg-gray-900/30 border border-gray-700/50' : 'bg-gray-100/50 border border-gray-200/50']">
                     <button
                        v-for="length in ['short', 'medium', 'comprehensive']"
                        :key="length"
                        @click="summaryLength = length as SummaryLength"
                        :disabled="isProcessing"
                        :class="getSummaryLengthClass(length)"
                     >
                        {{ t.lengths[length as 'short' | 'medium' | 'comprehensive'] }}
                     </button>
                 </div>
             </div>

             <!-- Error -->
             <div v-if="globalError" :class="['mt-6 p-4 rounded-xl border flex gap-3 items-start', theme === 'dark' ? 'bg-red-900/20 border-red-800/50 text-red-200' : 'bg-red-50 border-red-100 text-red-700']">
                 <ExclamationCircleIcon class="w-5 h-5 flex-shrink-0 mt-0.5" />
                 <span class="text-sm whitespace-pre-wrap">{{ globalError }}</span>
             </div>

             <!-- Buttons -->
             <div class="mt-8">
                 <button
                    v-if="!isProcessing"
                    @click="handleAnalysis"
                    class="w-full py-4 px-6 flex items-center justify-center gap-3 rounded-xl font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    :class="[theme === 'dark' ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-red-900/20' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-blue-200/50']"
                 >
                    <VideoIcon class="w-5 h-5" />
                    {{ t.generateBtn }}
                 </button>
                 <button
                    v-else
                    @click="handleStop"
                    class="w-full py-4 px-6 flex items-center justify-center gap-3 rounded-xl font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    :class="[theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 hover:bg-gray-700']"
                 >
                    <SpinnerIcon class="w-5 h-5" />
                    {{ t.stopBtn }}
                 </button>
             </div>
          </div>

          <!-- Results -->
          <div v-if="videoAnalyses.length > 0" class="mt-8">
              <div class="flex justify-between items-center mb-4">
                  <h2 :class="['text-2xl font-semibold', theme === 'dark' ? 'text-gray-300' : 'text-gray-700']">Results</h2>
                  <button
                    v-if="!isProcessing"
                    @click="handleClearAll"
                    :class="['p-2 rounded-lg transition-colors duration-200 border', theme === 'dark' ? 'border-gray-600 text-gray-400 hover:bg-gray-700 hover:border-gray-500' : 'border-gray-300 text-gray-500 hover:bg-gray-100 hover:border-gray-400']"
                    aria-label="Clear all results"
                  >
                    <TrashIcon class="w-5 h-5" />
                  </button>
              </div>

              <div class="space-y-4">
                  <div 
                    v-for="analysis in videoAnalyses" 
                    :key="analysis.id"
                    :class="['rounded-lg p-4 border transition-all duration-300', theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm']"
                  >
                     <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                         <div class="flex-1 min-w-0">
                             <p :class="['text-sm truncate font-medium', theme === 'dark' ? 'text-gray-300' : 'text-gray-800']">
                                 {{ analysis.title || analysis.url }}
                             </p>
                             <p class="text-xs text-gray-500 truncate">{{ analysis.title ? analysis.url : '' }}</p>
                         </div>
                         <div class="flex items-center gap-4 w-full sm:w-auto">
                             <div class="w-36">
                                 <!-- Status Indicator -->
                                 <div v-if="analysis.status === AnalysisStatus.Processing" class="flex items-center gap-2 text-blue-500"><SpinnerIcon class="w-5 h-5" /> Processing...</div>
                                 <div v-else-if="analysis.status === AnalysisStatus.Success" class="flex items-center gap-2 text-green-500"><CheckCircleIcon class="w-5 h-5" /> Success</div>
                                 <div v-else-if="analysis.status === AnalysisStatus.Error" class="flex items-center gap-2 text-red-500"><ExclamationCircleIcon class="w-5 h-5" /> Error</div>
                                 <div v-else :class="['flex items-center gap-2', theme === 'dark' ? 'text-gray-400' : 'text-gray-500']">Pending</div>
                             </div>

                             <button
                                v-if="analysis.status === AnalysisStatus.Error"
                                @click="handleRetry(analysis.id)"
                                :disabled="isProcessing"
                                :class="['flex items-center justify-center gap-2 w-[140px] py-2 px-4 bg-yellow-600 hover:bg-yellow-700 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed', theme === 'dark' ? 'disabled:bg-gray-800 disabled:text-gray-500' : 'disabled:bg-gray-200 disabled:text-gray-400']"
                             >
                                <RetryIcon class="w-4 h-4" />
                                Retry Analysis
                             </button>

                             <button
                                v-else
                                @click="triggerPdfGeneration(analysis.id, analysis.title!, analysis.summary!)"
                                :disabled="analysis.status !== AnalysisStatus.Success || pdfGeneratingId === analysis.id"
                                :class="['flex items-center justify-center gap-2 w-[140px] py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed', pdfGeneratingId === analysis.id ? (theme === 'dark' ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500') : (theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500' : 'bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400')]"
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
                     <p v-if="analysis.status === AnalysisStatus.Error" :class="['mt-2 text-sm p-2 rounded-md', theme === 'dark' ? 'text-red-400 bg-red-900/30' : 'text-red-700 bg-red-100']">
                         {{ analysis.error }}
                     </p>
                  </div>
              </div>
          </div>

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
  </div>
</template>