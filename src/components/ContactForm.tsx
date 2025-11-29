import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { ContactFormData } from '../types/contact';
import { addContact } from '../services/contactService';
import { DrawingLine, DrawingCircle, AnimatedPath } from './DrawingAnimation';

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
    <div className="relative">
      {/* Decorative animations */}
      <svg
        className="absolute -top-16 left-1/4 w-32 h-32 opacity-10 pointer-events-none"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <DrawingCircle cx={100} cy={100} r={80} stroke="#ec4899" strokeWidth={2} delay={0} duration={2.5} />
        <DrawingLine x1={20} y1={100} x2={180} y2={100} stroke="#ec4899" strokeWidth={1.5} delay={0.7} duration={2} />
      </svg>

      <svg
        className="absolute -bottom-16 right-1/4 w-40 h-40 opacity-10 pointer-events-none"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <DrawingCircle cx={100} cy={100} r={70} stroke="#06b6d4" strokeWidth={2} delay={0.3} duration={2.5} />
        <DrawingCircle cx={100} cy={100} r={40} stroke="#ec4899" strokeWidth={1.5} delay={0.8} duration={2} />
        <AnimatedPath d="M 100 30 Q 140 70 100 100 Q 60 130 100 170" stroke="#06b6d4" strokeWidth={1} delay={1.2} duration={2.5} />
      </svg>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg space-y-6 relative z-10 ${
          isRTL ? 'rtl' : 'ltr'
        }`}
      >
      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 bg-green-100 text-green-700 rounded-lg"
        >
          {t('contact.success')}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-100 text-red-700 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type="text"
          name="name"
          placeholder={t('contact.name')}
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
        />

        <motion.input
          whileFocus={{ scale: 1.02 }}
          type="email"
          name="email"
          placeholder={t('contact.email')}
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
        />
      </div>

      <motion.input
        whileFocus={{ scale: 1.02 }}
        type="tel"
        name="phone"
        placeholder={t('contact.phone')}
        value={formData.phone}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
      />

      <motion.textarea
        whileFocus={{ scale: 1.02 }}
        name="message"
        placeholder={t('contact.message')}
        value={formData.message}
        onChange={handleChange}
        required
        rows={6}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all resize-none"
      />

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="w-full bg-black text-white py-3 rounded-lg font-light tracking-wider hover:bg-gray-800 transition-colors"
      >
        {t('contact.send')}
      </motion.button>
    </motion.form>
    </div>
  );
};
