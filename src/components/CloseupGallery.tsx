import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { CloseupImage } from '../types/painting';
import { useTheme } from '../contexts/ThemeContext';

const lightboxStyle = `
  body.closeup-lightbox-open {
    background-color: #000000 !important;
    background-image: none !important;
  }

  .closeup-lightbox-bg {
    background-color: #000000 !important;
    background-image: none !important;
  }
`;

interface CloseupGalleryProps {
  closeups?: CloseupImage[];
  paintingTitle: string;
}

export const CloseupGallery = ({ closeups, paintingTitle }: CloseupGalleryProps) => {
  const { theme } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Add/remove class from body when lightbox opens/closes
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.classList.add('closeup-lightbox-open');
    } else {
      document.body.classList.remove('closeup-lightbox-open');
    }
    return () => {
      document.body.classList.remove('closeup-lightbox-open');
    };
  }, [selectedIndex]);

  if (!closeups || closeups.length === 0) {
    return null;
  }

  // Convert GitHub path to full raw URL
  const getImageUrl = (url: string): string => {
    if (url.includes('firebasestorage.googleapis.com')) {
      return url;
    }
    if (url.includes('raw.githubusercontent.com')) {
      return url;
    }
    return `https://raw.githubusercontent.com/${url}`;
  };

  return (
    <div className="w-full">
      <style>{lightboxStyle}</style>
      <h3 className="text-lg font-light mb-4" style={{ color: theme.text }}>
        Closeups
      </h3>

      {/* Grid of closeup thumbnails */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {closeups.map((closeup, index) => (
          <motion.button
            key={closeup.id}
            onClick={() => setSelectedIndex(index)}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative aspect-square rounded-lg overflow-hidden focus:outline-none focus:ring-2"
            style={{
              border: `1px solid ${theme.border}`,
              outlineColor: theme.primary,
            }}
          >
            <img
              src={getImageUrl(closeup.imageUrl)}
              alt={`Closeup of ${paintingTitle}`}
              className="w-full h-full object-cover"
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center backdrop-blur-sm"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
              }}
              whileHover={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
              }}
            >
              <span className="text-white text-2xl">🔍</span>
            </motion.div>
          </motion.button>
        ))}
      </div>

      {/* Fullscreen lightbox viewer */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <>
            {/* Solid black background */}
            <div
              className="fixed inset-0 z-40 pointer-events-none closeup-lightbox-bg"
              style={{
                position: 'fixed',
              }}
            />
            {/* Lightbox content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIndex(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{
                backgroundColor: 'transparent',
              }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-screen flex items-center justify-center"
            >
              <img
                src={getImageUrl(closeups[selectedIndex].imageUrl)}
                alt={`Closeup of ${paintingTitle}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />

              {/* Navigation buttons */}
              {closeups.length > 1 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedIndex((prev) => (prev === 0 ? closeups.length - 1 : prev! - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                    }}
                  >
                    ←
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedIndex((prev) => (prev === closeups.length - 1 ? 0 : prev! + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                    }}
                  >
                    →
                  </motion.button>
                </>
              )}

              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedIndex(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-xl"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(4px)',
                  color: '#ffffff',
                }}
              >
                ✕
              </motion.button>

              {/* Counter */}
              {closeups.length > 1 && (
                <div
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(4px)',
                    color: '#ffffff',
                  }}
                >
                  {selectedIndex + 1} / {closeups.length}
                </div>
              )}
            </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
