import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { getPaintings, deletePainting, addPainting, updatePainting } from '../services/paintingService';
import { getContacts, deleteContact } from '../services/contactService';
import { getAbout, updateAbout } from '../services/aboutService';
import { Painting } from '../types/painting';
import { Contact } from '../types/contact';
import { About } from '../types/about';

interface FormData {
  titleEn: string;
  titleHe: string;
  descriptionEn: string;
  descriptionHe: string;
  imageUrl: string;
  image: File | null;
  category: string;
  year: number;
  dimensions: string;
  dimensionWidth: string;
  dimensionHeight: string;
  dimensionUnit: string;
}

interface AboutFormData {
  descriptionEn: string;
  descriptionHe: string;
  contemporaryTitleEn: string;
  contemporaryTitleHe: string;
  contemporaryDescEn: string;
  contemporaryDescHe: string;
  authenticTitleEn: string;
  authenticTitleHe: string;
  authenticDescEn: string;
  authenticDescHe: string;
  accessibleTitleEn: string;
  accessibleTitleHe: string;
  accessibleDescEn: string;
  accessibleDescHe: string;
}

export const AdminPanel = () => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'paintings' | 'contacts' | 'about'>('paintings');
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [about, setAbout] = useState<About | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    titleEn: '',
    titleHe: '',
    descriptionEn: '',
    descriptionHe: '',
    imageUrl: '',
    image: null,
    category: 'abstract',
    year: new Date().getFullYear(),
    dimensions: '',
    dimensionWidth: '',
    dimensionHeight: '',
    dimensionUnit: 'cm',
  });
  const [aboutFormData, setAboutFormData] = useState<AboutFormData>({
    descriptionEn: '',
    descriptionHe: '',
    contemporaryTitleEn: '',
    contemporaryTitleHe: '',
    contemporaryDescEn: '',
    contemporaryDescHe: '',
    authenticTitleEn: '',
    authenticTitleHe: '',
    authenticDescEn: '',
    authenticDescHe: '',
    accessibleTitleEn: '',
    accessibleTitleHe: '',
    accessibleDescEn: '',
    accessibleDescHe: '',
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
        setAbout(aboutData);
        setAboutFormData({
          descriptionEn: aboutData.description.en,
          descriptionHe: aboutData.description.he,
          contemporaryTitleEn: aboutData.features.contemporary.title.en,
          contemporaryTitleHe: aboutData.features.contemporary.title.he,
          contemporaryDescEn: aboutData.features.contemporary.description.en,
          contemporaryDescHe: aboutData.features.contemporary.description.he,
          authenticTitleEn: aboutData.features.authentic.title.en,
          authenticTitleHe: aboutData.features.authentic.title.he,
          authenticDescEn: aboutData.features.authentic.description.en,
          authenticDescHe: aboutData.features.authentic.description.he,
          accessibleTitleEn: aboutData.features.accessible.title.en,
          accessibleTitleHe: aboutData.features.accessible.title.he,
          accessibleDescEn: aboutData.features.accessible.description.en,
          accessibleDescHe: aboutData.features.accessible.description.he,
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
      image: null,
      category: 'abstract',
      year: new Date().getFullYear(),
      dimensions: '',
      dimensionWidth: '',
      dimensionHeight: '',
      dimensionUnit: 'cm',
    });
    setShowForm(true);
  };

  const handleEditClick = (painting: Painting) => {
    setEditingId(painting.id);
    // Parse existing dimensions string (e.g., "100x200cm" -> width: 100, height: 200, unit: cm)
    let dimensionWidth = '';
    let dimensionHeight = '';
    let dimensionUnit = 'cm';

    if (painting.dimensions) {
      const dimensionMatch = painting.dimensions.match(/^(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)(?:\s*([a-z%]+))?$/i);
      if (dimensionMatch) {
        dimensionWidth = dimensionMatch[1];
        dimensionHeight = dimensionMatch[2];
        if (dimensionMatch[3]) {
          dimensionUnit = dimensionMatch[3];
        }
      }
    }

    setFormData({
      titleEn: painting.title.en,
      titleHe: painting.title.he,
      descriptionEn: painting.description.en,
      descriptionHe: painting.description.he,
      imageUrl: painting.imageUrl,
      image: null,
      category: painting.category,
      year: painting.year,
      dimensions: painting.dimensions,
      dimensionWidth,
      dimensionHeight,
      dimensionUnit,
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

      // Build dimensions string from separate fields
      let dimensions = '';
      if (formData.dimensionWidth || formData.dimensionHeight) {
        const width = formData.dimensionWidth || 0;
        const height = formData.dimensionHeight || 0;
        const unit = formData.dimensionUnit || 'cm';
        dimensions = `${width}x${height}${unit}`;
      }

      if (editingId) {
        await updatePainting(editingId, {
          title: { en: formData.titleEn, he: formData.titleHe },
          description: { en: formData.descriptionEn, he: formData.descriptionHe },
          imageUrl,
          category: formData.category,
          year: formData.year,
          dimensions,
        });
        const updatedPaintings = paintings.map((p) =>
          p.id === editingId
            ? {
                ...p,
                title: { en: formData.titleEn, he: formData.titleHe },
                description: { en: formData.descriptionEn, he: formData.descriptionHe },
                imageUrl,
                category: formData.category,
                year: formData.year,
                dimensions,
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
            category: formData.category,
            year: formData.year,
            dimensions,
            image: null,
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
            title: {
              en: aboutFormData.contemporaryTitleEn,
              he: aboutFormData.contemporaryTitleHe,
            },
            description: {
              en: aboutFormData.contemporaryDescEn,
              he: aboutFormData.contemporaryDescHe,
            },
          },
          authentic: {
            title: {
              en: aboutFormData.authenticTitleEn,
              he: aboutFormData.authenticTitleHe,
            },
            description: {
              en: aboutFormData.authenticDescEn,
              he: aboutFormData.authenticDescHe,
            },
          },
          accessible: {
            title: {
              en: aboutFormData.accessibleTitleEn,
              he: aboutFormData.accessibleTitleHe,
            },
            description: {
              en: aboutFormData.accessibleDescEn,
              he: aboutFormData.accessibleDescHe,
            },
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg shadow-lg p-8"
    >
      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setTab('paintings')}
          className={`pb-3 px-4 font-light tracking-wide transition-colors ${
            tab === 'paintings'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('admin.paintings')}
        </button>
        <button
          onClick={() => setTab('contacts')}
          className={`pb-3 px-4 font-light tracking-wide transition-colors ${
            tab === 'contacts'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('admin.contacts')}
        </button>
        <button
          onClick={() => setTab('about')}
          className={`pb-3 px-4 font-light tracking-wide transition-colors ${
            tab === 'about'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
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
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddClick}
            className="mb-6 px-6 py-2 bg-black text-white rounded-lg font-light hover:bg-gray-800"
          >
            + {t('admin.addPainting')}
          </motion.button>

          {loading ? (
            <div className="text-center py-8 text-gray-500">{t('admin.loading')}</div>
          ) : paintings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('admin.noPaintingsYet')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-light">Image</th>
                    <th className="px-4 py-3 font-light">{t('admin.tableHeaders.title')}</th>
                    <th className="px-4 py-3 font-light">{t('admin.tableHeaders.year')}</th>
                    <th className="px-4 py-3 font-light">{t('admin.tableHeaders.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paintings.map((painting) => (
                    <motion.tr
                      key={painting.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <img
                          src={painting.imageUrl}
                          alt={painting.title.en}
                          className="h-12 w-12 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23f0f0f0" width="48" height="48"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">{painting.title.en}</td>
                      <td className="px-4 py-3">{painting.year}</td>
                      <td className="px-4 py-3 space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditClick(painting)}
                          className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                        >
                          {t('admin.edit')}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeletePainting(painting.id)}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
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
            <div className="text-center py-8 text-gray-500">{t('admin.loading')}</div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-light">
                {t('admin.noContactsYet')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
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
                      className={`border-b border-gray-200 hover:bg-gray-50 ${
                        !contact.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold">{contact.name}</td>
                      <td className="px-4 py-3">{contact.email}</td>
                      <td className="px-4 py-3 max-w-xs truncate">
                        {contact.message}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {contact.timestamp.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <motion.a
                          whileHover={{ scale: 1.05 }}
                          href={`mailto:${contact.email}`}
                          className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 inline-block"
                        >
                          {t('admin.buttons.reply')}
                        </motion.a>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteContact(contact.id)}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
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
            <div className="text-center py-8 text-gray-500">{t('admin.loading')}</div>
          ) : (
            <form onSubmit={handleSubmitAboutForm} className="space-y-6">
              {/* Main Description */}
              <div>
                <h4 className="text-md font-light mb-3 border-b pb-2">Main Description</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-light mb-2">English</label>
                    <textarea
                      value={aboutFormData.descriptionEn}
                      onChange={(e) =>
                        setAboutFormData({ ...aboutFormData, descriptionEn: e.target.value })
                      }
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              </div>

              {/* Contemporary Feature */}
              <div>
                <h4 className="text-md font-light mb-3 border-b pb-2">Contemporary Feature</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-light mb-2">Title (EN)</label>
                    <input
                      type="text"
                      value={aboutFormData.contemporaryTitleEn}
                      onChange={(e) =>
                        setAboutFormData({ ...aboutFormData, contemporaryTitleEn: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light mb-2">Title (HE)</label>
                    <input
                      type="text"
                      value={aboutFormData.contemporaryTitleHe}
                      onChange={(e) =>
                        setAboutFormData({ ...aboutFormData, contemporaryTitleHe: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light mb-2">Description (EN)</label>
                    <textarea
                      value={aboutFormData.contemporaryDescEn}
                      onChange={(e) =>
                        setAboutFormData({ ...aboutFormData, contemporaryDescEn: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light mb-2">Description (HE)</label>
                    <textarea
                      value={aboutFormData.contemporaryDescHe}
                      onChange={(e) =>
                        setAboutFormData({ ...aboutFormData, contemporaryDescHe: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              </div>

              {/* Authentic Feature */}
              <div>
                <h4 className="text-md font-light mb-3 border-b pb-2">Authentic Feature</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-light mb-2">Title (EN)</label>
                    <input
                      type="text"
                      value={aboutFormData.authenticTitleEn}
                      onChange={(e) =>
                        setAboutFormData({ ...aboutFormData, authenticTitleEn: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light mb-2">Title (HE)</label>
                    <input
                      type="text"
                      value={aboutFormData.authenticTitleHe}
                      onChange={(e) =>
                        setAboutFormData({ ...aboutFormData, authenticTitleHe: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light mb-2">Description (EN)</label>
                    <textarea
                      value={aboutFormData.authenticDescEn}
                      onChange={(e) =>
                        setAboutFormData({ ...aboutFormData, authenticDescEn: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light mb-2">Description (HE)</label>
                    <textarea
                      value={aboutFormData.authenticDescHe}
                      onChange={(e) =>
                        setAboutFormData({ ...aboutFormData, authenticDescHe: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              </div>

              {/* Accessible Feature */}
              <div>
                <h4 className="text-md font-light mb-3 border-b pb-2">Accessible Feature</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-light mb-2">Title (EN)</label>
                    <input
                      type="text"
                      value={aboutFormData.accessibleTitleEn}
                      onChange={(e) =>
                        setAboutFormData({ ...aboutFormData, accessibleTitleEn: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light mb-2">Title (HE)</label>
                    <input
                      type="text"
                      value={aboutFormData.accessibleTitleHe}
                      onChange={(e) =>
                        setAboutFormData({ ...aboutFormData, accessibleTitleHe: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light mb-2">Description (EN)</label>
                    <textarea
                      value={aboutFormData.accessibleDescEn}
                      onChange={(e) =>
                        setAboutFormData({ ...aboutFormData, accessibleDescEn: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light mb-2">Description (HE)</label>
                    <textarea
                      value={aboutFormData.accessibleDescHe}
                      onChange={(e) =>
                        setAboutFormData({ ...aboutFormData, accessibleDescHe: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-black text-white py-2 rounded-lg font-light hover:bg-gray-800 disabled:opacity-50 transition-colors"
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-light mb-2">{t('admin.formLabels.imageUrl')}</label>
                <input
                  type="text"
                  placeholder={t('admin.formLabels.pasteUrl')}
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {t('admin.formLabels.helpText')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-light mb-2">{t('admin.formLabels.category')}</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="abstract">{t('admin.formLabels.categories.abstract')}</option>
                    <option value="portrait">{t('admin.formLabels.categories.portrait')}</option>
                    <option value="landscape">{t('admin.formLabels.categories.landscape')}</option>
                    <option value="still-life">{t('admin.formLabels.categories.stillLife')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-light mb-2">{t('admin.tableHeaders.year')}</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-light mb-2">{t('admin.formLabels.dimensions')}</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-light mb-1 text-gray-600">{t('admin.formLabels.width')}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.dimensionWidth || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, dimensionWidth: e.target.value })
                      }
                      placeholder="e.g., 100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-light mb-1 text-gray-600">{t('admin.formLabels.height')}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.dimensionHeight || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, dimensionHeight: e.target.value })
                      }
                      placeholder="e.g., 100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-light mb-1 text-gray-600">{t('admin.formLabels.unit')}</label>
                    <select
                      value={formData.dimensionUnit || 'cm'}
                      onChange={(e) =>
                        setFormData({ ...formData, dimensionUnit: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="cm">cm</option>
                      <option value="in">in</option>
                      <option value="mm">mm</option>
                      <option value="m">m</option>
                      <option value="px">px</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Format: {formData.dimensionWidth || '?'} × {formData.dimensionHeight || '?'} {formData.dimensionUnit || 'cm'}
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-black text-white py-2 rounded-lg font-light hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {formLoading ? t('admin.buttons.saving') : editingId ? t('admin.buttons.update') : t('admin.buttons.add')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg font-light hover:bg-gray-50 transition-colors"
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
