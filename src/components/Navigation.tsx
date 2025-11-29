import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../contexts/ThemeContext';

export const Navigation = () => {
  const { t, language, switchLanguage, isRTL } = useLanguage();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: t('nav.gallery'), href: '#gallery' },
    { label: t('nav.about'), href: '#about' },
    { label: t('nav.contact'), href: '#contact' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        backgroundColor: theme.mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(26, 26, 26, 0.8)',
        borderBottomColor: theme.border,
      }}
      className="sticky top-0 z-50 backdrop-blur-md border-b"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center h-16 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Link to="/" className="text-2xl font-light tracking-wider" style={{ color: theme.text }}>
            {t('about.artistName')}
          </Link>

          {/* Desktop Menu */}
          <div className={`hidden md:flex items-center ${isRTL ? 'flex-row-reverse gap-8' : 'gap-8'}`}>
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm tracking-wide transition-colors"
                style={{ color: theme.text }}
                onMouseEnter={(e) => e.currentTarget.style.color = theme.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = theme.text}
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => switchLanguage(language === 'en' ? 'he' : 'en')}
              className="text-sm px-3 py-1 border rounded transition-colors"
              style={{
                borderColor: theme.border,
                color: theme.text,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.mode === 'light' ? '#f5f3f0' : '#2d2d2d';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {language === 'en' ? 'עברית' : 'English'}
            </button>
            <Link
              to="/admin"
              className="text-sm px-3 py-1 border rounded transition-colors"
              style={{
                borderColor: theme.border,
                color: theme.text,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.mode === 'light' ? '#f5f3f0' : '#2d2d2d';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {t('nav.admin')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden border-t ${isRTL ? 'rtl' : 'ltr'}`}
            style={{ borderTopColor: theme.border }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block px-3 py-2 text-sm rounded transition-colors"
                  style={{ color: theme.text }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.backgroundSecondary}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <button
                onClick={() => {
                  switchLanguage(language === 'en' ? 'he' : 'en');
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm rounded transition-colors"
                style={{ color: theme.text }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.backgroundSecondary}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {language === 'en' ? 'עברית' : 'English'}
              </button>
              <Link
                to="/admin"
                className="block px-3 py-2 text-sm rounded transition-colors"
                style={{ color: theme.text }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.backgroundSecondary}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => setIsOpen(false)}
              >
                {t('nav.admin')}
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};
