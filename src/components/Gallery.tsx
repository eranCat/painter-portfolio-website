import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getPaintings } from '../services/paintingService';
import { Painting } from '../types/painting';
import { useLanguage } from '../hooks/useLanguage';

export const Gallery = () => {
  const { t, language } = useLanguage();
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

  // Distribute paintings across walls (left, center, right)
  const paintingsPerWall = Math.ceil(paintings.length / 3);
  const leftWall = paintings.slice(0, paintingsPerWall);
  const centerWall = paintings.slice(paintingsPerWall, paintingsPerWall * 2);
  const rightWall = paintings.slice(paintingsPerWall * 2);

  const WallSection = ({
    paintings: wallPaintings,
    position
  }: {
    paintings: Painting[];
    position: 'left' | 'center' | 'right'
  }) => {
    const rotationY = position === 'left' ? 15 : position === 'right' ? -15 : 0;
    const translateX = position === 'left' ? -30 : position === 'right' ? 30 : 0;

    return (
      <motion.div
        style={{
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateY: rotationY,
          x: translateX,
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 30 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {wallPaintings.map((painting, index) => {
            const angleOffset = (index - Math.floor(wallPaintings.length / 2)) * 12;
            const verticalOffset = (index - Math.floor(wallPaintings.length / 2)) * 80;

            return (
              <motion.div
                key={painting.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                onClick={() => setSelectedPainting(painting)}
                className="absolute cursor-pointer"
                style={{
                  width: '280px',
                  height: '350px',
                  transform: `rotateZ(${angleOffset}deg) translateY(${verticalOffset}px)`,
                }}
              >
                <motion.div
                  whileHover={{
                    scale: 1.08,
                    rotateZ: 0,
                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))',
                  }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full relative group"
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Frame */}
                  <div className="absolute inset-0 bg-white rounded-sm shadow-2xl overflow-hidden"
                    style={{
                      boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 0 0 8px #f5f5f5',
                    }}>
                    {/* Inner frame mat */}
                    <div className="absolute inset-2 border-4 border-gray-100 pointer-events-none" />

                    {/* Image */}
                    <img
                      src={painting.imageUrl}
                      alt={painting.title.en}
                      className="w-full h-full object-cover"
                    />

                    {/* Hover overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/60 flex items-end justify-start p-4 backdrop-blur-sm"
                    >
                      <div className="text-white">
                        <p className="text-sm font-light mb-1">
                          {painting.title[language as 'en' | 'he']}
                        </p>
                        <p className="text-xs text-gray-300">{painting.year}</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Wall shadow effect */}
                  <div
                    className="absolute inset-0 rounded-sm pointer-events-none"
                    style={{
                      boxShadow: 'inset -8px 0 15px rgba(0,0,0,0.15)',
                    }}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden py-16">
      {/* 3D Gallery Space */}
      <div
        className="relative w-full h-[500px] md:h-[600px]"
        style={{
          perspective: '2000px',
        }}
      >
        {/* Left Wall */}
        <WallSection paintings={leftWall} position="left" />

        {/* Center Wall */}
        <WallSection paintings={centerWall} position="center" />

        {/* Right Wall */}
        <WallSection paintings={rightWall} position="right" />

        {/* Gallery floor */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-100 to-transparent pointer-events-none" />
      </div>

      {/* Gallery Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="relative z-10 text-center mt-12 max-w-2xl mx-auto px-4"
      >
        <p className="text-gray-600 font-light text-sm md:text-base">
          Explore the collection
        </p>
      </motion.div>

      {/* Modal for full view */}
      {selectedPainting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPainting(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-lg overflow-hidden max-w-4xl w-full max-h-screen flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 overflow-hidden bg-gray-100 flex items-center justify-center relative">
              <img
                src={selectedPainting.imageUrl}
                alt={selectedPainting.title.en}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="p-6 md:p-8 border-t border-gray-200">
              <h2 className="text-2xl md:text-3xl font-light mb-2">
                {selectedPainting.title[language as 'en' | 'he']}
              </h2>
              <p className="text-gray-500 text-sm mb-3">{selectedPainting.year}</p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                {selectedPainting.description[language as 'en' | 'he']}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">{selectedPainting.dimensions}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPainting(null)}
                  className="px-6 py-2 bg-black text-white rounded font-light hover:bg-gray-800 transition-colors"
                >
                  {t('gallery.close')}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
