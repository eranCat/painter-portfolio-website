import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  message: string;
  type: AlertType;
  onClose: () => void;
  duration?: number;
}

export const Alert = ({ message, type, onClose, duration = 4000 }: AlertProps) => {
  const { theme } = useTheme();

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: theme.mode === 'light' ? '#10b981' : '#059669',
          icon: '✓',
        };
      case 'error':
        return {
          bg: theme.mode === 'light' ? '#ef4444' : '#dc2626',
          icon: '✕',
        };
      case 'warning':
        return {
          bg: theme.mode === 'light' ? '#f59e0b' : '#d97706',
          icon: '⚠',
        };
      case 'info':
        return {
          bg: theme.mode === 'light' ? '#3b82f6' : '#2563eb',
          icon: 'ℹ',
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] max-w-md mx-4"
    >
      <div
        className="rounded-lg shadow-2xl px-6 py-4 flex items-center gap-3"
        style={{
          backgroundColor: styles.bg,
          color: '#ffffff',
        }}
      >
        <span className="text-xl font-bold">{styles.icon}</span>
        <p className="flex-1 text-sm font-light">{message}</p>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="text-white opacity-75 hover:opacity-100 transition-opacity"
        >
          ✕
        </motion.button>
      </div>
    </motion.div>
  );
};

interface AlertContainerProps {
  alerts: Array<{
    id: string;
    message: string;
    type: AlertType;
  }>;
  onClose: (id: string) => void;
}

export const AlertContainer = ({ alerts, onClose }: AlertContainerProps) => {
  return (
    <AnimatePresence mode="wait">
      {alerts.length > 0 && alerts[0] && (
        <Alert
          key={alerts[0].id}
          message={alerts[0].message}
          type={alerts[0].type}
          onClose={() => onClose(alerts[0].id)}
        />
      )}
    </AnimatePresence>
  );
};
