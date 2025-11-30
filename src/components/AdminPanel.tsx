import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../contexts/ThemeContext';
import { getPaintings, deletePainting, addPainting, updatePainting } from '../services/paintingService';
import { getContacts, deleteContact } from '../services/contactService';
import { getAbout, updateAbout } from '../services/aboutService';
import { uploadImageToGithub } from '../services/githubUploadService';
import { Painting, CloseupImage } from '../types/painting';
import { Contact } from '../types/contact';

interface FormData {
  titleEn: string;
  titleHe: string;
  descriptionEn: string;
  descriptionHe: string;
  imageUrl: string;
  year: number;
  dimensions: string;
  closeups?: CloseupImage[];
}

interface AboutFormData {
  descriptionEn: string;
  descriptionHe: string;
}

export const AdminPanel = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [tab, setTab] = useState<'paintings' | 'contacts' | 'about'>('paintings');
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const closeupInputRef = useRef<HTMLInputElement>(null);
  const [closeupLoading, setCloseupLoading] = useState(false);

  // Convert GitHub path to full raw URL (same logic as carousel)
  const getImageUrl = (url: string): string => {
    if (url.includes('firebasestorage.googleapis.com')) {
      return url;
    }
    if (url.includes('raw.githubusercontent.com')) {
      return url;
    }
    return `https://raw.githubusercontent.com/${url}`;
  };

  // Load GitHub credentials from environment variables
  const githubToken = process.env.REACT_APP_GITHUB_TOKEN || '';
  const githubOwner = process.env.REACT_APP_GITHUB_OWNER || '';
  const githubRepo = process.env.REACT_APP_GITHUB_REPO || '';
  const hasGithubConfig = githubToken && githubOwner && githubRepo;
  const [formData, setFormData] = useState<FormData>({
    titleEn: '',
    titleHe: '',
    descriptionEn: '',
    descriptionHe: '',
    imageUrl: '',
    year: new Date().getFullYear(),
    dimensions: '',
    closeups: [],
  });
  const [aboutFormData, setAboutFormData] = useState<AboutFormData>({
    descriptionEn: '',
    descriptionHe: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const paintingsPromise = getPaintings().catch((error) => {
        console.error('Error loading paintings:', error);
        return [];
      });
      const contactsPromise = getContacts().catch((error) => {
        console.error('Error loading contacts:', error);
        return [];
      });
      const aboutPromise = getAbout().catch((error) => {
        console.error('Error loading about:', error);
        return null;
      });

      const [paintingsData, contactsData, aboutData] = await Promise.all([
        paintingsPromise,
        contactsPromise,
        aboutPromise,
      ]);

      setPaintings(paintingsData || []);
      setContacts(contactsData || []);
      if (aboutData) {
        setAboutFormData({
          descriptionEn: aboutData.description.en,
          descriptionHe: aboutData.description.he,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePainting = async (id: string) => {
    if (window.confirm(t('admin.confirmDelete'))) {
      try {
        await deletePainting(id);
        setPaintings(paintings.filter((p) => p.id !== id));
        alert(t('admin.deleteSuccess'));
      } catch (error) {
        console.error('Error deleting painting:', error);
        alert(t('admin.deleteError'));
      }
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm(t('admin.confirmDelete'))) {
      try {
        await deleteContact(id);
        setContacts(contacts.filter((c) => c.id !== id));
        alert(t('admin.deleteSuccess'));
      } catch (error) {
        console.error('Error deleting contact:', error);
        alert(t('admin.deleteError'));
      }
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      titleEn: '',
      titleHe: '',
      descriptionEn: '',
      descriptionHe: '',
      imageUrl: '',
      year: new Date().getFullYear(),
      dimensions: '',
      closeups: [],
    });
    setShowForm(true);
  };

  const handleEditClick = (painting: Painting) => {
    setEditingId(painting.id);
    setFormData({
      titleEn: painting.title.en,
      titleHe: painting.title.he,
      descriptionEn: painting.description.en,
      descriptionHe: painting.description.he,
      imageUrl: painting.imageUrl,
      year: painting.year,
      dimensions: painting.dimensions,
      closeups: painting.closeups || [],
    });
    setShowForm(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const imageUrl = formData.imageUrl;

      if (!imageUrl) {
        alert(t('admin.provideImageUrl'));
        return;
      }

      if (editingId) {
        await updatePainting(editingId, {
          title: { en: formData.titleEn, he: formData.titleHe },
          description: { en: formData.descriptionEn, he: formData.descriptionHe },
          imageUrl,
          year: formData.year,
          dimensions: formData.dimensions,
          closeups: formData.closeups,
        });
        const updatedPaintings = paintings.map((p) =>
          p.id === editingId
            ? {
                ...p,
                title: { en: formData.titleEn, he: formData.titleHe },
                description: { en: formData.descriptionEn, he: formData.descriptionHe },
                imageUrl,
                year: formData.year,
                dimensions: formData.dimensions,
                closeups: formData.closeups,
              }
            : p
        );
        setPaintings(updatedPaintings);
      } else {
        await addPainting(
          {
            titleEn: formData.titleEn,
            titleHe: formData.titleHe,
            descriptionEn: formData.descriptionEn,
            descriptionHe: formData.descriptionHe,
            year: formData.year,
            dimensions: formData.dimensions,
          },
          imageUrl
        );
        await loadData();
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error saving painting:', error);
      alert('Error saving painting. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmitAboutForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      await updateAbout({
        description: {
          en: aboutFormData.descriptionEn,
          he: aboutFormData.descriptionHe,
        },
        features: {
          contemporary: {
            title: { en: '', he: '' },
            description: { en: '', he: '' },
          },
          authentic: {
            title: { en: '', he: '' },
            description: { en: '', he: '' },
          },
          accessible: {
            title: { en: '', he: '' },
            description: { en: '', he: '' },
          },
        },
      });
      await loadData();
      alert('About section updated successfully!');
    } catch (error) {
      console.error('Error saving about:', error);
      alert('Error saving about. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFileUploadToGithub = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!hasGithubConfig) {
      alert('GitHub credentials not configured in environment variables');
      fileInputRef.current?.click(); // Reset file input
      return;
    }

    setFormLoading(true);
    try {
      const result = await uploadImageToGithub(file, githubToken, githubOwner, githubRepo);

      if (result.success && result.path) {
        setFormData({ ...formData, imageUrl: result.path });
        alert('Image uploaded to GitHub successfully!');
      } else {
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error uploading to GitHub:', error);
      alert('Error uploading image to GitHub');
    } finally {
      setFormLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleQuickAddDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleQuickAddDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (!hasGithubConfig) {
        alert('GitHub credentials not configured in environment variables');
        return;
      }

      setFormLoading(true);
      try {
        const result = await uploadImageToGithub(file, githubToken, githubOwner, githubRepo);

        if (result.success && result.path) {
          // Open the form with the uploaded image
          setEditingId(null);
          setFormData({
            titleEn: '',
            titleHe: '',
            descriptionEn: '',
            descriptionHe: '',
            imageUrl: result.path,
            year: new Date().getFullYear(),
            dimensions: '',
            closeups: [],
          });
          setShowForm(true);
        } else {
          alert(`Upload failed: ${result.error}`);
        }
      } catch (error) {
        console.error('Error uploading to GitHub:', error);
        alert('Error uploading image to GitHub');
      } finally {
        setFormLoading(false);
      }
    }
  };

  const handleAddCloseup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!hasGithubConfig) {
      alert('GitHub credentials not configured in environment variables');
      if (closeupInputRef.current) {
        closeupInputRef.current.value = '';
      }
      return;
    }

    setCloseupLoading(true);
    try {
      const uploadPromises = Array.from(files).map(file =>
        uploadImageToGithub(file, githubToken, githubOwner, githubRepo)
      );

      const results = await Promise.all(uploadPromises);
      const newCloseups: CloseupImage[] = [];

      results.forEach((result, index) => {
        if (result.success && result.path) {
          newCloseups.push({
            id: `${Date.now()}-${index}`,
            imageUrl: result.path,
            title: { en: '', he: '' },
          });
        }
      });

      if (newCloseups.length > 0) {
        setFormData({
          ...formData,
          closeups: [...(formData.closeups || []), ...newCloseups],
        });
        alert(`${newCloseups.length} closeup image${newCloseups.length > 1 ? 's' : ''} added successfully!`);
      } else {
        alert('All uploads failed. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading closeups:', error);
      alert('Error uploading closeup images');
    } finally {
      setCloseupLoading(false);
      if (closeupInputRef.current) {
        closeupInputRef.current.value = '';
      }
    }
  };

  const handleRemoveCloseup = (closeupId: string) => {
    setFormData({
      ...formData,
      closeups: formData.closeups?.filter((c) => c.id !== closeupId) || [],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-lg shadow-lg p-8"
      style={{
        backgroundColor: theme.cardBg,
        color: theme.text,
      }}
    >
      {/* Tabs */}
      <div
        className="flex gap-4 mb-8 border-b transition-colors"
        style={{ borderColor: theme.border }}
      >
        <button
          onClick={() => setTab('paintings')}
          className="pb-3 px-4 font-light tracking-wide transition-colors"
          style={{
            borderBottom: tab === 'paintings' ? `2px solid ${theme.primary}` : 'none',
            color: tab === 'paintings' ? theme.text : theme.textSecondary,
          }}
        >
          {t('admin.paintings')}
        </button>
        <button
          onClick={() => setTab('contacts')}
          className="pb-3 px-4 font-light tracking-wide transition-colors"
          style={{
            borderBottom: tab === 'contacts' ? `2px solid ${theme.primary}` : 'none',
            color: tab === 'contacts' ? theme.text : theme.textSecondary,
          }}
        >
          {t('admin.contacts')}
        </button>
        <button
          onClick={() => setTab('about')}
          className="pb-3 px-4 font-light tracking-wide transition-colors"
          style={{
            borderBottom: tab === 'about' ? `2px solid ${theme.primary}` : 'none',
            color: tab === 'about' ? theme.text : theme.textSecondary,
          }}
        >
          {t('nav.about')}
        </button>
      </div>

      {/* Paintings Tab */}
      {tab === 'paintings' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="mb-6 flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddClick}
              className="px-6 py-2 rounded-lg font-light transition-colors"
              style={{
                backgroundColor: theme.primary,
                color: theme.mode === 'light' ? '#ffffff' : theme.text,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.primary;
              }}
            >
              + {t('admin.addPainting')}
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.02, borderColor: theme.primary }}
              onDragOver={handleQuickAddDragOver}
              onDrop={handleQuickAddDrop}
              className="flex-1 border-2 border-dashed rounded-lg px-6 py-2 text-center cursor-pointer transition-colors"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.backgroundSecondary,
              }}
            >
              {formLoading ? (
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  Uploading...
                </p>
              ) : (
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  📸 Drag & drop image here to add painting
                </p>
              )}
            </motion.div>
          </div>

          {loading ? (
            <div className="text-center py-8" style={{ color: theme.textSecondary }}>
              {t('admin.loading')}
            </div>
          ) : paintings.length === 0 ? (
            <div className="text-center py-8" style={{ color: theme.textSecondary }}>
              {t('admin.noPaintingsYet')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead style={{ backgroundColor: theme.backgroundSecondary, borderColor: theme.border }} className="border-b">
                  <tr>
                    <th className="px-4 py-3 font-light">Image</th>
                    <th className="px-4 py-3 font-light">{t('admin.tableHeaders.title')}</th>
                    <th className="px-4 py-3 font-light">{t('admin.tableHeaders.year')}</th>
                    <th className="px-4 py-3 font-light">Dimensions</th>
                    <th className="px-4 py-3 font-light">{t('admin.tableHeaders.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paintings.map((painting) => (
                    <motion.tr
                      key={painting.id}
                      className="border-b transition-colors"
                      style={{ borderColor: theme.border }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.backgroundSecondary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td className="px-4 py-3">
                        <img
                          src={getImageUrl(painting.imageUrl)}
                          alt={painting.title.en}
                          className="h-12 w-12 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23f0f0f0" width="48" height="48"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                          onLoad={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            const dimSpan = img.parentElement?.nextElementSibling?.nextElementSibling?.nextElementSibling?.querySelector('.dimensions');
                            if (dimSpan && img.naturalWidth && img.naturalHeight) {
                              dimSpan.textContent = `${img.naturalWidth} × ${img.naturalHeight} px`;
                            }
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">{painting.title.en}</td>
                      <td className="px-4 py-3">{painting.year}</td>
                      <td className="px-4 py-3">
                        <span className="dimensions text-xs" style={{ color: theme.textSecondary }}>
                          Loading...
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditClick(painting)}
                          className="px-3 py-1 text-xs rounded transition-colors"
                          style={{
                            borderColor: theme.border,
                            border: `1px solid ${theme.border}`,
                            color: theme.text,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme.backgroundSecondary;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {t('admin.edit')}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeletePainting(painting.id)}
                          className="px-3 py-1 text-xs rounded transition-colors"
                          style={{
                            backgroundColor: theme.mode === 'light' ? '#fee2e2' : 'rgba(239, 68, 68, 0.2)',
                            color: theme.mode === 'light' ? '#b91c1c' : '#ff6b6b',
                          }}
                        >
                          {t('admin.delete')}
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Contacts Tab */}
      {tab === 'contacts' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="text-center py-8" style={{ color: theme.textSecondary }}>
              {t('admin.loading')}
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-light" style={{ color: theme.textSecondary }}>
                {t('admin.noContactsYet')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead style={{ backgroundColor: theme.backgroundSecondary, borderColor: theme.border }} className="border-b">
                  <tr>
                    <th className="px-4 py-3 font-light">{t('admin.tableHeaders.name')}</th>
                    <th className="px-4 py-3 font-light">{t('admin.tableHeaders.email')}</th>
                    <th className="px-4 py-3 font-light">{t('admin.tableHeaders.message')}</th>
                    <th className="px-4 py-3 font-light">{t('admin.tableHeaders.date')}</th>
                    <th className="px-4 py-3 font-light">{t('admin.tableHeaders.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <motion.tr
                      key={contact.id}
                      className="border-b transition-colors"
                      style={{
                        borderColor: theme.border,
                        backgroundColor: !contact.read
                          ? theme.mode === 'light'
                            ? 'rgba(59, 130, 246, 0.05)'
                            : 'rgba(59, 130, 246, 0.1)'
                          : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.backgroundSecondary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = !contact.read
                          ? theme.mode === 'light'
                            ? 'rgba(59, 130, 246, 0.05)'
                            : 'rgba(59, 130, 246, 0.1)'
                          : 'transparent';
                      }}
                    >
                      <td className="px-4 py-3 font-semibold">{contact.name}</td>
                      <td className="px-4 py-3">{contact.email}</td>
                      <td className="px-4 py-3 max-w-xs truncate">
                        {contact.message}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: theme.textSecondary }}>
                        {contact.timestamp.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <motion.a
                          whileHover={{ scale: 1.05 }}
                          href={`mailto:${contact.email}`}
                          className="px-3 py-1 text-xs rounded inline-block transition-colors"
                          style={{
                            border: `1px solid ${theme.border}`,
                            color: theme.text,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme.backgroundSecondary;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {t('admin.buttons.reply')}
                        </motion.a>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteContact(contact.id)}
                          className="px-3 py-1 text-xs rounded transition-colors"
                          style={{
                            backgroundColor: theme.mode === 'light' ? '#fee2e2' : 'rgba(239, 68, 68, 0.2)',
                            color: theme.mode === 'light' ? '#b91c1c' : '#ff6b6b',
                          }}
                        >
                          {t('admin.buttons.delete')}
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* About Tab */}
      {tab === 'about' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <h3 className="text-lg font-light mb-4">{t('nav.about')} Content</h3>
          {loading ? (
            <div className="text-center py-8" style={{ color: theme.textSecondary }}>
              {t('admin.loading')}
            </div>
          ) : (
            <form onSubmit={handleSubmitAboutForm} className="space-y-6">
              {/* Main Description */}
              <div>
                <h4
                  className="text-md font-light mb-3 border-b pb-2"
                  style={{ borderColor: theme.border }}
                >
                  Main Description
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-light mb-2">English</label>
                    <textarea
                      value={aboutFormData.descriptionEn}
                      onChange={(e) =>
                        setAboutFormData({ ...aboutFormData, descriptionEn: e.target.value })
                      }
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: theme.border,
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.backgroundSecondary,
                        color: theme.text,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${
                          theme.mode === 'light'
                            ? 'rgba(139, 115, 85, 0.1)'
                            : 'rgba(212, 165, 116, 0.1)'
                        }`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light mb-2">Hebrew</label>
                    <textarea
                      value={aboutFormData.descriptionHe}
                      onChange={(e) =>
                        setAboutFormData({ ...aboutFormData, descriptionHe: e.target.value })
                      }
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: theme.border,
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.backgroundSecondary,
                        color: theme.text,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${
                          theme.mode === 'light'
                            ? 'rgba(139, 115, 85, 0.1)'
                            : 'rgba(212, 165, 116, 0.1)'
                        }`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                className="flex gap-4 pt-4 border-t transition-colors"
                style={{ borderColor: theme.border }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2 rounded-lg font-light transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: theme.primary,
                    color: theme.mode === 'light' ? '#ffffff' : theme.text,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.primaryHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.primary;
                  }}
                >
                  {formLoading ? t('admin.buttons.saving') : 'Save About Section'}
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      )}

      {/* Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto"
            style={{
              backgroundColor: theme.cardBg,
              color: theme.text,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-light mb-6">
              {editingId ? t('admin.buttons.update') : t('admin.addPainting')}
            </h2>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-light mb-2">{t('admin.formLabels.titleEn')}</label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) =>
                      setFormData({ ...formData, titleEn: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                    style={{
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${
                        theme.mode === 'light'
                          ? 'rgba(139, 115, 85, 0.1)'
                          : 'rgba(212, 165, 116, 0.1)'
                      }`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-light mb-2">{t('admin.formLabels.titleHe')}</label>
                  <input
                    type="text"
                    value={formData.titleHe}
                    onChange={(e) =>
                      setFormData({ ...formData, titleHe: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                    style={{
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${
                        theme.mode === 'light'
                          ? 'rgba(139, 115, 85, 0.1)'
                          : 'rgba(212, 165, 116, 0.1)'
                      }`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-light mb-2">
                  {t('admin.formLabels.descriptionEn')}
                </label>
                <textarea
                  value={formData.descriptionEn}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionEn: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                  style={{
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${
                      theme.mode === 'light'
                        ? 'rgba(139, 115, 85, 0.1)'
                        : 'rgba(212, 165, 116, 0.1)'
                    }`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-light mb-2">
                  {t('admin.formLabels.descriptionHe')}
                </label>
                <textarea
                  value={formData.descriptionHe}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionHe: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                  style={{
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${
                      theme.mode === 'light'
                        ? 'rgba(139, 115, 85, 0.1)'
                        : 'rgba(212, 165, 116, 0.1)'
                    }`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-light mb-2">Image Upload</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUploadToGithub}
                  className="hidden"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.parentElement?.classList.add('border-blue-500', 'bg-blue-50');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.parentElement?.classList.remove('border-blue-500', 'bg-blue-50');
                  }}
                />
                <motion.div
                  whileHover={{ borderColor: theme.primary }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const event = {
                        target: { files: e.dataTransfer.files },
                      } as unknown as React.ChangeEvent<HTMLInputElement>;
                      handleFileUploadToGithub(event);
                    }
                  }}
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.backgroundSecondary,
                  }}
                >
                  {formData.imageUrl ? (
                    <div className="space-y-3">
                      <img
                        src={getImageUrl(formData.imageUrl)}
                        alt="Preview"
                        className="w-full h-48 object-contain rounded"
                      />
                      <div>
                        <p className="text-sm font-light mb-1" style={{ color: '#22c55e' }}>
                          ✓ Image uploaded
                        </p>
                        <p className="text-xs" style={{ color: theme.textSecondary }}>
                          Click to replace
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg mb-2">📸</p>
                      <p className="text-sm font-light mb-1">Drag and drop your image here</p>
                      <p className="text-xs" style={{ color: theme.textSecondary }}>
                        or click to browse
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>

              <div>
                <label className="block text-sm font-light mb-2">{t('admin.tableHeaders.year')}</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                  style={{
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${
                      theme.mode === 'light'
                        ? 'rgba(139, 115, 85, 0.1)'
                        : 'rgba(212, 165, 116, 0.1)'
                    }`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Closeup Images Section */}
              <div className="border-t pt-4" style={{ borderColor: theme.border }}>
                <h3 className="text-md font-light mb-4">Image Closeups (Optional)</h3>
                <p className="text-xs mb-4" style={{ color: theme.textSecondary }}>
                  Add detailed closeup images to showcase fine details of the artwork
                </p>

                <input
                  ref={closeupInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAddCloseup}
                  className="hidden"
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => closeupInputRef.current?.click()}
                  disabled={closeupLoading}
                  className="w-full mb-4 px-4 py-2 rounded-lg font-light transition-colors disabled:opacity-50"
                  style={{
                    border: `1px solid ${theme.border}`,
                    color: theme.text,
                    backgroundColor: theme.backgroundSecondary,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.mode === 'light' ? 'rgba(139, 115, 85, 0.05)' : 'rgba(212, 165, 116, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.backgroundSecondary;
                  }}
                >
                  {closeupLoading ? '⏳ Uploading...' : '+ Add Closeup Images'}
                </motion.button>

                {formData.closeups && formData.closeups.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {formData.closeups.map((closeup) => (
                      <motion.div
                        key={closeup.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative rounded-lg overflow-hidden"
                        style={{
                          border: `1px solid ${theme.border}`,
                          backgroundColor: theme.backgroundSecondary,
                        }}
                      >
                        <img
                          src={getImageUrl(closeup.imageUrl)}
                          alt="closeup"
                          className="w-full h-24 object-cover"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => handleRemoveCloseup(closeup.id)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.9)',
                            color: '#ffffff',
                          }}
                        >
                          ✕
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2 rounded-lg font-light transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: theme.primary,
                    color: theme.mode === 'light' ? '#ffffff' : theme.text,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.primaryHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.primary;
                  }}
                >
                  {formLoading ? t('admin.buttons.saving') : editingId ? t('admin.buttons.update') : t('admin.buttons.add')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 rounded-lg font-light transition-colors"
                  style={{
                    border: `1px solid ${theme.border}`,
                    color: theme.text,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.backgroundSecondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {t('admin.buttons.cancel')}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

    </motion.div>
  );
};
