import { motion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { DrawingLine, DrawingCircle } from './DrawingAnimation';

export const Hero = () => {
  const { t } = useLanguage();
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center overflow-hidden"
    >
      {/* Background animation */}
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-500/10 to-transparent"
      />

      {/* Decorative drawing animations */}
      <svg
        className="absolute top-20 left-10 w-32 h-32 opacity-20"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <DrawingCircle cx={100} cy={100} r={80} stroke="#a855f7" strokeWidth={2} delay={0} duration={2} />
        <DrawingCircle cx={100} cy={100} r={50} stroke="#3b82f6" strokeWidth={2} delay={0.3} duration={2} />
        <DrawingLine x1={20} y1={100} x2={180} y2={100} stroke="#a855f7" strokeWidth={1} delay={0.6} duration={1.5} />
        <DrawingLine x1={100} y1={20} x2={100} y2={180} stroke="#a855f7" strokeWidth={1} delay={0.6} duration={1.5} />
      </svg>

      <svg
        className="absolute bottom-20 right-10 w-40 h-40 opacity-20"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <DrawingCircle cx={100} cy={100} r={70} stroke="#3b82f6" strokeWidth={2} delay={0.5} duration={2} />
        <DrawingLine x1={30} y1={30} x2={170} y2={170} stroke="#3b82f6" strokeWidth={1.5} delay={1} duration={1.8} />
        <DrawingLine x1={170} y1={30} x2={30} y2={170} stroke="#3b82f6" strokeWidth={1.5} delay={1} duration={1.8} />
      </svg>

      <div className="relative z-10 text-center text-white px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-6xl md:text-8xl font-light tracking-wider mb-6"
        >
          {t('hero.title')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl md:text-2xl font-light tracking-wide text-gray-300 mb-8 max-w-2xl mx-auto"
        >
          {t('hero.subtitle')}
        </motion.p>

        <motion.a
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          href="#gallery"
          className="inline-block px-8 py-3 border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t('hero.cta')}
        </motion.a>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </motion.div>
    </motion.section>
  );
};
