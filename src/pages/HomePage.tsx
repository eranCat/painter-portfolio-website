import { PaintingCarousel } from '../components/PaintingCarousel';
import { ContactForm } from '../components/ContactForm';
import { motion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { useState, useEffect } from 'react';
import { getAbout } from '../services/aboutService';
import { About } from '../types/about';
import { DrawingLine, DrawingCircle, DrawingRect } from '../components/DrawingAnimation';

export const HomePage = () => {
  const { t, isRTL } = useLanguage();
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
      <section id="about" className="py-20 bg-gray-50 relative">
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
            <h2 className="text-4xl md:text-5xl font-light mb-8">
              {t('nav.about')}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {about
                ? (isRTL ? about.description.he : about.description.en)
                : t('about.description')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {about ? (
                [
                  {
                    title: isRTL ? about.features.contemporary.title.he : about.features.contemporary.title.en,
                    description: isRTL ? about.features.contemporary.description.he : about.features.contemporary.description.en,
                  },
                  {
                    title: isRTL ? about.features.authentic.title.he : about.features.authentic.title.en,
                    description: isRTL ? about.features.authentic.description.he : about.features.authentic.description.en,
                  },
                  {
                    title: isRTL ? about.features.accessible.title.he : about.features.accessible.title.en,
                    description: isRTL ? about.features.accessible.description.he : about.features.accessible.description.en,
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="text-center"
                  >
                    <h3 className="text-xl font-light mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </motion.div>
                ))
              ) : (
                [
                  {
                    titleKey: 'features.contemporary',
                    descKey: 'features.contemporaryDesc',
                  },
                  {
                    titleKey: 'features.authentic',
                    descKey: 'features.authenticDesc',
                  },
                  {
                    titleKey: 'features.accessible',
                    descKey: 'features.accessibleDesc',
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="text-center"
                  >
                    <h3 className="text-xl font-light mb-2">{t(item.titleKey)}</h3>
                    <p className="text-gray-600">{t(item.descKey)}</p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="gallery" className="bg-white">
        <PaintingCarousel />
      </section>

      <section id="contact" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-light text-center mb-16"
          >
            {t('nav.contact')}
          </motion.h2>
          <ContactForm />
        </div>
      </section>

      <footer className={`bg-black text-white py-12 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-sm tracking-wide"
          >
            {t('footer.copyrightArtist').replace('{{year}}', new Date().getFullYear().toString())}
          </motion.p>
          <div className="flex justify-center gap-6">
            <a href="#gallery" className="text-gray-400 hover:text-white transition-colors text-sm">
              {t('footer.instagram')}
            </a>
            <a href="#about" className="text-gray-400 hover:text-white transition-colors text-sm">
              {t('footer.facebook')}
            </a>
            <a href="#contact" className="text-gray-400 hover:text-white transition-colors text-sm">
              {t('footer.contact')}
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
};
