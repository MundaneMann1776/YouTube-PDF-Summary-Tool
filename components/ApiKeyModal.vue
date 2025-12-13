<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div :class="['w-full max-w-md p-6 rounded-lg shadow-xl', theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900']">
      <div :class="['flex justify-between items-center p-6 border-b', theme === 'dark' ? 'border-gray-700' : 'border-gray-200']">
        <h2 :class="['text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900']">
          {{ t.settings.title }}
        </h2>
        <button @click="onClose" :class="['p-1 rounded-full hover:bg-opacity-10', theme === 'dark' ? 'hover:bg-white text-gray-400' : 'hover:bg-black text-gray-500']">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <div class="p-6 space-y-6">
        <!-- Model Selection -->
        <div>
          <label :class="['block text-sm font-medium mb-2', theme === 'dark' ? 'text-gray-300' : 'text-gray-700']">
            {{ t.settings.modelLabel }}
          </label>
          <select
            :value="selectedModel"
            @change="handleModelChange"
            :class="['w-full p-3 rounded-lg border outline-none transition-all', theme === 'dark'
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
            ]"
          >
            <option v-for="model in MODELS" :key="model.id" :value="model.id">{{ model.name }}</option>
          </select>
        </div>

        <!-- API Key Input -->
        <div>
          <label for="apiKey" :class="['block text-sm font-medium mb-2', theme === 'dark' ? 'text-gray-300' : 'text-gray-700']">
            {{ t.settings.apiKeyLabel }}
          </label>
          <input
            type="password"
            id="apiKey"
            v-model="key"
            @input="error = ''"
            :placeholder="t.settings.apiKeyPlaceholder"
            :class="['w-full p-3 rounded-lg border outline-none transition-all', theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500']"
          />
          <p v-if="error" class="mt-1 text-sm text-red-500 flex items-center gap-1"><ExclamationCircleIcon class="w-4 h-4" /> {{ error }}</p>
          <p :class="['mt-2 text-xs', theme === 'dark' ? 'text-gray-400' : 'text-gray-500']">
            Your API Key is stored locally on your device and is never sent to me.
          </p>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-brand-500 hover:text-brand-400 flex items-center gap-1"
          >
            {{ t.settings.getKeyLink }} <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>

      <div :class="['p-6 border-t', theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50']">
        <button
          @click="handleSave"
          class="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          <CheckCircleIcon class="w-5 h-5" />
          {{ t.buttons.save }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useLanguage } from '../i18n/useLanguage';
import XMarkIcon from './icons/XMarkIcon.vue';
import CheckCircleIcon from './icons/CheckCircleIcon.vue';
import ExclamationCircleIcon from './icons/ExclamationCircleIcon.vue';

const props = defineProps<{
  isOpen: boolean;
  theme: 'light' | 'dark';
  selectedModel?: string;
  initialKey?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', key: string): void;
  (e: 'modelChange', model: string): void;
}>();

const { t } = useLanguage();
const key = ref(props.initialKey || '');
const error = ref('');

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

watch(() => props.initialKey, (newVal) => {
  key.value = newVal || '';
});

const onClose = () => emit('close');
const onSave = (val: string) => emit('save', val);
const onModelChange = (val: string) => emit('modelChange', val); 

const handleSave = () => {
    if (!key.value.trim()) {
        error.value = t.value.errors.apiKeyEmptyError; 
        return;
    }
    onSave(key.value.trim());
    onClose();
};

const handleModelChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  onModelChange(target.value);
};
</script>