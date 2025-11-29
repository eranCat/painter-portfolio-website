import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getPaintings } from '../services/paintingService';
import { Painting } from '../types/painting';

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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);

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
        <p className="text-gray-500 font-light">Loading gallery...</p>
      </div>
    );
  }

  if (paintings.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-gray-400 font-light text-lg">No uploads yet</p>
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
                  <p className="text-sm mb-2">${painting.price}</p>
                  <p className="text-xs text-gray-300">{painting.dimensions}</p>
                </div>
              </motion.div>
            )}
          </div>

          <motion.div className="p-4">
            <h3 className="font-light text-lg mb-1">{painting.title.en}</h3>
            <p className="text-gray-500 text-sm mb-3">{painting.year}</p>
            <p className="text-gray-600 text-sm line-clamp-2">
              {painting.description.en}
            </p>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
};
