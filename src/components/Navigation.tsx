import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';

export const Navigation = () => {
  const { t, language, switchLanguage } = useLanguage();
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
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-light tracking-wider">
            ARTIST
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm tracking-wide hover:text-gray-600 transition-colors"
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => switchLanguage(language === 'en' ? 'he' : 'en')}
              className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            >
              {language === 'en' ? 'עברית' : 'English'}
            </button>
            <Link
              to="/admin"
              className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            >
              Admin
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
            className="md:hidden border-t border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block px-3 py-2 text-sm hover:bg-gray-100 rounded"
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
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
              >
                {language === 'en' ? 'עברית' : 'English'}
              </button>
              <Link
                to="/admin"
                className="block px-3 py-2 text-sm hover:bg-gray-100 rounded"
                onClick={() => setIsOpen(false)}
              >
                Admin
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};
