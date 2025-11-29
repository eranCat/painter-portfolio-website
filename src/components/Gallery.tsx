import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getPaintings } from '../services/paintingService';
import { Painting } from '../types/painting';
import { useLanguage } from '../hooks/useLanguage';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export const Gallery = () => {
  const { t, language } = useLanguage();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);

  useEffect(() => {
    const loadPaintings = async () => {
      try {
        const firebasePaintings = await getPaintings();
        setPaintings(firebasePaintings);
      } catch (error) {
        console.error('Failed to load paintings from Firebase:', error);
        setPaintings([]);
      } finally {
        setLoading(false);
      }
    };

    loadPaintings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500 font-light">{t('gallery.loading')}</p>
      </div>
    );
  }

  if (paintings.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-gray-400 font-light text-lg">{t('gallery.noUploads')}</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {paintings.map((painting, index) => (
        <motion.div
          key={painting.id}
          variants={itemVariants}
          onMouseEnter={() => setHoveredId(painting.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => setSelectedPainting(painting)}
          className="cursor-pointer group relative"
          whileHover={{ y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {/* Gradient background glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />

          {/* Main card container */}
          <div className="relative bg-white rounded-xl shadow-lg overflow-hidden backdrop-blur-xl">
            <div className="relative overflow-hidden h-64 bg-gradient-to-br from-gray-900 to-gray-800">
              <motion.img
                src={painting.imageUrl}
                alt={painting.title.en}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.15 }}
                transition={{ duration: 0.5 }}
              />

              {/* Gradient overlay on hover */}
              {hoveredId === painting.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col items-end justify-end p-4"
                >
                  <div className="text-white text-right">
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-gray-300 font-light tracking-widest"
                    >
                      {painting.dimensions}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-xs text-purple-300 font-light mt-2"
                    >
                      {painting.category.charAt(0).toUpperCase() + painting.category.slice(1)}
                    </motion.p>
                  </div>
                </motion.div>
              )}

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-purple-500/30 to-transparent" />
            </div>

            {/* Card content */}
            <motion.div className="p-5">
              <div className="space-y-2">
                <h3 className="font-light text-lg bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300">
                  {painting.title[language as 'en' | 'he']}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-gray-400 text-sm font-light tracking-widest">
                    {painting.year}
                  </p>
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 font-light leading-relaxed">
                  {painting.description[language as 'en' | 'he']}
                </p>
              </div>

              {/* Bottom accent line */}
              <motion.div
                className="mt-4 h-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-transparent"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                style={{ originX: 0 }}
              />
            </motion.div>
          </div>
        </motion.div>
      ))}

      {selectedPainting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPainting(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-lg overflow-hidden max-w-4xl w-full max-h-screen flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 overflow-hidden bg-gray-100 flex items-center justify-center">
              <img
                src={selectedPainting.imageUrl}
                alt={selectedPainting.title.en}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="p-6 border-t border-gray-200">
              <h2 className="text-2xl font-light mb-2">{selectedPainting.title[language as 'en' | 'he']}</h2>
              <p className="text-gray-500 text-sm mb-3">{selectedPainting.year}</p>
              <p className="text-gray-600 mb-4">{selectedPainting.description[language as 'en' | 'he']}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{selectedPainting.dimensions}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPainting(null)}
                  className="px-6 py-2 bg-black text-white rounded-lg font-light hover:bg-gray-800"
                >
                  {t('gallery.close')}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};
