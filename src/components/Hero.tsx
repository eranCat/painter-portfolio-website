import { motion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';

export const Hero = () => {
  const { t } = useLanguage();
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-800 flex items-center justify-center overflow-hidden"
    >
      {/* Animated gradient background orbs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-600/30 to-transparent rounded-full blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.4, scale: 1 }}
        transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', delay: 1 }}
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-600/20 to-transparent rounded-full blur-3xl"
      />

      {/* Animated gradient overlay */}
      <motion.div
        initial={{ opacity: 0.3 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-500/5 to-transparent"
      />

      {/* Decorative grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 text-center text-white px-4 max-w-4xl">
        {/* Decorative top accent */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="flex justify-center mb-6"
        >
          <div className="h-1 w-12 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-6xl md:text-8xl font-light tracking-wider mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-white"
        >
          {t('hero.title')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg md:text-xl font-light tracking-wide text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* CTA Button with gradient and glow */}
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          href="#gallery"
          className="inline-block relative px-8 py-3 font-light tracking-wider"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Button background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300" />

          {/* Button border with gradient */}
          <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-border rounded-lg opacity-100" />

          {/* Button content */}
          <span className="relative flex items-center justify-center text-white">
            {t('hero.cta')}
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="ml-2"
            >
              →
            </motion.span>
          </span>
        </motion.a>
      </div>

      {/* Animated scroll indicator */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.svg
          className="w-6 h-6 text-purple-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </motion.svg>
      </motion.div>
    </motion.section>
  );
};
