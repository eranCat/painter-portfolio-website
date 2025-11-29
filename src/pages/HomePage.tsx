import { Hero } from '../components/Hero';
import { Gallery } from '../components/Gallery';
import { ContactForm } from '../components/ContactForm';
import { motion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { useState, useEffect } from 'react';
import { getAbout } from '../services/aboutService';
import { About } from '../types/about';

export const HomePage = () => {
  const { t, isRTL } = useLanguage();
  const [about, setAbout] = useState<About | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAbout = async () => {
      try {
        const aboutData = await getAbout();
        if (aboutData) {
          setAbout(aboutData);
        }
      } catch (error) {
        console.error('Error loading about:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAbout();
  }, []);

  return (
    <main>
      <section id="about" className="relative py-24 bg-gradient-to-br from-gray-50 via-white to-purple-50/30 overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.4, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-400/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.3, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.5, delay: 0.2 }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400/15 to-transparent rounded-full blur-3xl"
        />

        <div className={`relative z-10 max-w-4xl mx-auto px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center mb-12"
            >
              <div className="h-1 w-12 bg-gradient-to-r from-transparent via-purple-400 to-transparent mb-6"></div>
              <h2 className="text-5xl md:text-6xl font-light bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-600 to-gray-900">
                {t('nav.about')}
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-700 leading-relaxed text-center max-w-3xl mx-auto"
            >
              {about
                ? (isRTL ? about.description.he : about.description.en)
                : t('about.description')}
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
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
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="relative group"
                  >
                    {/* Gradient glow background on hover */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />

                    {/* Card content */}
                    <div className="relative bg-white rounded-xl p-8 backdrop-blur-xl border border-white/50 group-hover:border-purple-200 transition-all duration-300">
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + idx * 0.1, duration: 0.5 }}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mb-4 flex items-center justify-center text-white text-xl font-light"
                      >
                        {idx + 1}
                      </motion.div>
                      <h3 className="text-xl font-light bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 font-light leading-relaxed">{item.description}</p>

                      {/* Bottom accent line */}
                      <motion.div
                        className="mt-4 h-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-transparent"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + idx * 0.1, duration: 0.6 }}
                        style={{ originX: 0 }}
                      />
                    </div>
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
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="relative group"
                  >
                    {/* Gradient glow background on hover */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />

                    {/* Card content */}
                    <div className="relative bg-white rounded-xl p-8 backdrop-blur-xl border border-white/50 group-hover:border-purple-200 transition-all duration-300">
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + idx * 0.1, duration: 0.5 }}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mb-4 flex items-center justify-center text-white text-xl font-light"
                      >
                        {idx + 1}
                      </motion.div>
                      <h3 className="text-xl font-light bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300 mb-3">
                        {t(item.titleKey)}
                      </h3>
                      <p className="text-gray-600 font-light leading-relaxed">{t(item.descKey)}</p>

                      {/* Bottom accent line */}
                      <motion.div
                        className="mt-4 h-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-transparent"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + idx * 0.1, duration: 0.6 }}
                        style={{ originX: 0 }}
                      />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Hero />

      <section id="gallery" className="relative py-24 bg-white overflow-hidden">
        {/* Animated background orbs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 0.3, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.5 }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 0.2, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 3, delay: 0.3 }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-tl from-blue-400/15 to-transparent rounded-full blur-3xl"
        />

        <div className={`relative z-10 max-w-7xl mx-auto px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center mb-20"
          >
            <div className="h-1 w-12 bg-gradient-to-r from-transparent via-purple-400 to-transparent mb-6"></div>
            <h2 className="text-5xl md:text-6xl font-light bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-600 to-gray-900">
              {t('nav.gallery')}
            </h2>
          </motion.div>
          <Gallery />
        </div>
      </section>

      <section id="contact" className="relative py-24 bg-gradient-to-br from-white via-purple-50/20 to-white overflow-hidden">
        {/* Animated background accent */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.25, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
          className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-l from-purple-400/20 to-transparent rounded-full blur-3xl"
        />

        <div className={`relative z-10 max-w-4xl mx-auto px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center mb-16"
          >
            <div className="h-1 w-12 bg-gradient-to-r from-transparent via-purple-400 to-transparent mb-6"></div>
            <h2 className="text-5xl md:text-6xl font-light bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-600 to-gray-900">
              {t('nav.contact')}
            </h2>
          </motion.div>
          <ContactForm />
        </div>
      </section>

      <footer className={`relative bg-gradient-to-br from-gray-950 via-slate-900 to-gray-800 text-white py-16 overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Animated background orbs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-bl from-purple-600/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', delay: 1 }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-600/15 to-transparent rounded-full blur-3xl"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-sm tracking-widest text-gray-300 font-light"
            >
              {t('footer.copyrightArtist').replace('{{year}}', new Date().getFullYear().toString())}
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-8"
          >
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative group px-4 py-2"
            >
              <span className="text-gray-300 group-hover:text-purple-300 transition-colors text-sm font-light tracking-wide">
                {t('footer.instagram')}
              </span>
              <motion.div
                className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-purple-500 to-transparent"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
                style={{ originX: 0 }}
              />
            </motion.a>

            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative group px-4 py-2"
            >
              <span className="text-gray-300 group-hover:text-purple-300 transition-colors text-sm font-light tracking-wide">
                {t('footer.facebook')}
              </span>
              <motion.div
                className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-purple-500 to-transparent"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
                style={{ originX: 0 }}
              />
            </motion.a>

            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative group px-4 py-2"
            >
              <span className="text-gray-300 group-hover:text-purple-300 transition-colors text-sm font-light tracking-wide">
                {t('footer.contact')}
              </span>
              <motion.div
                className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-purple-500 to-transparent"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
                style={{ originX: 0 }}
              />
            </motion.a>
          </motion.div>

          {/* Top accent line */}
          <motion.div
            className="h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{ originX: 0.5 }}
          />
        </div>
      </footer>
    </main>
  );
};
