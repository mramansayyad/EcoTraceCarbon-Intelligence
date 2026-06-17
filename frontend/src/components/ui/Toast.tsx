import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-accent-green" />,
    error: <AlertCircle className="h-5 w-5 text-danger-red" />,
    info: <Info className="h-5 w-5 text-accent-emerald" />
  };

  const borders = {
    success: 'border-accent-green/30',
    error: 'border-danger-red/30',
    info: 'border-accent-emerald/30'
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`pointer-events-auto flex items-start gap-3 p-4 bg-bg-surface border ${borders[toast.type]} rounded-xl shadow-2xl`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {icons[toast.type]}
            </div>
            
            <div className="flex-grow text-sm text-text-primary font-medium">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-0.5 rounded-full hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-all duration-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
