import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../contexts/ThemeContext';
import { getPaintings } from '../services/paintingService';
import { Painting } from '../types/painting';

// Helper function to convert image URLs to GitHub raw URLs
const getImageUrlFromPath = (url: string): string => {
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

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = getImageUrlFromPath(currentPainting.imageUrl);

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
    <div className={`py-12 md:py-20 ${isRTL ? 'rtl' : 'ltr'}`} style={{ backgroundColor: 'transparent' }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Carousel container - Stack vertically on mobile, horizontal on lg */}
        <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
          {/* Image section */}
          <div className="w-full lg:w-2/3 flex-shrink-0">
            <div
              className="relative rounded-lg overflow-hidden shadow-lg w-full h-96 md:h-[500px] lg:h-[550px]"
              style={{
                backgroundColor: theme.mode === 'dark' ? '#1a1a1a' : '#f9f6f0',
                backgroundImage: theme.mode === 'dark'
                  ? 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.06) 2px, rgba(255, 255, 255, 0.06) 4px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255, 255, 255, 0.06) 2px, rgba(255, 255, 255, 0.06) 4px), repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255, 255, 255, 0.04) 4px, rgba(255, 255, 255, 0.04) 8px), repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(255, 255, 255, 0.04) 4px, rgba(255, 255, 255, 0.04) 8px)'
                  : 'url("data:image/svg+xml;utf8,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"200\\" height=\\"200\\"><defs><filter id=\\"paperNoise\\"><feTurbulence type=\\"fractalNoise\\" baseFrequency=\\"0.65\\" numOctaves=\\"6\\" result=\\"noise\\" seed=\\"1\\" /><feDisplacementMap in=\\"SourceGraphic\\" in2=\\"noise\\" scale=\\"4\\" /></filter></defs><rect width=\\"200\\" height=\\"200\\" fill=\\"%23f9f6f0\\" filter=\\"url(%23paperNoise)\\"/></svg>"), repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(139, 115, 85, 0.15) 1px, rgba(139, 115, 85, 0.15) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(139, 115, 85, 0.15) 1px, rgba(139, 115, 85, 0.15) 2px), repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(139, 115, 85, 0.10) 3px, rgba(139, 115, 85, 0.10) 6px), repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(139, 115, 85, 0.10) 3px, rgba(139, 115, 85, 0.10) 6px)'
              }}
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
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      backgroundColor: theme.mode === 'dark' ? '#1a1a1a' : '#f9f6f0',
                      backgroundImage: theme.mode === 'dark'
                        ? 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.06) 2px, rgba(255, 255, 255, 0.06) 4px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255, 255, 255, 0.06) 2px, rgba(255, 255, 255, 0.06) 4px), repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255, 255, 255, 0.04) 4px, rgba(255, 255, 255, 0.04) 8px), repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(255, 255, 255, 0.04) 4px, rgba(255, 255, 255, 0.04) 8px)'
                        : 'url("data:image/svg+xml;utf8,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"200\\" height=\\"200\\"><defs><filter id=\\"paperNoise\\"><feTurbulence type=\\"fractalNoise\\" baseFrequency=\\"0.65\\" numOctaves=\\"6\\" result=\\"noise\\" seed=\\"1\\" /><feDisplacementMap in=\\"SourceGraphic\\" in2=\\"noise\\" scale=\\"4\\" /></filter></defs><rect width=\\"200\\" height=\\"200\\" fill=\\"%23f9f6f0\\" filter=\\"url(%23paperNoise)\\"/></svg>"), repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(139, 115, 85, 0.15) 1px, rgba(139, 115, 85, 0.15) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(139, 115, 85, 0.15) 1px, rgba(139, 115, 85, 0.15) 2px), repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(139, 115, 85, 0.10) 3px, rgba(139, 115, 85, 0.10) 6px), repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(139, 115, 85, 0.10) 3px, rgba(139, 115, 85, 0.10) 6px)'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center" style={{ color: theme.textSecondary }}>
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

            {/* Navigation buttons with thumbnails between */}
            <div className="mt-6 flex items-center justify-center lg:justify-start gap-4">
              {/* Previous button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToPrevious}
                className="p-3 rounded-full text-white transition-colors shadow-md flex-shrink-0"
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

              {/* Image thumbnails */}
              <div className="flex gap-3 flex-wrap justify-center lg:justify-start">
                {paintings.map((painting, index) => (
                  <motion.button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`relative rounded overflow-hidden transition-all ${
                      index === currentIndex ? 'ring-2 shadow-lg' : 'opacity-60 hover:opacity-80'
                    }`}
                    style={{
                      width: '70px',
                      height: '52px'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`${t('carousel.goToSlide')} ${index + 1}`}
                  >
                    <img
                      src={getImageUrlFromPath(painting.imageUrl)}
                      alt={painting.title.en}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="70" height="52"%3E%3Crect fill="%23e5e7eb" width="70" height="52"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="9"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
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

              {/* Next button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToNext}
                className="p-3 rounded-full text-white transition-colors shadow-md flex-shrink-0"
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
      </div>
    </div>
  );
};
