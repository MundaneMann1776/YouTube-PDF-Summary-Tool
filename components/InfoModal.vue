<template>
  <Transition name="modal">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="onClose"></div>

      <div
        class="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl transition-all"
        :class="[
          theme === 'dark' ? 'bg-gray-900/90 border border-gray-700/50 shadow-black/50' : 'bg-white/90 border border-white/50 shadow-xl'
        ]"
        @click.stop
      >
        <!-- Header -->
        <div :class="['p-6 text-center border-b', theme === 'dark' ? 'border-gray-800' : 'border-gray-100']">
          <div class="mx-auto w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg flex items-center justify-center mb-4">
            <VideoIcon class="w-6 h-6 text-white" />
          </div>
          <h2 :class="['text-2xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900']">
            {{ t.appTitle }}
          </h2>
          <p :class="['mt-1 text-sm', theme === 'dark' ? 'text-gray-400' : 'text-gray-500']">
            {{ t.appSubtitle }}
          </p>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-8">
          <!-- How it works -->
          <div>
            <h3 :class="['text-sm font-bold uppercase tracking-wider mb-4', theme === 'dark' ? 'text-gray-500' : 'text-gray-400']">
              {{ t.howItWorks }}
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <div v-for="(step, idx) in steps" :key="idx" :class="['p-3 rounded-xl border', theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50']">
                <div class="text-xs font-bold text-red-500 mb-1">0{{ idx + 1 }}</div>
                <div :class="['font-semibold text-sm mb-0.5', theme === 'dark' ? 'text-gray-200' : 'text-gray-900']">
                  {{ step.title }}
                </div>
                <div :class="['text-xs leading-relaxed', theme === 'dark' ? 'text-gray-400' : 'text-gray-500']">
                  {{ step.desc }}
                </div>
              </div>
            </div>
          </div>
          <div :class="['text-xs text-center pt-4 border-t', theme === 'dark' ? 'border-gray-800 text-gray-500' : 'border-gray-100 text-gray-400']">
            <p>{{ t.footer.poweredBy }}</p>
            <p class="mt-1">{{ t.footer.version }}</p>
          </div>
        </div>

        <!-- Close Button -->
        <div :class="['p-4 border-t', theme === 'dark' ? 'border-gray-800 bg-gray-800/30' : 'border-gray-100 bg-gray-50/50']">
          <button
            @click="onClose"
            :class="['w-full py-3 rounded-xl font-bold transition-colors shadow-lg', theme === 'dark' ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-800']"
          >
            {{ t.buttons.gotIt }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLanguage } from '../i18n/useLanguage';
import VideoIcon from './icons/VideoIcon.vue';

defineProps<{
  isOpen: boolean;
  theme: 'light' | 'dark';
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t } = useLanguage();

const steps = computed(() => [
  t.value.steps.paste,
  t.value.steps.analyze,
  t.value.steps.summary,
  t.value.steps.export
]);

const onClose = () => emit('close');
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95) translateY(10px);
}
</style>
