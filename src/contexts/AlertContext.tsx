import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AlertContainer, AlertType } from '../components/Alert';

interface AlertData {
  id: string;
  message: string;
  type: AlertType;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  const showAlert = useCallback((message: string, type: AlertType = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setAlerts((prev) => [...prev, { id, message, type }]);
  }, []);

  const handleClose = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <AlertContainer alerts={alerts} onClose={handleClose} />
    </AlertContext.Provider>
  );
};
