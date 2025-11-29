import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { getPaintings } from '../services/paintingService';
import { Painting } from '../types/painting';

export const PaintingCarousel = () => {
  const { t, isRTL, language } = useLanguage();
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>('');

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

  // Load image with fallback for CORS-restricted images
  useEffect(() => {
    if (paintings.length === 0) return;

    const currentPainting = paintings[currentIndex];
    setImageUrl(''); // Reset before loading new image

    // Try canvas-based approach first (works with CORS-enabled images)
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
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
        // Fallback: use image directly (may show CORS warning but will still display)
        setImageUrl(currentPainting.imageUrl);
      }
    };

    img.onerror = () => {
      console.warn(
        'Canvas load failed for image, attempting direct load:',
        currentPainting.imageUrl
      );
      // Fallback to direct image URL even if CORS fails
      setImageUrl(currentPainting.imageUrl);
    };

    img.src = currentPainting.imageUrl;
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
      <div className="h-96 md:h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (paintings.length === 0) {
    return (
      <div className="h-96 md:h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">{t('gallery.noPaintings')}</p>
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
    <div className={`bg-white py-12 md:py-20 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Carousel container */}
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* Image section */}
          <div className="w-full lg:w-2/3">
            <div className="relative bg-gray-50 rounded-lg overflow-hidden shadow-lg aspect-square md:aspect-auto md:h-96 lg:h-[500px]">
              <AnimatePresence mode="wait">
                {imageUrl ? (
                  <motion.img
                    key={currentIndex}
                    src={imageUrl}
                    alt={paintingTitle}
                    className="w-full h-full object-contain"
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
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                {currentIndex + 1} / {paintings.length}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-4 mt-6 justify-center lg:justify-start">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToPrevious}
                className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md"
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
                className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md"
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
                <h3 className="text-3xl md:text-4xl font-light mb-2">
                  {paintingTitle}
                </h3>
                <p className="text-indigo-600 font-medium">{currentPainting.year}</p>
              </div>

              <div className="space-y-2">
                <p className="text-gray-600 leading-relaxed">
                  {paintingDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t('painting.category')}
                  </p>
                  <p className="font-medium text-gray-800">
                    {currentPainting.category}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t('painting.dimensions')}
                  </p>
                  <p className="font-medium text-gray-800">
                    {currentPainting.dimensions}
                  </p>
                </div>
              </div>
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
                  ? 'w-8 bg-indigo-600'
                  : 'w-3 bg-gray-300 hover:bg-gray-400'
              }`}
              style={{ height: '12px' }}
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
