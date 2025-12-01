import React from 'react';
import { XMarkIcon, VideoIcon } from './IconComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, theme }) => {
  const { t } = useLanguage();

  const steps = [
    t.steps.paste,
    t.steps.analyze,
    t.steps.summary,
    t.steps.export
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${theme === 'dark'
              ? 'bg-gray-900/90 border border-gray-700/50 shadow-black/50'
              : 'bg-white/90 border border-white/50 shadow-xl'
              } backdrop-blur-xl`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-6 text-center border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg flex items-center justify-center mb-4">
                <VideoIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t.appTitle}
              </h2>
              <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t.appSubtitle}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* How it works */}
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t.howItWorks}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {steps.map((step, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border ${theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700/50'
                      : 'bg-white/50 border-gray-200/50'
                      }`}>
                      <div className="text-xs font-bold text-red-500 mb-1">0{idx + 1}</div>
                      <div className={`font-semibold text-sm mb-0.5 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                        {step.title}
                      </div>
                      <div className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {step.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`text-xs text-center pt-4 border-t ${theme === 'dark' ? 'border-gray-800 text-gray-500' : 'border-gray-100 text-gray-400'}`}>
                <p>{t.footer.poweredBy}</p>
                <p className="mt-1">{t.footer.version}</p>
              </div>
            </div>

            {/* Close Button */}
            <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-800 bg-gray-800/30' : 'border-gray-100 bg-gray-50/50'}`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className={`w-full py-3 rounded-xl font-bold transition-colors shadow-lg ${theme === 'dark'
                  ? 'bg-white text-black hover:bg-gray-100'
                  : 'bg-black text-white hover:bg-gray-800'
                  }`}
              >
                {t.buttons.gotIt}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InfoModal;

