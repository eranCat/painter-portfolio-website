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
      {paintings.map((painting) => (
        <motion.div
          key={painting.id}
          variants={itemVariants}
          onMouseEnter={() => setHoveredId(painting.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => setSelectedPainting(painting)}
          className="cursor-pointer overflow-hidden rounded-lg shadow-lg bg-white"
        >
          <div className="relative overflow-hidden h-64">
            <motion.img
              src={painting.imageUrl}
              alt={painting.title.en}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.4 }}
            />
            {hoveredId === painting.id && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 flex items-center justify-center"
              >
                <div className="text-white text-center px-4">
                  <p className="text-xs text-gray-300">{painting.dimensions}</p>
                </div>
              </motion.div>
            )}
          </div>

          <motion.div className="p-4">
            <h3 className="font-light text-lg mb-1">{painting.title[language as 'en' | 'he']}</h3>
            <p className="text-gray-500 text-sm mb-3">{painting.year}</p>
            <p className="text-gray-600 text-sm line-clamp-2">
              {painting.description[language as 'en' | 'he']}
            </p>
          </motion.div>
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
