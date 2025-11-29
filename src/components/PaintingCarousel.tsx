import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../contexts/ThemeContext';
import { getPaintings } from '../services/paintingService';
import { Painting } from '../types/painting';

export const PaintingCarousel = () => {
  const { t, isRTL, language } = useLanguage();
  const { theme } = useTheme();
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  // Load paintings from Firebase
  useEffect(() => {
    const loadPaintings = async () => {
      try {
        const firebasePaintings = await getPaintings();
        setPaintings(firebasePaintings);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load paintings:', error);
        setLoading(false);
      }
    };

    loadPaintings();
  }, []);

  // Load image from GitHub raw URL with perfect CORS support
  useEffect(() => {
    if (paintings.length === 0) return;

    const currentPainting = paintings[currentIndex];
    setImageUrl(''); // Reset before loading new image
    setImageDimensions(null); // Reset dimensions

    // Use GitHub raw content for images (perfect CORS support)
    const getImageUrl = (url: string): string => {
      // If it's a Firebase Storage URL (no CORS issues), use as-is
      if (url.includes('firebasestorage.googleapis.com')) {
        return url;
      }
      // If it's already a GitHub raw URL, use as-is
      if (url.includes('raw.githubusercontent.com')) {
        return url;
      }
      // For other URLs, assume it's a GitHub file path like: owner/repo/path/to/image.jpg
      // Convert to raw GitHub URL
      return `https://raw.githubusercontent.com/${url}`;
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Store original image dimensions
      setImageDimensions({ width: img.width, height: img.height });

      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 1024, 1024);

          const imgAspect = img.width / img.height;
          let drawWidth = 1024,
            drawHeight = 1024,
            offsetX = 0,
            offsetY = 0;

          if (imgAspect > 1) {
            drawHeight = 1024 / imgAspect;
            offsetY = (1024 - drawHeight) / 2;
          } else {
            drawWidth = 1024 * imgAspect;
            offsetX = (1024 - drawWidth) / 2;
          }

          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
          setImageUrl(canvas.toDataURL());
        }
      } catch (error) {
        console.warn('Canvas approach failed, using direct image URL:', error);
        // Fallback: use direct image
        setImageUrl(currentPainting.imageUrl);
      }
    };

    img.onerror = () => {
      console.warn(
        'Failed to load image from GitHub raw, using direct URL:',
        currentPainting.imageUrl
      );
      // Fallback to direct image URL
      setImageUrl(currentPainting.imageUrl);
    };

    // Load image from GitHub raw URL (perfect CORS support)
    img.src = getImageUrl(currentPainting.imageUrl);
  }, [currentIndex, paintings]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + paintings.length) % paintings.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % paintings.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="h-96 md:h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderBottomColor: theme.primary }}
          ></div>
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

  const currentPainting = paintings[currentIndex];
  const paintingTitle = language === 'he' ? currentPainting.title.he : currentPainting.title.en;
  const paintingDescription =
    language === 'he'
      ? currentPainting.description.he
      : currentPainting.description.en;

  return (
    <div className={`py-12 md:py-20 ${isRTL ? 'rtl' : 'ltr'}`} style={{ backgroundColor: theme.background }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Carousel container */}
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* Image section */}
          <div className="w-full lg:w-2/3">
            <div
              className="relative rounded-lg overflow-hidden shadow-lg aspect-[4/3] md:aspect-auto md:h-96 lg:h-[600px]"
              style={{ backgroundColor: theme.mode === 'dark' ? '#0a0a0a' : '#f5f3f0' }}
            >
              <AnimatePresence mode="wait">
                {imageUrl ? (
                  <motion.img
                    key={currentIndex}
                    src={imageUrl}
                    alt={paintingTitle}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <motion.div
                    key={`placeholder-${currentIndex}`}
                    className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-2">🖼️</div>
                      <p>{t('gallery.imageLoading')}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Image counter */}
              <div
                className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: theme.mode === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
                  color: theme.mode === 'dark' ? '#fff' : '#000'
                }}
              >
                {currentIndex + 1} / {paintings.length}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-4 mt-6 justify-center lg:justify-start">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToPrevious}
                className="p-3 rounded-full text-white transition-colors shadow-md"
                style={{ backgroundColor: theme.primary }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primaryHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.primary}
                aria-label={t('carousel.previous')}
              >
                <svg
                  className={`w-6 h-6 ${isRTL ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToNext}
                className="p-3 rounded-full text-white transition-colors shadow-md"
                style={{ backgroundColor: theme.primary }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primaryHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.primary}
                aria-label={t('carousel.next')}
              >
                <svg
                  className={`w-6 h-6 ${isRTL ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Info section */}
          <motion.div
            className="w-full lg:w-1/3"
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
                <p className="font-medium" style={{ color: theme.primary }}>{currentPainting.year}</p>
              </div>

              <div className="space-y-2">
                <p className="leading-relaxed" style={{ color: theme.textSecondary }}>
                  {paintingDescription}
                </p>
              </div>

              {imageDimensions && (
                <div className="pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
                  <p className="text-sm" style={{ color: theme.textSecondary }}>
                    {imageDimensions.width} × {imageDimensions.height} px
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Thumbnail dots */}
        <div className="mt-12 flex justify-center gap-2 flex-wrap">
          {paintings.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all rounded-full ${
                index === currentIndex
                  ? 'w-8'
                  : 'w-3 bg-gray-300 hover:bg-gray-400'
              }`}
              style={{
                height: '12px',
                backgroundColor: index === currentIndex ? theme.primary : undefined
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`${t('carousel.goToSlide')} ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
