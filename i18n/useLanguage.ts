import { ref, computed, watch } from 'vue';
import { translations, type Language } from './translations';

const currentLanguage = ref<Language>('en');

// Initialize from localStorage
const savedLang = localStorage.getItem('app_language') as Language;
if (savedLang && translations[savedLang]) {
    currentLanguage.value = savedLang;
}

// Watch and save
watch(currentLanguage, (newLang) => {
    localStorage.setItem('app_language', newLang);
});

export const useLanguage = () => {
    const setLanguage = (lang: Language) => {
        currentLanguage.value = lang;
    };

    const t = computed(() => translations[currentLanguage.value]);

    return {
        language: currentLanguage,
        setLanguage,
        t
    };
};
