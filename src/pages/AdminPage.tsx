import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { AdminPanel } from '../components/AdminPanel';
import { motion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../contexts/ThemeContext';

export const AdminPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [user, setUser] = useState(auth.currentUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to logout');
    }
  };

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: theme.background }}
      >
        <motion.form
          onSubmit={handleLogin}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-8 rounded-lg shadow-lg max-w-md w-full space-y-4"
          style={{
            backgroundColor: theme.cardBg,
            color: theme.text,
          }}
        >
          <h1 className="text-3xl font-light mb-6 text-center">{t('admin.loginTitle')}</h1>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded text-sm"
              style={{
                backgroundColor: theme.mode === 'light' ? '#fee2e2' : '#7f1d1d',
                color: theme.mode === 'light' ? '#991b1b' : '#fecaca',
              }}
            >
              {error}
            </motion.div>
          )}

          <div className="p-3 rounded text-sm mb-4" style={{
            backgroundColor: theme.backgroundSecondary,
            color: theme.primary,
          }}>
            {t('admin.credentials')}
          </div>

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.mode === 'light' ? '#fff' : '#1a1a1a',
              color: theme.text,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = theme.primary;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme.border;
            }}
          />

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.mode === 'light' ? '#fff' : '#1a1a1a',
              color: theme.text,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = theme.primary;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme.border;
            }}
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg font-light disabled:opacity-50 transition-colors"
            style={{
              backgroundColor: theme.primary,
              color: theme.cardBg,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.primary;
            }}
          >
            {loading ? t('admin.loggingIn') : t('admin.login')}
          </motion.button>
        </motion.form>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-12 px-4"
      style={{ backgroundColor: theme.background }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light" style={{ color: theme.text }}>{t('admin.dashboard')}</h1>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/')}
              className="px-6 py-2 border rounded-lg font-light transition-colors"
              style={{
                borderColor: theme.border,
                color: theme.text,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.backgroundSecondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {t('admin.backToHome')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleLogout}
              className="px-6 py-2 rounded-lg font-light transition-colors"
              style={{
                backgroundColor: theme.mode === 'light' ? '#dc2626' : '#7f1d1d',
                color: '#fff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.mode === 'light' ? '#b91c1c' : '#991b1b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.mode === 'light' ? '#dc2626' : '#7f1d1d';
              }}
            >
              {t('admin.logout')}
            </motion.button>
          </div>
        </div>

        <AdminPanel />
      </div>
    </motion.div>
  );
};
