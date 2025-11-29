import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { ContactFormData } from '../types/contact';
import { addContact } from '../services/contactService';

export const ContactForm = () => {
  const { t, isRTL } = useLanguage();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Save to Firebase
      await addContact(formData);

      // Send email automatically
      const artistEmail = 'davidpg126@gmail.com';
      const emailSubject = `New Contact from ${formData.name}`;
      const emailBody = `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nMessage:\n${formData.message}`;
      const mailtoUrl = `mailto:${artistEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoUrl;

      // Show success message
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });

      // Reset success message after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(t('contact.error'));
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative max-w-2xl mx-auto space-y-6 ${
        isRTL ? 'rtl' : 'ltr'
      }`}
    >
      {/* Gradient glow background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />

      {/* Form content wrapper */}
      <div className="relative bg-white rounded-xl p-8 backdrop-blur-xl border border-white/50">
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 rounded-lg mb-4"
          >
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-light"
            >
              {t('contact.success')}
            </motion.p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 rounded-lg mb-4"
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div className="relative group">
            <motion.input
              whileFocus={{ scale: 1.02, borderColor: '#a855f7' }}
              type="text"
              name="name"
              placeholder={t('contact.name')}
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-light"
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
              aria-hidden="true"
            />
          </motion.div>

          <motion.div className="relative group">
            <motion.input
              whileFocus={{ scale: 1.02, borderColor: '#a855f7' }}
              type="email"
              name="email"
              placeholder={t('contact.email')}
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-light"
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
              aria-hidden="true"
            />
          </motion.div>
        </div>

        <motion.div className="relative group">
          <motion.input
            whileFocus={{ scale: 1.02, borderColor: '#a855f7' }}
            type="tel"
            name="phone"
            placeholder={t('contact.phone')}
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-light"
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
            aria-hidden="true"
          />
        </motion.div>

        <motion.div className="relative group">
          <motion.textarea
            whileFocus={{ scale: 1.02, borderColor: '#a855f7' }}
            name="message"
            placeholder={t('contact.message')}
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none font-light"
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
            aria-hidden="true"
          />
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)' }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="relative w-full py-3 rounded-lg font-light tracking-wider text-white overflow-hidden group"
        >
          {/* Button gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:from-purple-700 group-hover:to-blue-700 transition-all duration-300" />

          {/* Animated shimmer effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />

          <span className="relative flex items-center justify-center">
            {t('contact.send')}
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="ml-2"
            >
              →
            </motion.span>
          </span>
        </motion.button>

        {/* Animated accent line */}
        <motion.div
          className="h-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{ originX: 0 }}
        />
      </div>
    </motion.form>
  );
};
