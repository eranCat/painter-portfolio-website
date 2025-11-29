import { PaintingCarousel } from '../components/PaintingCarousel';
import { ContactForm } from '../components/ContactForm';
import { motion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { getAbout } from '../services/aboutService';
import { About } from '../types/about';
import { DrawingLine, DrawingCircle, DrawingRect } from '../components/DrawingAnimation';

export const HomePage = () => {
  const { t, isRTL } = useLanguage();
  const { theme } = useTheme();
  const [about, setAbout] = useState<About | null>(null);

  useEffect(() => {
    const loadAbout = async () => {
      try {
        const aboutData = await getAbout();
        if (aboutData) {
          setAbout(aboutData);
        }
      } catch (error) {
        console.error('Error loading about:', error);
      }
    };

    loadAbout();
  }, []);

  return (
    <main>
      <section id="about" className="py-20 relative" style={{ backgroundColor: theme.backgroundSecondary }}>
        <div className={`max-w-4xl mx-auto px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
          {/* Decorative corner animations */}
          <svg
            className="absolute top-10 left-10 w-24 h-24 opacity-15"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <DrawingRect x={20} y={20} width={160} height={160} stroke="#6366f1" strokeWidth={2} delay={0} duration={2} />
            <DrawingCircle cx={100} cy={100} r={50} stroke="#a855f7" strokeWidth={1.5} delay={0.5} duration={2} />
          </svg>

          <svg
            className="absolute bottom-10 right-10 w-32 h-32 opacity-15"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <DrawingCircle cx={100} cy={100} r={80} stroke="#3b82f6" strokeWidth={2} delay={0.3} duration={2} />
            <DrawingLine x1={20} y1={100} x2={180} y2={100} stroke="#3b82f6" strokeWidth={1} delay={0.8} duration={1.5} />
          </svg>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-6 relative z-10"
          >
            <h2 className="text-4xl md:text-5xl font-light mb-8" style={{ color: theme.text }}>
              {t('nav.about')}
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: theme.textSecondary }}>
              {about
                ? (isRTL ? about.description.he : about.description.en)
                : t('about.description')}
            </p>
          </motion.div>
        </div>
      </section>

      <section id="gallery" style={{ backgroundColor: theme.background }}>
        <PaintingCarousel />
      </section>

      <section id="contact" className="py-20" style={{ backgroundColor: theme.background }}>
        <div className="max-w-4xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-light text-center mb-16"
            style={{ color: theme.text }}
          >
            {t('nav.contact')}
          </motion.h2>
          <ContactForm />
        </div>
      </section>

      <footer className={`bg-black text-white py-12 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-sm tracking-wide"
          >
            {t('footer.copyrightArtist').replace('{{year}}', new Date().getFullYear().toString())}
          </motion.p>
        </div>
      </footer>
    </main>
  );
};
