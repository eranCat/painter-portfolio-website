import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getPaintings } from '../services/paintingService';
import { Painting } from '../types/painting';

const SAMPLE_PAINTINGS = [
  {
    id: '1',
    title: { en: 'Abstract Dreams', he: 'חלומות אבסטרקטיים' },
    description: { en: 'A vibrant exploration of color and form', he: 'חקר תוססים של צבע וטופס' },
    imageUrl: 'https://images.unsplash.com/photo-1578321272176-87b19197bf76?w=500&h=500&fit=crop',
    category: 'abstract',
    year: 2024,
    price: 2500,
    dimensions: '120x100cm',
    createdAt: new Date(),
    featured: true,
  },
  {
    id: '2',
    title: { en: 'Urban Landscape', he: 'נוף עירוני' },
    description: { en: 'Modern city through artistic lens', he: 'עיר מודרנית דרך עדשה אמנותית' },
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=500&fit=crop',
    category: 'landscape',
    year: 2024,
    price: 3000,
    dimensions: '150x100cm',
    createdAt: new Date(),
    featured: true,
  },
  {
    id: '3',
    title: { en: 'Nature\'s Palette', he: 'הפלטה של הטבע' },
    description: { en: 'Inspired by natural colors and patterns', he: 'בהשראת צבעים וקניינות טבעיים' },
    imageUrl: 'https://images.unsplash.com/photo-1578926078328-123456789?w=500&h=500&fit=crop',
    category: 'nature',
    year: 2023,
    price: 2800,
    dimensions: '100x100cm',
    createdAt: new Date(),
    featured: false,
  },
  {
    id: '4',
    title: { en: 'Ethereal Tones', he: 'טונים אתריים' },
    description: { en: 'Soft and delicate composition', he: 'יצירה רכה ודקה' },
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=500&fit=crop',
    category: 'abstract',
    year: 2023,
    price: 2200,
    dimensions: '90x90cm',
    createdAt: new Date(),
    featured: false,
  },
  {
    id: '5',
    title: { en: 'Geometric Harmony', he: 'הרמוניה גיאומטרית' },
    description: { en: 'Balance between lines and shapes', he: 'איזון בין קווים וצורות' },
    imageUrl: 'https://images.unsplash.com/photo-1578321272176-87b19197bf76?w=500&h=500&fit=crop',
    category: 'abstract',
    year: 2024,
    price: 2600,
    dimensions: '110x110cm',
    createdAt: new Date(),
    featured: true,
  },
  {
    id: '6',
    title: { en: 'Sunset Reflections', he: 'השתקפויות שקיעה' },
    description: { en: 'Inspired by evening light', he: 'בהשראת אור הערב' },
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=500&fit=crop',
    category: 'landscape',
    year: 2023,
    price: 3200,
    dimensions: '160x100cm',
    createdAt: new Date(),
    featured: true,
  },
];

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
  const [paintings, setPaintings] = useState<Painting[]>(SAMPLE_PAINTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPaintings = async () => {
      try {
        const firebasePaintings = await getPaintings();
        if (firebasePaintings.length > 0) {
          setPaintings(firebasePaintings);
        }
      } catch (error) {
        console.error('Failed to load paintings from Firebase:', error);
        // Fall back to sample paintings
      } finally {
        setLoading(false);
      }
    };

    loadPaintings();
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {SAMPLE_PAINTINGS.map((painting) => (
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
