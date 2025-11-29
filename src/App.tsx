import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useLanguage } from './hooks/useLanguage';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { AdminPage } from './pages/AdminPage';
import './App.css';

function App() {
  const { language } = useLanguage();

  useEffect(() => {
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return (
    <Router>
      <div className={language === 'he' ? 'rtl' : 'ltr'}>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          {/* Catch-all route for hash fragments and undefined routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
