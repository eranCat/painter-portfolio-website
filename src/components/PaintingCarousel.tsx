import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../contexts/ThemeContext';
import { getPaintings } from '../services/paintingService';
import { Painting } from '../types/painting';

// Normalize image URLs (Firebase Storage URLs and legacy GitHub paths)
const resolveImageUrl = (url: string): string => {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  return `https://raw.githubusercontent.com/${url}`;
};

export const PaintingCarousel = () => {
  const { t, isRTL, language } = useLanguage();
  const { theme } = useTheme();
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCloseupIndex, setSelectedCloseupIndex] = useState<number | null>(null);

  useEffect(() => {
    getPaintings()
      .then(setPaintings)
      .catch((err) => console.error('Failed to load paintings:', err))
      .finally(() => setLoading(false));
  }, []);

  // Determine current image URL (main painting or selected closeup)
  const currentPainting = paintings[currentIndex];
  const activeImageUrl = (() => {
    if (!currentPainting) return '';
    if (
      selectedCloseupIndex !== null &&
      currentPainting.closeups &&
      currentPainting.closeups[selectedCloseupIndex]
    ) {
      return resolveImageUrl(currentPainting.closeups[selectedCloseupIndex].imageUrl);
    }
    return resolveImageUrl(currentPainting.imageUrl);
  })();

  // Read intrinsic dimensions of the current image (for the info panel)
  useEffect(() => {
    if (!activeImageUrl) {
      setImageDimensions(null);
      return;
    }
    const img = new Image();
    img.onload = () => setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => setImageDimensions(null);
    img.src = activeImageUrl;
  }, [activeImageUrl]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + paintings.length) % paintings.length);
    setSelectedCloseupIndex(null);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % paintings.length);
    setSelectedCloseupIndex(null);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setSelectedCloseupIndex(null);
  };

  if (loading) {
    return (
      <div className="h-96 md:h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderBottomColor: theme.primary }}
          />
          <p style={{ color: theme.textSecondary }}>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (paintings.length === 0) {
    return (
      <div className="h-96 md:h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <p style={{ color: theme.textSecondary }}>{t('gallery.noPaintings')}</p>
      </div>
    );
  }

  const paintingTitle = language === 'he' ? currentPainting.title.he : currentPainting.title.en;
  const paintingDescription =
    language === 'he' ? currentPainting.description.he : currentPainting.description.en;

  return (
    <div className={`py-12 md:py-20 ${isRTL ? 'rtl' : 'ltr'}`} style={{ backgroundColor: 'transparent' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
          {/* Image section */}
          <div className="w-full lg:w-2/3 flex-shrink-0">
            <div
              className="relative rounded-lg overflow-hidden shadow-lg w-full flex items-center justify-center"
              style={{
                backgroundColor: theme.mode === 'dark' ? '#0f0f0f' : '#f5f1e8',
                minHeight: '500px',
                maxHeight: '75vh',
              }}
            >
              <AnimatePresence mode="wait">
                {activeImageUrl ? (
                  <motion.img
                    key={activeImageUrl}
                    src={activeImageUrl}
                    alt={paintingTitle}
                    className="max-w-full max-h-[75vh] object-contain cursor-zoom-in"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setIsFullscreen(true)}
                  />
                ) : (
                  <motion.div
                    key="placeholder"
                    className="w-full h-96 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-center" style={{ color: theme.textSecondary }}>
                      <div className="text-4xl mb-2">🖼️</div>
                      <p>{t('gallery.imageLoading')}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Image counter and fullscreen button */}
              <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
                <div
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: theme.mode === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)',
                    color: theme.mode === 'dark' ? '#fff' : '#000',
                  }}
                >
                  {currentIndex + 1} / {paintings.length}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsFullscreen(true)}
                  className="p-2 rounded-full transition-colors"
                  style={{
                    backgroundColor: theme.mode === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)',
                    color: theme.mode === 'dark' ? '#fff' : '#000',
                  }}
                  aria-label="View fullscreen"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4m-4 0l5 5m11-5v4m0-4h-4m4 0l-5 5M4 20v-4m0 4h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Navigation + thumbnails */}
            <div className="mt-6 flex items-center justify-center lg:justify-start gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToPrevious}
                className="p-3 rounded-full text-white shadow-md flex-shrink-0"
                style={{ backgroundColor: theme.primary }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.primaryHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.primary)}
                aria-label={t('carousel.previous')}
              >
                <svg className={`w-6 h-6 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>

              <div className="flex gap-3 flex-wrap justify-center lg:justify-start">
                {paintings.map((painting, index) => (
                  <motion.button
                    key={painting.id}
                    onClick={() => goToSlide(index)}
                    className={`relative rounded overflow-hidden transition-all ${
                      index === currentIndex ? 'ring-2 shadow-lg' : 'opacity-60 hover:opacity-80'
                    }`}
                    style={{ width: '70px', height: '52px' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`${t('carousel.goToSlide')} ${index + 1}`}
                  >
                    <img
                      src={resolveImageUrl(painting.imageUrl)}
                      alt={painting.title.en}
                      className="w-full h-full object-cover"
                    />
                    {index === currentIndex && (
                      <div
                        className="absolute inset-0 ring-2 rounded pointer-events-none"
                        style={{ borderColor: theme.primary, borderWidth: '2px' }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToNext}
                className="p-3 rounded-full text-white shadow-md flex-shrink-0"
                style={{ backgroundColor: theme.primary }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.primaryHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.primary)}
                aria-label={t('carousel.next')}
              >
                <svg className={`w-6 h-6 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Info section */}
          <motion.div
            className="w-full lg:w-1/3 lg:pt-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            key={currentIndex}
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-3xl md:text-4xl font-light mb-2" style={{ color: theme.text }}>
                  {paintingTitle}
                </h3>
                <p className="font-medium" style={{ color: theme.primary }}>
                  {currentPainting.year}
                </p>
              </div>

              <p className="leading-relaxed" style={{ color: theme.textSecondary }}>
                {paintingDescription}
              </p>

              {imageDimensions && (
                <div className="pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
                  <p className="text-sm" style={{ color: theme.textSecondary }}>
                    {imageDimensions.width} × {imageDimensions.height} px
                  </p>
                </div>
              )}

              {/* Closeup thumbnails */}
              {currentPainting.closeups && currentPainting.closeups.length > 0 && (
                <div className="pt-6" style={{ borderTop: `1px solid ${theme.border}` }}>
                  <h4 className="text-sm font-light mb-3" style={{ color: theme.text }}>
                    Image Closeups
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCloseupIndex(null)}
                      className={`relative rounded overflow-hidden transition-all ${
                        selectedCloseupIndex === null ? 'ring-2 shadow-lg' : 'opacity-60 hover:opacity-80'
                      }`}
                      style={{ width: '70px', height: '52px' }}
                    >
                      <img
                        src={resolveImageUrl(currentPainting.imageUrl)}
                        alt="Main painting"
                        className="w-full h-full object-cover"
                      />
                      {selectedCloseupIndex === null && (
                        <div
                          className="absolute inset-0 ring-2 rounded pointer-events-none"
                          style={{ borderColor: theme.primary, borderWidth: '2px' }}
                        />
                      )}
                    </motion.button>
                    {currentPainting.closeups.map((closeup, index) => (
                      <motion.button
                        key={closeup.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCloseupIndex(index)}
                        className={`relative rounded overflow-hidden transition-all ${
                          selectedCloseupIndex === index ? 'ring-2 shadow-lg' : 'opacity-60 hover:opacity-80'
                        }`}
                        style={{ width: '70px', height: '52px' }}
                      >
                        <img
                          src={resolveImageUrl(closeup.imageUrl)}
                          alt={`Closeup ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {selectedCloseupIndex === index && (
                          <div
                            className="absolute inset-0 ring-2 rounded pointer-events-none"
                            style={{ borderColor: theme.primary, borderWidth: '2px' }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div
              className="relative w-full h-full flex items-center justify-center p-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeImageUrl}
                alt={paintingTitle}
                className="max-w-[95vw] max-h-[90vh] object-contain"
              />

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFullscreen(false)}
                className="absolute top-6 right-6 p-3 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
                aria-label="Close"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToPrevious}
                className="absolute left-6 p-3 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
                aria-label={t('carousel.previous')}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToNext}
                className="absolute right-6 p-3 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
                aria-label={t('carousel.next')}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
